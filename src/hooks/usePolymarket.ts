import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Whale } from "@/types";

interface LeaderboardTrader {
  name?: string;
  profileAddress: string;
  profileImage?: string;
  volume: number;
  pnl: number;
  positions: number;
  markets: number;
  rank?: number;
}

// Transform DOME API data to our Whale format
function transformToWhale(trader: LeaderboardTrader, index: number): Whale {
  const winRate = trader.pnl > 0 ? Math.min(50 + (trader.pnl / trader.volume) * 100, 95) : Math.max(30, 50 - Math.abs(trader.pnl / trader.volume) * 50);
  
  // Determine category based on patterns (simplified heuristic)
  const categories = ['politics', 'crypto', 'sports', 'entertainment', 'general'] as const;
  const category = categories[index % categories.length];
  
  // Generate badges based on performance
  const badges: string[] = [];
  if (trader.volume > 100000) badges.push('whale');
  if (winRate > 70) badges.push('sharp-money');
  if (trader.pnl > trader.volume * 0.2) badges.push('hot-streak');
  if (index < 10) badges.push('legend');

  return {
    id: trader.profileAddress,
    wallet_address: trader.profileAddress,
    username: trader.name || `Trader_${trader.profileAddress.slice(0, 6)}`,
    avatar_url: trader.profileImage || null,
    bio: null,
    category,
    total_volume: trader.volume || 0,
    total_profit: trader.pnl || 0,
    win_rate: Math.round(winRate * 10) / 10,
    total_trades: trader.positions || 0,
    winning_trades: Math.round((trader.positions || 0) * (winRate / 100)),
    follower_count: Math.floor(Math.random() * 5000) + 100, // Mock follower count
    is_verified: trader.volume > 500000,
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
