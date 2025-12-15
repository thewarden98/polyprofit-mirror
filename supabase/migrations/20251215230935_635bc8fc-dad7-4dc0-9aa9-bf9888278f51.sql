-- PolyForge Database Schema

-- Enum for whale categories
CREATE TYPE public.whale_category AS ENUM ('politics', 'crypto', 'sports', 'entertainment', 'general');

-- Enum for copy status
CREATE TYPE public.copy_status AS ENUM ('active', 'completed', 'cancelled');

-- Enum for position outcome
CREATE TYPE public.position_outcome AS ENUM ('pending', 'won', 'lost');

-- Whales table - stores whale profiles and performance metrics
CREATE TABLE public.whales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  category whale_category DEFAULT 'general',
  total_volume DECIMAL(20, 2) DEFAULT 0,
  total_profit DECIMAL(20, 2) DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table - linked to auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  wallet_address TEXT UNIQUE,
  username TEXT,
  avatar_url TEXT,
  total_locked DECIMAL(20, 2) DEFAULT 0,
  total_profit DECIMAL(20, 2) DEFAULT 0,
  is_whale BOOLEAN DEFAULT false,
  whale_id UUID REFERENCES public.whales(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Copies table - stores active copy positions
CREATE TABLE public.copies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  whale_id UUID NOT NULL REFERENCES public.whales(id) ON DELETE CASCADE,
  locked_amount DECIMAL(20, 2) NOT NULL,
  current_value DECIMAL(20, 2) NOT NULL,
  profit_loss DECIMAL(20, 2) DEFAULT 0,
  whale_share_percent DECIMAL(5, 2) NOT NULL DEFAULT 15,
  platform_fee_percent DECIMAL(5, 2) NOT NULL DEFAULT 5,
  duration_days INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status copy_status DEFAULT 'active',
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mirrored positions table - individual mirrored bets
CREATE TABLE public.mirrored_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  copy_id UUID NOT NULL REFERENCES public.copies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  whale_id UUID NOT NULL REFERENCES public.whales(id),
  market_id TEXT NOT NULL,
  market_title TEXT NOT NULL,
  market_category whale_category DEFAULT 'general',
  position_side TEXT NOT NULL, -- 'yes' or 'no'
  position_size DECIMAL(20, 2) NOT NULL,
  entry_price DECIMAL(10, 4) NOT NULL,
  current_price DECIMAL(10, 4),
  profit_loss DECIMAL(20, 2) DEFAULT 0,
  outcome position_outcome DEFAULT 'pending',
  polymarket_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Whale earnings table - tracks earnings from followers
CREATE TABLE public.whale_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whale_id UUID NOT NULL REFERENCES public.whales(id) ON DELETE CASCADE,
  copy_id UUID NOT NULL REFERENCES public.copies(id) ON DELETE CASCADE,
  follower_user_id UUID NOT NULL,
  earned_amount DECIMAL(20, 2) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.whales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mirrored_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whale_earnings ENABLE ROW LEVEL SECURITY;

-- Whales are publicly readable
CREATE POLICY "Whales are publicly readable" 
ON public.whales FOR SELECT 
USING (true);

-- Profiles policies
CREATE POLICY "Profiles are publicly readable" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Copies policies
CREATE POLICY "Users can view their own copies" 
ON public.copies FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own copies" 
ON public.copies FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own copies" 
ON public.copies FOR UPDATE 
USING (auth.uid() = user_id);

-- Mirrored positions policies
CREATE POLICY "Users can view their own positions" 
ON public.mirrored_positions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own positions" 
ON public.mirrored_positions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Whale earnings policies
CREATE POLICY "Whales can view their own earnings" 
ON public.whale_earnings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.whale_id = whale_earnings.whale_id
  )
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_whales_updated_at
BEFORE UPDATE ON public.whales
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_copies_updated_at
BEFORE UPDATE ON public.copies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mirrored_positions_updated_at
BEFORE UPDATE ON public.mirrored_positions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX idx_whales_category ON public.whales(category);
CREATE INDEX idx_whales_win_rate ON public.whales(win_rate DESC);
CREATE INDEX idx_whales_follower_count ON public.whales(follower_count DESC);
CREATE INDEX idx_copies_user_id ON public.copies(user_id);
CREATE INDEX idx_copies_whale_id ON public.copies(whale_id);
CREATE INDEX idx_copies_status ON public.copies(status);
CREATE INDEX idx_mirrored_positions_copy_id ON public.mirrored_positions(copy_id);
CREATE INDEX idx_mirrored_positions_user_id ON public.mirrored_positions(user_id);
