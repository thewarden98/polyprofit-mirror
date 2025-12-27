import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Whale, PolymarketTrader, TraderPosition } from "@/types";

// Transform Polymarket API data to our Whale format
function transformToWhale(trader: PolymarketTrader, index: number): Whale {
  // Handle various field names from different API responses
  const volume = trader.volume_amount || trader.profile_volume || trader.vol || 0;
  const pnl = trader.profile_profit || trader.pnl || 0;
  const portfolioValue = trader.profile_value || 0;
  const rank = typeof trader.rank === 'string' ? parseInt(trader.rank) : (trader.rank || trader.volume_position || index + 1);
  
  // Calculate win rate based on profit ratio
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
  if (volume > 1000000) badges.push('mega-whale');
  else if (volume > 100000) badges.push('whale');
  if (winRate > 75) badges.push('sharp-money');
  else if (winRate > 65) badges.push('consistent');
  if (pnl > volume * 0.3) badges.push('hot-streak');
  else if (pnl > volume * 0.1) badges.push('profitable');
  if (rank <= 10) badges.push('legend');
  else if (rank <= 50) badges.push('top-50');
  if (trader.verifiedBadge) badges.push('verified');
  if (portfolioValue > 100000) badges.push('big-portfolio');

  // Get username from various possible fields
  const username = trader.name || trader.userName || trader.pseudonym || null;

  // Open/closed positions
  const openPositions = trader.openPositionCount || 0;
  const closedPositions = trader.closedPositionCount || 0;
  const totalPositions = trader.totalPositions || trader.marketsTraded || openPositions + closedPositions;

  return {
    id: trader.proxyWallet,
    wallet_address: trader.proxyWallet,
    username,
    avatar_url: trader.profileImageOptimized || trader.profileImage || null,
    bio: trader.bio || null,
    category,
    total_volume: volume,
    total_profit: pnl,
    portfolio_value: portfolioValue,
    win_rate: Math.round(winRate * 10) / 10,
    total_trades: totalPositions,
    open_positions: openPositions,
    closed_positions: closedPositions,
    winning_trades: Math.round(totalPositions * (winRate / 100)),
    follower_count: 0, // Not available from API
    is_verified: trader.verifiedBadge || false,
    badges,
    rank,
    x_username: trader.xUsername || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function usePolymarketLeaderboard(limit: number = 100) {
  return useQuery({
    queryKey: ['polymarket-leaderboard', limit],
    queryFn: async (): Promise<Whale[]> => {
      console.log('Fetching Polymarket leaderboard...');
      
      const { data, error } = await supabase.functions.invoke('polymarket-proxy', {
        body: null,
      });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
      }

      console.log('Raw API response:', data);

      // Handle error response from edge function
      if (data?.error) {
        throw new Error(data.error);
      }

      // Transform API response to Whale format
      if (Array.isArray(data)) {
        console.log(`Transforming ${data.length} traders`);
        return data.map((trader: PolymarketTrader, index: number) => 
          transformToWhale(trader, index)
        );
      }

      // Handle different response structures
      if (data?.traders) {
        return data.traders.map((trader: PolymarketTrader, index: number) => 
          transformToWhale(trader, index)
        );
      }

      if (data?.leaderboard) {
        return data.leaderboard.map((trader: PolymarketTrader, index: number) => 
          transformToWhale(trader, index)
        );
      }

      console.warn('Unexpected API response format:', data);
      throw new Error('Unexpected API response format');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function usePolymarketPositions(walletAddress: string | undefined) {
  return useQuery({
    queryKey: ['polymarket-positions', walletAddress],
    queryFn: async (): Promise<TraderPosition[]> => {
      if (!walletAddress) return [];

      const { data, error } = await supabase.functions.invoke('polymarket-proxy', {
        body: { endpoint: 'positions', user: walletAddress },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return Array.isArray(data) ? data : [];
    },
    enabled: !!walletAddress,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function usePolymarketProfile(walletAddress: string | undefined) {
  return useQuery({
    queryKey: ['polymarket-profile', walletAddress],
    queryFn: async (): Promise<PolymarketTrader | null> => {
      if (!walletAddress) return null;

      const { data, error } = await supabase.functions.invoke('polymarket-proxy', {
        body: { endpoint: 'profile', user: walletAddress },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    enabled: !!walletAddress,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePolymarketSearch(query: string) {
  return useQuery({
    queryKey: ['polymarket-search', query],
    queryFn: async (): Promise<Whale[]> => {
      if (!query || query.length < 2) return [];

      // Use the search endpoint via URL params
      const searchUrl = new URL('https://uawtebnljltzzhumzzmk.supabase.co/functions/v1/polymarket-proxy');
      searchUrl.searchParams.set('endpoint', 'search');
      searchUrl.searchParams.set('query', query);

      const response = await fetch(searchUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const searchData = await response.json();
      
      if (searchData?.error) throw new Error(searchData.error);
      
      if (Array.isArray(searchData)) {
        return searchData.map((trader: PolymarketTrader, index: number) => 
          transformToWhale(trader, index)
        );
      }
      
      return [];
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds for search results
  });
}
