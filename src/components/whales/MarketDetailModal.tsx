import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Activity,
  BarChart3,
  ExternalLink,
  Users,
  Calendar,
  Info,
  BookOpen,
} from "lucide-react";
import { PolymarketEvent } from "@/hooks/usePolymarket";
import { formatNumber } from "@/data/whaleHelpers";
import { cn } from "@/lib/utils";
import { OrderBook } from "./OrderBook";

interface MarketDetailModalProps {
  market: PolymarketEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarketDetailModal({ market: baseMarket, open, onOpenChange }: MarketDetailModalProps) {
  if (!baseMarket) return null;

  const { data: fullMarket } = useQuery({
    queryKey: ["polymarket-event-by-slug", baseMarket.slug],
    queryFn: async (): Promise<PolymarketEvent> => {
      const { data, error } = await supabase.functions.invoke("polymarket-proxy", {
        body: { endpoint: "event", slug: baseMarket.slug },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      return data as PolymarketEvent;
    },
    enabled: open && !!baseMarket.slug,
    staleTime: 60 * 1000,
  });

  const market = fullMarket ?? baseMarket;

  const isActive = market.active && !market.closed;

  // Choose a market that actually has token IDs / order book enabled
  const orderBookMarket =
    market.markets?.find((m: any) => m?.acceptingOrders || m?.enableOrderBook) ||
    market.markets?.find((m: any) => !!m?.clobTokenIds) ||
    market.markets?.[0];

  const primaryMarket = orderBookMarket;

  // Parse outcome prices
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
      // Use defaults
    }
  }

  if (primaryMarket) {
    bestBid = (primaryMarket as any).bestBid || 0;
    bestAsk = (primaryMarket as any).bestAsk || 0;
    spread = (primaryMarket as any).spread || (bestAsk - bestBid);
  }

  // Aggregate market data
  const totalVolume = market.markets?.reduce((sum, m) => sum + (Number((m as any).volume) || 0), 0) || market.volume || 0;
  const totalLiquidity = market.markets?.reduce((sum, m) => sum + (Number((m as any).liquidity) || 0), 0) || market.liquidity || 0;
  const totalOpenInterest = market.markets?.reduce((sum, m) => sum + (Number((m as any).openInterest) || 0), 0) || market.openInterest || 0;

  // Get token IDs for order book (clobTokenIds can be a JSON string)
  let yesTokenId: string | undefined;
  let noTokenId: string | undefined;

  if (primaryMarket) {
    const clobTokenIds = (primaryMarket as any)?.clobTokenIds;
    if (clobTokenIds) {
      try {
        const tokenIds = typeof clobTokenIds === "string" ? JSON.parse(clobTokenIds) : clobTokenIds;
        yesTokenId = tokenIds?.[0];
        noTokenId = tokenIds?.[1];
      } catch {
        // leave undefined
      }
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
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
            <div className="flex-1">
              <DialogTitle className="text-xl font-display leading-tight mb-2">
                {market.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  variant={isActive ? "default" : "secondary"}
                  className={cn(
                    isActive ? "bg-success/20 text-success border-success/50" : ""
                  )}
                >
                  {market.closed ? "Resolved" : isActive ? "Live" : "Upcoming"}
                </Badge>
                {market.endDate && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Ends: {new Date(market.endDate).toLocaleDateString()}
                  </Badge>
                )}
                {market.markets && market.markets.length > 1 && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {market.markets.length} outcomes
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Description */}
        {market.description && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Info className="w-4 h-4" />
              <span>Description</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {market.description}
            </p>
          </div>
        )}

        <Separator className="my-4" />

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orderbook" className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Order Book
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Current Odds */}
            {isActive && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-success/5 border-success/20">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-success" />
                        <span className="text-sm font-medium text-success">Yes</span>
                      </div>
                      <div className="text-3xl font-bold text-success mb-1">
                        {(yesPrice * 100).toFixed(1)}¢
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(yesPrice * 100).toFixed(1)}% probability
                      </div>
                      {bestBid > 0 && (
                        <div className="mt-2 pt-2 border-t border-success/20">
                          <div className="text-xs text-muted-foreground">
                            Best Bid: <span className="text-success font-medium">{(bestBid * 100).toFixed(2)}¢</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="bg-destructive/5 border-destructive/20">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <TrendingDown className="w-5 h-5 text-destructive" />
                        <span className="text-sm font-medium text-destructive">No</span>
                      </div>
                      <div className="text-3xl font-bold text-destructive mb-1">
                        {(noPrice * 100).toFixed(1)}¢
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(noPrice * 100).toFixed(1)}% probability
                      </div>
                      {bestAsk > 0 && (
                        <div className="mt-2 pt-2 border-t border-destructive/20">
                          <div className="text-xs text-muted-foreground">
                            Best Ask: <span className="text-destructive font-medium">{(bestAsk * 100).toFixed(2)}¢</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {spread > 0 && (
                  <div className="text-center text-sm text-muted-foreground">
                    Current Spread: <span className="font-medium text-foreground">{(spread * 100).toFixed(2)}¢</span>
                  </div>
                )}

                <Separator />
              </>
            )}

            {/* Market Statistics */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Market Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-5 h-5 mx-auto text-primary mb-2" />
                    <div className="text-xs text-muted-foreground mb-1">Total Volume</div>
                    <div className="text-lg font-bold text-foreground">${formatNumber(totalVolume)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="w-5 h-5 mx-auto text-primary mb-2" />
                    <div className="text-xs text-muted-foreground mb-1">Liquidity</div>
                    <div className="text-lg font-bold text-foreground">${formatNumber(totalLiquidity)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Activity className="w-5 h-5 mx-auto text-primary mb-2" />
                    <div className="text-xs text-muted-foreground mb-1">Open Interest</div>
                    <div className="text-lg font-bold text-foreground">${formatNumber(totalOpenInterest)}</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Multiple Outcomes */}
            {market.markets && market.markets.length > 1 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">All Outcomes</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {market.markets.map((m, idx) => {
                      let mYesPrice = 0.5;
                      if (m.outcomePrices) {
                        try {
                          const prices = Array.isArray(m.outcomePrices) 
                            ? m.outcomePrices 
                            : JSON.parse(m.outcomePrices);
                          mYesPrice = parseFloat(prices[0]) || 0.5;
                        } catch {
                          // Use default
                        }
                      }
                      return (
                        <div 
                          key={m.id || idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <span className="text-sm font-medium flex-1 truncate pr-4">
                            {m.question || m.groupItemTitle || `Outcome ${idx + 1}`}
                          </span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-success font-medium">
                              {(mYesPrice * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Vol: ${formatNumber(Number(m.volume) || 0)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="orderbook" className="mt-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Live order book showing current bids and asks for this market.
              </div>
              
              {/* Yes Token Order Book */}
              {isActive && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      Yes Token Order Book
                    </h4>
                    <Card className="p-4">
                      <OrderBook tokenId={yesTokenId} />
                    </Card>
                  </div>
                  
                  {noTokenId && (
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-destructive" />
                        No Token Order Book
                      </h4>
                      <Card className="p-4">
                        <OrderBook tokenId={noTokenId} />
                      </Card>
                    </div>
                  )}
                </div>
              )}
              
              {!isActive && (
                <div className="text-center py-8 text-muted-foreground">
                  Order book not available for resolved markets
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Timestamps */}
        <Separator className="my-4" />
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {market.startDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Started: {new Date(market.startDate).toLocaleDateString()}
            </div>
          )}
          {market.endDate && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Ends: {new Date(market.endDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* External Link */}
        <a
          href={`https://polymarket.com/event/${market.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Trade on Polymarket
        </a>
      </DialogContent>
    </Dialog>
  );
}
