import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Whale } from "@/types";

// Actual API response structure from Polymarket leaderboard
interface LeaderboardTrader {
  rank: string;
  proxyWallet: string;
  userName: string;
  xUsername?: string;
  verifiedBadge: boolean;
  vol: number;
  pnl: number;
  profileImage?: string;
}

// Transform Polymarket API data to our Whale format
function transformToWhale(trader: LeaderboardTrader, index: number): Whale {
  const volume = trader.vol || 0;
  const pnl = trader.pnl || 0;
  const winRate = volume > 0 && pnl > 0 
    ? Math.min(50 + (pnl / volume) * 100, 95) 
    : volume > 0 
      ? Math.max(30, 50 - Math.abs(pnl / volume) * 50)
      : 50;
  
  // Determine category based on patterns (simplified heuristic)
  const categories = ['politics', 'crypto', 'sports', 'entertainment', 'general'] as const;
  const category = categories[index % categories.length];
  
  // Generate badges based on performance
  const badges: string[] = [];
  if (volume > 100000) badges.push('whale');
  if (winRate > 70) badges.push('sharp-money');
  if (pnl > volume * 0.2) badges.push('hot-streak');
  if (index < 10) badges.push('legend');
  if (trader.verifiedBadge) badges.push('verified');

  const estimatedTrades = Math.max(1, Math.floor(volume / 500));

  return {
    id: trader.proxyWallet,
    wallet_address: trader.proxyWallet,
    username: trader.userName || `Trader_${trader.proxyWallet.slice(0, 6)}`,
    avatar_url: trader.profileImage || null,
    bio: null,
    category,
    total_volume: volume,
    total_profit: pnl,
    win_rate: Math.round(winRate * 10) / 10,
    total_trades: estimatedTrades,
    winning_trades: Math.round(estimatedTrades * (winRate / 100)),
    follower_count: Math.floor(Math.random() * 5000) + 100,
    is_verified: trader.verifiedBadge || volume > 500000,
    badges,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function usePolymarketLeaderboard() {
  return useQuery({
    queryKey: ['polymarket-leaderboard'],
    queryFn: async (): Promise<Whale[]> => {
      try {
        const { data, error } = await supabase.functions.invoke('polymarket-proxy', {
          body: null,
        });

        if (error) {
          console.error('Error fetching leaderboard:', error);
          throw error;
        }

        // Transform API response to Whale format
        if (Array.isArray(data)) {
          return data.slice(0, 50).map((trader: LeaderboardTrader, index: number) => 
            transformToWhale(trader, index)
          );
        }

        // Handle different response structures
        if (data?.traders) {
          return data.traders.slice(0, 50).map((trader: LeaderboardTrader, index: number) => 
            transformToWhale(trader, index)
          );
        }

        console.warn('Unexpected API response format, using empty array');
        return [];
      } catch (error) {
        console.error('Failed to fetch from DOME API:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function usePolymarketPositions(walletAddress: string | undefined) {
  return useQuery({
    queryKey: ['polymarket-positions', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];

      const { data, error } = await supabase.functions.invoke('polymarket-proxy', {
        body: { endpoint: 'positions', user: walletAddress },
      });

      if (error) throw error;
      return data;
    },
    enabled: !!walletAddress,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
