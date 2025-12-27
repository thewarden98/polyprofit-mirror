import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PolymarketEvent } from "@/hooks/usePolymarket";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, Clock, History } from "lucide-react";
import { formatNumber } from "@/data/whaleHelpers";
import { cn } from "@/lib/utils";

interface ForYouSectionProps {
  onMarketClick: (market: PolymarketEvent) => void;
}

export function ForYouSection({ onMarketClick }: ForYouSectionProps) {
  const { getTopSearches, hasHistory, getRecentSearches } = useSearchHistory();
  const topSearches = getTopSearches(3);
  const recentSearches = getRecentSearches(3);

  // Fetch trending markets
  const { data: trendingMarkets, isLoading: trendingLoading } = useQuery({
    queryKey: ['polymarket-trending'],
    queryFn: async (): Promise<PolymarketEvent[]> => {
      const { data, error } = await supabase.functions.invoke('polymarket-proxy', {
        body: { endpoint: 'trending' },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return Array.isArray(data) ? data.slice(0, 6) : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch personalized markets based on user's search history
  const { data: personalizedMarkets, isLoading: personalizedLoading } = useQuery({
    queryKey: ['polymarket-personalized', topSearches],
    queryFn: async (): Promise<PolymarketEvent[]> => {
      if (topSearches.length === 0) return [];

      // Fetch markets for each top search term
      const results = await Promise.all(
        topSearches.map(async (query) => {
          try {
            const { data, error } = await supabase.functions.invoke('polymarket-proxy', {
              body: { endpoint: 'markets', query },
            });

            if (error || data?.error) return [];
            return Array.isArray(data) ? data.slice(0, 3) : [];
          } catch {
            return [];
          }
        })
      );

      // Flatten and deduplicate by ID
      const allMarkets = results.flat();
      const uniqueMarkets = allMarkets.filter(
        (market, index, self) => index === self.findIndex(m => m.id === market.id)
      );

      return uniqueMarkets.slice(0, 6);
    },
    enabled: hasHistory && topSearches.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  const isLoading = trendingLoading || personalizedLoading;
  const hasPersonalized = personalizedMarkets && personalizedMarkets.length > 0;

  return (
    <div className="space-y-6 mb-8">
      {/* For You Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold">For You</h2>
          <p className="text-sm text-muted-foreground">
            {hasHistory 
              ? "Markets based on your interests" 
              : "Trending markets right now"}
          </p>
        </div>
      </div>

      {/* User's interests pills */}
      {hasHistory && topSearches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <History className="w-3 h-3" /> Your interests:
          </span>
          {topSearches.map((search) => (
            <Badge key={search} variant="secondary" className="text-xs">
              {search}
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading recommendations...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Personalized section */}
          {hasPersonalized && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Based on your searches</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {personalizedMarkets.map((market) => (
                  <ForYouCard 
                    key={market.id} 
                    market={market} 
                    onClick={() => onMarketClick(market)}
                    variant="personalized"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Trending section */}
          {trendingMarkets && trendingMarkets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-success" />
                <span>Trending now</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {trendingMarkets.map((market) => (
                  <ForYouCard 
                    key={market.id} 
                    market={market} 
                    onClick={() => onMarketClick(market)}
                    variant="trending"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ForYouCardProps {
  market: PolymarketEvent;
  onClick: () => void;
  variant: "personalized" | "trending";
}

function ForYouCard({ market, onClick, variant }: ForYouCardProps) {
  const primaryMarket = market.markets?.[0];
  let yesPrice = 0.5;
  
  if (primaryMarket?.outcomePrices) {
    try {
      const prices = Array.isArray(primaryMarket.outcomePrices) 
        ? primaryMarket.outcomePrices 
        : JSON.parse(primaryMarket.outcomePrices);
      yesPrice = parseFloat(prices[0]) || 0.5;
    } catch {
      // Use default
    }
  }

  const totalVolume = market.markets?.reduce((sum, m) => sum + (Number(m.volume) || 0), 0) || market.volume || 0;
  const isActive = market.active && !market.closed;

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all hover:border-primary/50 overflow-hidden",
        variant === "personalized" && "border-primary/20 bg-primary/5"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex gap-3">
          {(market.icon || market.image) && (
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted">
              <img 
                src={market.icon || market.image} 
                alt="" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {market.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              {isActive && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-success/10 text-success border-success/30"
                >
                  {(yesPrice * 100).toFixed(0)}% Yes
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                ${formatNumber(totalVolume)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
