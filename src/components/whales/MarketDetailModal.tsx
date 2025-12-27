import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  Info
} from "lucide-react";
import { PolymarketEvent } from "@/hooks/usePolymarket";
import { formatNumber } from "@/data/whaleHelpers";
import { cn } from "@/lib/utils";

interface MarketDetailModalProps {
  market: PolymarketEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarketDetailModal({ market, open, onOpenChange }: MarketDetailModalProps) {
  if (!market) return null;

  const isActive = market.active && !market.closed;
  const primaryMarket = market.markets?.[0];

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
    bestBid = primaryMarket.bestBid || 0;
    bestAsk = primaryMarket.bestAsk || 0;
    spread = primaryMarket.spread || (bestAsk - bestBid);
  }

  // Aggregate market data
  const totalVolume = market.markets?.reduce((sum, m) => sum + (Number(m.volume) || 0), 0) || market.volume || 0;
  const totalLiquidity = market.markets?.reduce((sum, m) => sum + (Number(m.liquidity) || 0), 0) || market.liquidity || 0;
  const totalOpenInterest = market.markets?.reduce((sum, m) => sum + (Number(m.openInterest) || 0), 0) || market.openInterest || 0;

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
              <div className="text-center text-sm text-muted-foreground mt-2">
                Current Spread: <span className="font-medium text-foreground">{(spread * 100).toFixed(2)}¢</span>
              </div>
            )}

            <Separator className="my-4" />
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
            <Separator className="my-4" />
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
                        {m.question || `Outcome ${idx + 1}`}
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
