import { Link } from "react-router-dom";
import { TrendingUp, Users, Trophy, ExternalLink, Wallet, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Whale, PerformanceDataPoint } from "@/types";
import { getCategoryInfo, getBadgeInfo, formatNumber, formatWallet } from "@/data/whaleHelpers";
import { SparklineChart } from "./SparklineChart";
import { cn } from "@/lib/utils";

interface WhaleCardProps {
  whale: Whale;
  performanceData: PerformanceDataPoint[];
}

export function WhaleCard({ whale, performanceData }: WhaleCardProps) {
  const categoryInfo = getCategoryInfo(whale.category);
  const isPositive = whale.total_profit > 0;
  const roi = whale.total_volume > 0 ? ((whale.total_profit / whale.total_volume) * 100).toFixed(1) : "0.0";

  return (
    <Card className="group relative overflow-hidden transition-all hover:border-primary/50 hover:glow-primary">
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            {/* Rank + Avatar + Name */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                whale.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                whale.rank === 2 ? "bg-zinc-400/20 text-zinc-300" :
                whale.rank === 3 ? "bg-orange-600/20 text-orange-400" :
                whale.rank <= 10 ? "bg-primary/20 text-primary" :
                "bg-muted text-muted-foreground"
              )}>
                #{whale.rank}
              </div>
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 overflow-hidden">
                {whale.avatar_url ? (
                  <img src={whale.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  whale.username?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">
                    {whale.username || formatWallet(whale.wallet_address)}
                  </h3>
                  {whale.is_verified && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      ✓
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={categoryInfo.color}>{categoryInfo.emoji} {categoryInfo.label}</span>
                </div>
              </div>
            </div>

            {/* Sparkline */}
            <div className="w-24 h-10 shrink-0 hidden sm:block">
              <SparklineChart data={performanceData} isPositive={isPositive} />
            </div>
          </div>

          {/* Wallet Address */}
          <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            <code className="font-mono text-foreground flex-1 truncate">{whale.wallet_address}</code>
            {whale.x_username && (
              <a 
                href={`https://x.com/${whale.x_username}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @{whale.x_username}
              </a>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className={cn(
                "text-sm font-bold",
                whale.win_rate >= 70 ? "text-success" : "text-foreground"
              )}>
                {whale.win_rate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </div>
            <div>
              <div className={cn(
                "text-sm font-bold",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? "+" : ""}{roi}%
              </div>
              <div className="text-xs text-muted-foreground">ROI</div>
            </div>
            <div>
              <div className="text-sm font-bold">{whale.total_trades}</div>
              <div className="text-xs text-muted-foreground">Trades</div>
            </div>
            <div>
              <div className="text-sm font-bold text-primary">{whale.open_positions}</div>
              <div className="text-xs text-muted-foreground">Open</div>
            </div>
          </div>

          {/* Volume & Profit */}
          <div className="grid grid-cols-3 gap-2 text-center bg-muted/30 rounded-lg py-2">
            <div>
              <div className="text-sm font-semibold">{formatNumber(whale.total_volume)}</div>
              <div className="text-xs text-muted-foreground">Volume</div>
            </div>
            <div>
              <div className={cn(
                "text-sm font-semibold",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? "+" : ""}{formatNumber(whale.total_profit)}
              </div>
              <div className="text-xs text-muted-foreground">P&L</div>
            </div>
            <div>
              <div className="text-sm font-semibold">{formatNumber(whale.portfolio_value)}</div>
              <div className="text-xs text-muted-foreground">Portfolio</div>
            </div>
          </div>

          {/* Badges */}
          {whale.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {whale.badges.slice(0, 5).map((badge) => {
                const badgeInfo = getBadgeInfo(badge);
                return (
                  <Tooltip key={badge}>
                    <TooltipTrigger>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-0.5 bg-muted/50 hover:bg-muted cursor-help"
                      >
                        {badgeInfo.emoji} {badgeInfo.label}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{badgeInfo.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {whale.badges.length > 5 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-muted/50">
                  +{whale.badges.length - 5}
                </Badge>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <a 
              href={`https://polymarket.com/profile/${whale.wallet_address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View on Polymarket
            </a>
            <Link to={`/copy/${whale.id}`}>
              <Button size="sm" className="gradient-primary border-0 gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Lock & Copy
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
