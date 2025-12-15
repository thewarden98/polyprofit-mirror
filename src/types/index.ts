export type WhaleCategory = 'politics' | 'crypto' | 'sports' | 'entertainment' | 'general';
export type CopyStatus = 'active' | 'completed' | 'cancelled';
export type PositionOutcome = 'pending' | 'won' | 'lost';

export interface Whale {
  id: string;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  category: WhaleCategory;
  total_volume: number;
  total_profit: number;
  win_rate: number;
  total_trades: number;
  winning_trades: number;
  follower_count: number;
  is_verified: boolean;
  badges: string[];
  created_at: string;
  updated_at: string;
}

export interface Copy {
  id: string;
  user_id: string;
  whale_id: string;
  locked_amount: number;
  current_value: number;
  profit_loss: number;
  whale_share_percent: number;
  platform_fee_percent: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: CopyStatus;
  transaction_hash: string | null;
  created_at: string;
  updated_at: string;
  whale?: Whale;
}

export interface MirroredPosition {
  id: string;
  copy_id: string;
  user_id: string;
  whale_id: string;
  market_id: string;
  market_title: string;
  market_category: WhaleCategory;
  position_side: 'yes' | 'no';
  position_size: number;
  entry_price: number;
  current_price: number | null;
  profit_loss: number;
  outcome: PositionOutcome;
  polymarket_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  wallet_address: string | null;
  username: string | null;
  avatar_url: string | null;
  total_locked: number;
  total_profit: number;
  is_whale: boolean;
  whale_id: string | null;
  created_at: string;
  updated_at: string;
}

// Mock data types for demo
export interface PerformanceDataPoint {
  date: string;
  value: number;
}
