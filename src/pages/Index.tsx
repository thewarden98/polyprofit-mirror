import { useState, useMemo } from "react";
import { Search, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";
import { WhaleCard } from "@/components/whales/WhaleCard";
import { CategoryFilter } from "@/components/whales/CategoryFilter";
import { StatsHero } from "@/components/whales/StatsHero";
import { usePolymarketLeaderboard, usePolymarketSearch } from "@/hooks/usePolymarket";
import { generatePerformanceData } from "@/data/whaleHelpers";
import { WhaleCategory } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<WhaleCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: whales, isLoading, error, refetch, isRefetching } = usePolymarketLeaderboard();
  const { data: searchResults, isLoading: isSearching } = usePolymarketSearch(debouncedSearch);

  // Use search results if searching, otherwise filter leaderboard
  const displayWhales = useMemo(() => {
    // If we have a search query and search results, show those
    if (debouncedSearch.length >= 2 && searchResults && searchResults.length > 0) {
      return searchResults.filter((whale) => {
        return selectedCategory === "all" || whale.category === selectedCategory;
      });
    }
    
    // Otherwise filter the leaderboard
    if (!whales) return [];
    return whales
      .filter((whale) => {
        const matchesCategory = selectedCategory === "all" || whale.category === selectedCategory;
        const matchesSearch = !debouncedSearch || debouncedSearch.length < 2 ||
          whale.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          whale.wallet_address.toLowerCase().includes(debouncedSearch.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.rank - b.rank);
  }, [whales, searchResults, selectedCategory, debouncedSearch]);

  // Calculate stats from whale data
  const totalVolume = whales?.reduce((sum, w) => sum + w.total_volume, 0) || 0;
  const topPerformer = whales?.reduce((best, w) => 
    w.total_profit > best.total_profit ? w : best, whales?.[0]) || null;

  return (
    <Layout>
      <StatsHero
        totalLocked={totalVolume}
        activeCopiers={whales?.length || 0}
        topPerformerToday={topPerformer?.username || topPerformer?.wallet_address?.slice(0, 10) || "—"}
        topPerformerGain={topPerformer && topPerformer.total_volume > 0 
          ? (topPerformer.total_profit / topPerformer.total_volume) * 100 
          : 0}
      />

      {/* Status bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-destructive' : whales ? 'bg-success' : 'bg-yellow-500'}`} />
          <span>
            {isLoading ? 'Loading live data...' : 
             error ? 'Connection error' : 
             `${whales?.length || 0} traders from Polymarket`}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isRefetching || isLoading}
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
            Failed to fetch live data from Polymarket API. {error.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          {isSearching ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          )}
          <Input
            placeholder="Search all Polymarket traders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Fetching live trader data...</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayWhales.map((whale) => (
            <WhaleCard
              key={whale.id}
              whale={whale}
              performanceData={generatePerformanceData(whale)}
            />
          ))}
        </div>
      )}

      {displayWhales.length === 0 && !isLoading && !isSearching && !error && (
        <div className="text-center py-12 text-muted-foreground">
          {debouncedSearch.length >= 2 
            ? "No traders found matching your search."
            : "No traders found matching your criteria."}
        </div>
      )}
    </Layout>
  );
}
