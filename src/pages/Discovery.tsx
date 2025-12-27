import { useState, useEffect } from "react";
import { Search, Loader2, TrendingUp, TrendingDown, Clock, DollarSign, Users, Activity, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { usePolymarketMarkets, PolymarketEvent } from "@/hooks/usePolymarket";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { formatNumber } from "@/data/whaleHelpers";
import { cn } from "@/lib/utils";
import { MarketDetailModal } from "@/components/whales/MarketDetailModal";
import { ForYouSection } from "@/components/whales/ForYouSection";

export default function Discovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "closed">("all");
  const [selectedMarket, setSelectedMarket] = useState<PolymarketEvent | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { addSearch } = useSearchHistory();

  const { data: searchResults, isLoading } = usePolymarketMarkets(debouncedSearch);

  // Track searches when user performs a search
  useEffect(() => {
    if (debouncedSearch.length >= 2 && searchResults && searchResults.length > 0) {
      addSearch(debouncedSearch);
    }
  }, [debouncedSearch, searchResults, addSearch]);

  // Filter by status
  const filteredMarkets = searchResults?.filter(market => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return market.active && !market.closed;
    if (activeTab === "closed") return market.closed;
    return true;
  }) || [];

  const showForYou = debouncedSearch.length < 2;

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8 mb-6">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            🔍 Discover Markets
          </h1>
          <p className="text-muted-foreground/80 max-w-xl">
            Search and explore live prediction markets on Polymarket. Find trending events, 
            check odds, and discover trading opportunities.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        {isLoading ? (
          <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
        ) : (
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        )}
        <Input
          placeholder="Search markets... (e.g., 'Bitcoin', 'Election', 'Super Bowl')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 py-6 text-lg bg-card text-foreground border-border/50 focus:border-primary placeholder:text-muted-foreground"
        />
      </div>

      {/* For You Section - shown when not searching */}
      {showForYou && (
        <ForYouSection onMarketClick={setSelectedMarket} />
      )}

      {/* Status Tabs - shown when searching */}
      {!showForYou && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="all" className="flex-1">All Markets</TabsTrigger>
            <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
            <TabsTrigger value="closed" className="flex-1">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Results */}
      {!showForYou && (
        isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Searching markets...</span>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-muted-foreground">No markets found</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {filteredMarkets.length} market{filteredMarkets.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredMarkets.map((market) => (
                <MarketCard 
                  key={market.id} 
                  market={market} 
                  onClick={() => setSelectedMarket(market)}
                />
              ))}
            </div>
          </div>
        )
      )}

      <MarketDetailModal
        market={selectedMarket}
        open={!!selectedMarket}
        onOpenChange={(open) => !open && setSelectedMarket(null)}
      />
    </Layout>
  );
}
function MarketCard({ market, onClick }: { market: PolymarketEvent; onClick: () => void }) {
  const isActive = market.active && !market.closed;
  const primaryMarket = market.markets?.[0];
  
  // Parse outcome prices and best bid/ask if available
  let yesPrice = 0.5;
  let noPrice = 0.5;
  let bestBid = 0;
  let bestAsk = 0;
  let spread = 0;
  
  if (primaryMarket?.outcomePrices) {
    try {
      const prices = Array.isArray(primaryMarket.outcomePrices) 
        ? primaryMarket.outcomePrices 
        : JSON.parse(primaryMarket.outcomePrices);
      yesPrice = parseFloat(prices[0]) || 0.5;
      noPrice = parseFloat(prices[1]) || 0.5;
    } catch {
      // Use defaults if parsing fails
    }
  }
  
  if (primaryMarket) {
    bestBid = primaryMarket.bestBid || 0;
    bestAsk = primaryMarket.bestAsk || 0;
    spread = primaryMarket.spread || (bestAsk - bestBid);
  }

  // Calculate total volume and liquidity from all markets in the event
  const totalVolume = market.markets?.reduce((sum, m) => sum + (Number(m.volume) || 0), 0) || market.volume || 0;
  const totalLiquidity = market.markets?.reduce((sum, m) => sum + (Number(m.liquidity) || 0), 0) || market.liquidity || 0;
  const totalOpenInterest = market.markets?.reduce((sum, m) => sum + (Number(m.openInterest) || 0), 0) || market.openInterest || 0;

  return (
    <Card 
      className={cn(
        "group overflow-hidden transition-all hover:border-primary/50 cursor-pointer",
        market.closed ? "opacity-75" : ""
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Icon/Image */}
          {(market.icon || market.image) && (
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
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
            {/* Title */}
            <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {market.title}
            </h3>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-3">
              <Badge 
                variant={isActive ? "default" : "secondary"}
                className={cn(
                  "text-xs",
                  isActive ? "bg-success/20 text-success border-success/50" : ""
                )}
              >
                {market.closed ? "Resolved" : isActive ? "Live" : "Upcoming"}
              </Badge>
              {market.endDate && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(market.endDate).toLocaleDateString()}
                </Badge>
              )}
            </div>

            {/* Best Odds - Yes/No */}
            {isActive && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-success/10 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-xs text-muted-foreground">Yes</span>
                  </div>
                  <span className="text-lg font-bold text-success">
                    {(yesPrice * 100).toFixed(1)}¢
                  </span>
                  {bestBid > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Bid: {(bestBid * 100).toFixed(1)}¢
                    </div>
                  )}
                </div>
                <div className="bg-destructive/10 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-muted-foreground">No</span>
                  </div>
                  <span className="text-lg font-bold text-destructive">
                    {(noPrice * 100).toFixed(1)}¢
                  </span>
                  {bestAsk > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Ask: {(bestAsk * 100).toFixed(1)}¢
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Spread indicator */}
            {isActive && spread > 0 && (
              <div className="text-xs text-muted-foreground mb-3">
                Spread: {(spread * 100).toFixed(2)}¢
              </div>
            )}
          </div>
        </div>

        {/* Market Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <DollarSign className="w-3 h-3" />
              <span className="text-xs">Volume</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatNumber(totalVolume)}</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <BarChart3 className="w-3 h-3" />
              <span className="text-xs">Liquidity</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatNumber(totalLiquidity)}</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Activity className="w-3 h-3" />
              <span className="text-xs">Open Int.</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatNumber(totalOpenInterest)}</span>
          </div>
        </div>

        {/* Sub-markets count if multiple */}
        {market.markets && market.markets.length > 1 && (
          <div className="mt-2 text-xs text-center text-muted-foreground">
            <Users className="w-3 h-3 inline mr-1" />
            {market.markets.length} outcomes in this market
          </div>
        )}

        {/* Click hint */}
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-1 text-sm text-muted-foreground">
          Click for details
        </div>
      </CardContent>
    </Card>
  );
}
