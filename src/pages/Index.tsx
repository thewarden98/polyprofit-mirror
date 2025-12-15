import { useState, useMemo } from "react";
import { Search, RefreshCw, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";
import { WhaleCard } from "@/components/whales/WhaleCard";
import { CategoryFilter } from "@/components/whales/CategoryFilter";
import { StatsHero } from "@/components/whales/StatsHero";
import { usePolymarketLeaderboard } from "@/hooks/usePolymarket";
import { mockWhales, generatePerformanceData } from "@/data/mockWhales";
import { WhaleCategory } from "@/types";

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<WhaleCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: liveWhales, isLoading, error, refetch, isRefetching } = usePolymarketLeaderboard();

  // Use live data if available, fallback to mock data
  const whales = liveWhales && liveWhales.length > 0 ? liveWhales : mockWhales;
  const isUsingMockData = !liveWhales || liveWhales.length === 0;

  const filteredWhales = useMemo(() => {
    return whales
      .filter((whale) => {
        const matchesCategory = selectedCategory === "all" || whale.category === selectedCategory;
        const matchesSearch = !searchQuery || 
          whale.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          whale.wallet_address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.win_rate - a.win_rate);
  }, [whales, selectedCategory, searchQuery]);

  // Calculate stats from whale data
  const totalVolume = whales.reduce((sum, w) => sum + w.total_volume, 0);
  const topPerformer = whales.reduce((best, w) => 
    w.total_profit > best.total_profit ? w : best, whales[0]);

  return (
    <Layout>
      <StatsHero
        totalLocked={totalVolume}
        activeCopiers={whales.reduce((sum, w) => sum + w.follower_count, 0)}
        topPerformerToday={topPerformer?.username || "Unknown"}
        topPerformerGain={topPerformer ? (topPerformer.total_profit / topPerformer.total_volume) * 100 : 0}
      />

      {/* Status bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${isUsingMockData ? 'bg-yellow-500' : 'bg-success'}`} />
          <span>{isUsingMockData ? 'Demo data' : 'Live from Polymarket'}</span>
          {error && (
            <span className="text-destructive">• API error</span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to fetch live data. Showing demo whales. {error.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search whales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWhales.map((whale, index) => (
            <WhaleCard
              key={whale.id}
              whale={whale}
              performanceData={generatePerformanceData(whale)}
              rank={index + 1}
            />
          ))}
        </div>
      )}

      {filteredWhales.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          No whales found matching your criteria.
        </div>
      )}
    </Layout>
  );
}
