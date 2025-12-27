import { useState } from "react";
import { Search, Loader2, ExternalLink, TrendingUp, TrendingDown, Clock, DollarSign, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { usePolymarketMarkets, PolymarketEvent } from "@/hooks/usePolymarket";
import { useDebounce } from "@/hooks/useDebounce";
import { formatNumber } from "@/data/whaleHelpers";
import { cn } from "@/lib/utils";

export default function Discovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "closed">("all");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: searchResults, isLoading } = usePolymarketMarkets(debouncedSearch);

  // Filter by status
  const filteredMarkets = searchResults?.filter(market => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return market.active && !market.closed;
    if (activeTab === "closed") return market.closed;
    return true;
  }) || [];

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
          className="pl-12 py-6 text-lg bg-muted/30 border-border/50 focus:border-primary"
        />
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="all" className="flex-1">All Markets</TabsTrigger>
          <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
          <TabsTrigger value="closed" className="flex-1">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Results */}
      {debouncedSearch.length < 2 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">Start searching</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Enter at least 2 characters to search for markets
          </p>
        </div>
      ) : isLoading ? (
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
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}

function MarketCard({ market }: { market: PolymarketEvent }) {
  const isActive = market.active && !market.closed;
  
  // Parse outcome prices if available
  let yesPrice = 0.5;
  let noPrice = 0.5;
  if (market.markets?.[0]?.outcomePrices) {
    try {
      const prices = JSON.parse(market.markets[0].outcomePrices);
      yesPrice = parseFloat(prices[0]) || 0.5;
      noPrice = parseFloat(prices[1]) || 0.5;
    } catch {}
  }

  return (
    <Card className={cn(
      "group overflow-hidden transition-all hover:border-primary/50",
      market.closed ? "opacity-75" : ""
    )}>
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
              {market.category && (
                <Badge variant="outline" className="text-xs">
                  {market.category}
                </Badge>
              )}
            </div>

            {/* Prices */}
            {isActive && (
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    Yes {(yesPrice * 100).toFixed(0)}¢
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    No {(noPrice * 100).toFixed(0)}¢
                  </span>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span>{formatNumber(market.volume)} vol</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{formatNumber(market.liquidity)} liq</span>
              </div>
              {market.endDate && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(market.endDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View on Polymarket */}
        <a
          href={`https://polymarket.com/event/${market.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-1 text-sm text-primary hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          View on Polymarket
        </a>
      </CardContent>
    </Card>
  );
}
