import { Link } from "react-router-dom";
import { TrendingUp, Users, Trophy, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Whale, PerformanceDataPoint } from "@/types";
import { getCategoryInfo, getBadgeInfo } from "@/data/mockWhales";
import { SparklineChart } from "./SparklineChart";
import { cn } from "@/lib/utils";

interface WhaleCardProps {
  whale: Whale;
  performanceData: PerformanceDataPoint[];
  rank?: number;
}

export function WhaleCard({ whale, performanceData, rank }: WhaleCardProps) {
  const categoryInfo = getCategoryInfo(whale.category);
  const isPositive = whale.total_profit > 0;
  const roi = ((whale.total_profit / whale.total_volume) * 100).toFixed(1);

  const truncatedAddress = `${whale.wallet_address.slice(0, 6)}...${whale.wallet_address.slice(-4)}`;

  return (
    <Card className="group relative overflow-hidden transition-all hover:border-primary/50 hover:glow-primary">
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            {/* Avatar + Name */}
            <div className="flex items-center gap-3 min-w-0">
              {rank && (
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                  rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                  rank === 2 ? "bg-zinc-400/20 text-zinc-300" :
                  rank === 3 ? "bg-orange-600/20 text-orange-400" :
                  "bg-muted text-muted-foreground"
                )}>
                  #{rank}
                </div>
              )}
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                {whale.username?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">
                    {whale.username || truncatedAddress}
                  </h3>
                  {whale.is_verified && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={categoryInfo.color}>{categoryInfo.emoji} {categoryInfo.label}</span>
                  <span>•</span>
                  <span className="truncate">{truncatedAddress}</span>
                </div>
              </div>
            </div>

            {/* Sparkline */}
            <div className="w-24 h-10 shrink-0 hidden sm:block">
              <SparklineChart data={performanceData} isPositive={isPositive} />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className={cn(
                "text-lg font-bold",
                whale.win_rate >= 70 ? "text-success" : "text-foreground"
              )}>
                {whale.win_rate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </div>
            <div>
              <div className={cn(
                "text-lg font-bold",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? "+" : ""}{roi}%
              </div>
              <div className="text-xs text-muted-foreground">ROI</div>
            </div>
            <div>
              <div className="text-lg font-bold flex items-center justify-center gap-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                {whale.follower_count.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
          </div>

          {/* Badges */}
          {whale.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {whale.badges.map((badge) => {
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
            </div>
          )}

          {/* Volume + CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="text-sm">
              <span className="text-muted-foreground">Volume: </span>
              <span className="font-semibold">${(whale.total_volume / 1000).toFixed(0)}k</span>
            </div>
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
