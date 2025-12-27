import { useState } from "react";
import { ExternalLink, Wallet, TrendingUp, TrendingDown, Clock, BarChart3, X, Loader2, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Whale, TraderPosition } from "@/types";
import { usePolymarketPositions } from "@/hooks/usePolymarket";
import { formatNumber, formatWallet, getCategoryInfo, getBadgeInfo } from "@/data/whaleHelpers";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface TraderDetailModalProps {
  whale: Whale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TraderDetailModal({ whale, open, onOpenChange }: TraderDetailModalProps) {
  const { data: positions, isLoading: positionsLoading, error: positionsError } = usePolymarketPositions(
    open ? whale.wallet_address : undefined
  );

  const isPositive = whale.total_profit > 0;
  const roi = whale.total_volume > 0 ? ((whale.total_profit / whale.total_volume) * 100).toFixed(1) : "0.0";
  const categoryInfo = getCategoryInfo(whale.category);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Separate open and closed positions
  const openPositions = positions?.filter(p => !p.redeemable) || [];
  const closedPositions = positions?.filter(p => p.redeemable) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 overflow-hidden">
              {whale.avatar_url ? (
                <img src={whale.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                whale.username?.charAt(0).toUpperCase() || "?"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-bold truncate">
                  {whale.username || formatWallet(whale.wallet_address)}
                </span>
                <Badge variant="outline" className={cn("text-xs", categoryInfo.color)}>
                  {categoryInfo.emoji} {categoryInfo.label}
                </Badge>
                {whale.is_verified && (
                  <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    whale.rank <= 10 ? "border-yellow-500 text-yellow-500" : ""
                  )}
                >
                  Rank #{whale.rank}
                </Badge>
              </div>
              {whale.x_username && (
                <a 
                  href={`https://x.com/${whale.x_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  @{whale.x_username}
                </a>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {/* Wallet Address */}
          <div 
            className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2 mb-4 cursor-pointer hover:bg-muted"
            onClick={() => copyToClipboard(whale.wallet_address)}
          >
            <Wallet className="w-4 h-4 text-muted-foreground shrink-0" />
            <code className="font-mono text-foreground flex-1 truncate">{whale.wallet_address}</code>
            <Copy className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Bio */}
          {whale.bio && (
            <p className="text-sm text-muted-foreground mb-4">{whale.bio}</p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{formatNumber(whale.total_volume)}</div>
              <div className="text-xs text-muted-foreground">Total Volume</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <div className={cn("text-lg font-bold", isPositive ? "text-success" : "text-destructive")}>
                {isPositive ? "+" : ""}{formatNumber(whale.total_profit)}
              </div>
              <div className="text-xs text-muted-foreground">P&L</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <div className={cn("text-lg font-bold", isPositive ? "text-success" : "text-destructive")}>
                {isPositive ? "+" : ""}{roi}%
              </div>
              <div className="text-xs text-muted-foreground">ROI</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <div className={cn("text-lg font-bold", whale.win_rate >= 70 ? "text-success" : "")}>
                {whale.win_rate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-muted/20 rounded-lg p-3 text-center">
              <div className="text-md font-semibold">{whale.total_trades}</div>
              <div className="text-xs text-muted-foreground">Total Trades</div>
            </div>
            <div className="bg-muted/20 rounded-lg p-3 text-center">
              <div className="text-md font-semibold text-primary">{whale.open_positions}</div>
              <div className="text-xs text-muted-foreground">Open Positions</div>
            </div>
            <div className="bg-muted/20 rounded-lg p-3 text-center">
              <div className="text-md font-semibold">{formatNumber(whale.portfolio_value)}</div>
              <div className="text-xs text-muted-foreground">Portfolio Value</div>
            </div>
          </div>

          {/* Badges */}
          {whale.badges.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Badges</h4>
              <div className="flex flex-wrap gap-2">
                {whale.badges.map((badge) => {
                  const badgeInfo = getBadgeInfo(badge);
                  return (
                    <Badge 
                      key={badge}
                      variant="outline" 
                      className="text-xs px-2 py-1 bg-muted/50"
                    >
                      {badgeInfo.emoji} {badgeInfo.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Positions Tabs */}
          <Tabs defaultValue="open" className="mb-4">
            <TabsList className="w-full">
              <TabsTrigger value="open" className="flex-1 gap-1">
                <BarChart3 className="w-4 h-4" />
                Open Positions ({openPositions.length})
              </TabsTrigger>
              <TabsTrigger value="closed" className="flex-1 gap-1">
                <Clock className="w-4 h-4" />
                History ({closedPositions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="mt-4">
              {positionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading positions...</span>
                </div>
              ) : positionsError ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Failed to load positions.</p>
                  <p className="text-xs mt-1">Data may not be available for this trader.</p>
                </div>
              ) : openPositions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No open positions found.
                </div>
              ) : (
                <div className="space-y-3">
                  {openPositions.map((position, idx) => (
                    <PositionCard key={idx} position={position} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="closed" className="mt-4">
              {positionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading history...</span>
                </div>
              ) : closedPositions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No closed positions found.
                </div>
              ) : (
                <div className="space-y-3">
                  {closedPositions.map((position, idx) => (
                    <PositionCard key={idx} position={position} isClosed />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border shrink-0">
          <a 
            href={`https://polymarket.com/profile/${whale.wallet_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            View on Polymarket
          </a>
          <Link to={`/copy/${whale.id}`} onClick={() => onOpenChange(false)}>
            <Button className="gradient-primary border-0 gap-2">
              <TrendingUp className="w-4 h-4" />
              Lock & Copy This Trader
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PositionCard({ position, isClosed = false }: { position: TraderPosition; isClosed?: boolean }) {
  const isPositive = position.cashPnl > 0;

  return (
    <div className={cn(
      "border rounded-lg p-3 transition-colors",
      isClosed ? "bg-muted/20 border-border/50" : "bg-card hover:border-primary/30"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {position.icon && (
            <img src={position.icon} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm truncate">{position.title}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs px-1.5",
                  position.outcome.toLowerCase() === "yes" ? "text-success border-success/50" : "text-destructive border-destructive/50"
                )}
              >
                {position.outcome}
              </Badge>
              <span>@ {(position.avgPrice * 100).toFixed(1)}¢</span>
              <span>→ {(position.curPrice * 100).toFixed(1)}¢</span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={cn(
            "font-semibold text-sm",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive ? "+" : ""}{formatNumber(position.cashPnl)}
          </div>
          <div className={cn(
            "text-xs",
            isPositive ? "text-success/80" : "text-destructive/80"
          )}>
            {isPositive ? "+" : ""}{position.percentPnl.toFixed(1)}%
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>Size: {position.size.toFixed(2)} shares</span>
        <span>Value: {formatNumber(position.currentValue)}</span>
        {isClosed && position.redeemable && (
          <Badge variant="secondary" className="text-xs">Redeemable</Badge>
        )}
      </div>
      {position.eventSlug && (
        <a 
          href={`https://polymarket.com/event/${position.eventSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          View Market
        </a>
      )}
    </div>
  );
}
