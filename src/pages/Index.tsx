import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { WhaleCard } from "@/components/whales/WhaleCard";
import { CategoryFilter } from "@/components/whales/CategoryFilter";
import { StatsHero } from "@/components/whales/StatsHero";
import { mockWhales, generatePerformanceData } from "@/data/mockWhales";
import { WhaleCategory } from "@/types";

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<WhaleCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWhales = useMemo(() => {
    return mockWhales
      .filter((whale) => {
        const matchesCategory = selectedCategory === "all" || whale.category === selectedCategory;
        const matchesSearch = !searchQuery || 
          whale.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          whale.wallet_address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.win_rate - a.win_rate);
  }, [selectedCategory, searchQuery]);

  return (
    <Layout>
      <StatsHero
        totalLocked={4250000}
        activeCopiers={8234}
        topPerformerToday="SportsQuant"
        topPerformerGain={12.4}
      />

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
    </Layout>
  );
}
