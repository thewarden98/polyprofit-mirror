import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Wallet, TrendingUp, TrendingDown, Clock, Users, 
  ChevronDown, ChevronUp, ExternalLink, Activity,
  ArrowUpRight, ArrowDownRight, Target
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { mockCopies, mockMirroredPositions } from "@/data/mockCopies";
import { getCategoryInfo } from "@/data/mockWhales";
import { cn } from "@/lib/utils";

export default function Portfolio() {
  const [expandedCopies, setExpandedCopies] = useState<Set<string>>(new Set(["copy-1"]));

  const toggleExpanded = (copyId: string) => {
    const newExpanded = new Set(expandedCopies);
    if (newExpanded.has(copyId)) {
      newExpanded.delete(copyId);
    } else {
      newExpanded.add(copyId);
    }
    setExpandedCopies(newExpanded);
  };

  // Calculate totals
  const totalLocked = mockCopies.reduce((sum, c) => sum + c.locked_amount, 0);
  const totalValue = mockCopies.reduce((sum, c) => sum + c.current_value, 0);
  const totalPnL = mockCopies.reduce((sum, c) => sum + c.profit_loss, 0);
  const totalPnLPercent = ((totalValue - totalLocked) / totalLocked) * 100;

  // Find next unlock
  const nextUnlock = mockCopies.reduce((earliest, copy) => {
    const endDate = new Date(copy.end_date);
    return !earliest || endDate < earliest ? endDate : earliest;
  }, null as Date | null);

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getProgressPercent = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  };

  // Show demo data
  const hasCopies = mockCopies.length > 0;

  if (!hasCopies) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold">Your Portfolio</h1>
            <p className="text-muted-foreground mt-1">Track your active copy positions</p>
          </div>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Active Copies</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Start copying top whales to automatically mirror their prediction market trades.
              </p>
              <Link to="/">
                <Button className="gradient-primary border-0">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Browse Whales
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Your Portfolio</h1>
            <p className="text-muted-foreground mt-1">
              Tracking {mockCopies.length} active copy position{mockCopies.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">Live tracking</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Locked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalLocked.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className={totalPnL >= 0 ? "border-success/30" : "border-destructive/30"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {totalPnL >= 0 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                Total P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", totalPnL >= 0 ? "text-success" : "text-destructive")}>
                {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(2)} ({totalPnLPercent >= 0 ? "+" : ""}{totalPnLPercent.toFixed(1)}%)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Next Unlock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nextUnlock ? `${getDaysRemaining(nextUnlock.toISOString())} days` : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Copies */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Copies</h2>
          
          {mockCopies.map((copy) => {
            const positions = mockMirroredPositions.filter(p => p.copy_id === copy.id);
            const isExpanded = expandedCopies.has(copy.id);
            const daysRemaining = getDaysRemaining(copy.end_date);
            const progressPercent = getProgressPercent(copy.start_date, copy.end_date);
            const categoryInfo = getCategoryInfo(copy.whale.category);

            return (
              <Collapsible key={copy.id} open={isExpanded} onOpenChange={() => toggleExpanded(copy.id)}>
                <Card className={cn(
                  "transition-all",
                  isExpanded && "ring-1 ring-primary/50"
                )}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Whale Avatar */}
                          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                            {copy.whale.username?.charAt(0).toUpperCase()}
                          </div>
                          
                          {/* Whale Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{copy.whale.username}</h3>
                              <Badge variant="outline" className="text-xs">
                                {categoryInfo.emoji} {categoryInfo.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                {positions.length} positions
                              </span>
                              <span>•</span>
                              <span>{copy.whale.win_rate.toFixed(0)}% win rate</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats + Expand */}
                        <div className="flex items-center gap-6">
                          {/* Locked Amount */}
                          <div className="text-right hidden sm:block">
                            <div className="text-sm text-muted-foreground">Locked</div>
                            <div className="font-semibold">${copy.locked_amount.toLocaleString()}</div>
                          </div>
                          
                          {/* P&L */}
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">P&L</div>
                            <div className={cn(
                              "font-semibold flex items-center gap-1",
                              copy.profit_loss >= 0 ? "text-success" : "text-destructive"
                            )}>
                              {copy.profit_loss >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                              {copy.profit_loss >= 0 ? "+" : ""}{copy.profit_loss.toFixed(2)}
                            </div>
                          </div>

                          {/* Expand Icon */}
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Lock Progress Bar */}
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Lock progress</span>
                          <span>{daysRemaining} days remaining</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {/* Mirrored Positions */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            Mirrored Positions
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            Real-time from {copy.whale.username}'s trades
                          </span>
                        </div>

                        <div className="grid gap-3">
                          {positions.map((position) => {
                            const posCategoryInfo = getCategoryInfo(position.market_category);
                            const pnlPercent = ((position.current_price! - position.entry_price) / position.entry_price) * 100;
                            const isPositive = position.profit_loss >= 0;

                            return (
                              <div 
                                key={position.id} 
                                className="bg-muted/30 rounded-lg p-4 border border-border/50 hover:border-border transition-colors"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  {/* Market Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge 
                                        variant={position.position_side === "yes" ? "default" : "secondary"}
                                        className={cn(
                                          "text-xs",
                                          position.position_side === "yes" 
                                            ? "bg-success/20 text-success hover:bg-success/30" 
                                            : "bg-destructive/20 text-destructive hover:bg-destructive/30"
                                        )}
                                      >
                                        {position.position_side.toUpperCase()}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {posCategoryInfo.emoji} {posCategoryInfo.label}
                                      </span>
                                    </div>
                                    <h5 className="font-medium text-sm leading-tight">
                                      {position.market_title}
                                    </h5>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                      <span>Size: ${position.position_size.toFixed(0)}</span>
                                      <span>Entry: {(position.entry_price * 100).toFixed(0)}¢</span>
                                      <span>Current: {((position.current_price || 0) * 100).toFixed(0)}¢</span>
                                    </div>
                                  </div>

                                  {/* P&L */}
                                  <div className="text-right sm:min-w-[100px]">
                                    <div className={cn(
                                      "text-lg font-bold",
                                      isPositive ? "text-success" : "text-destructive"
                                    )}>
                                      {isPositive ? "+" : ""}{position.profit_loss.toFixed(2)}
                                    </div>
                                    <div className={cn(
                                      "text-xs",
                                      isPositive ? "text-success/80" : "text-destructive/80"
                                    )}>
                                      {isPositive ? "+" : ""}{pnlPercent.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Copy Summary */}
                        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{copy.whale_share_percent}%</span> whale share • 
                            <span className="font-medium text-foreground"> {copy.platform_fee_percent}%</span> platform fee
                          </div>
                          <Link to="https://polymarket.com" target="_blank">
                            <Button variant="outline" size="sm" className="gap-1">
                              View on Polymarket
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>

        {/* Browse More */}
        <div className="text-center pt-4">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Browse More Whales
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
