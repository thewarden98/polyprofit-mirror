import { Whale, PerformanceDataPoint } from "@/types";

// Generate performance data for sparklines
export function generatePerformanceData(whale: Whale): PerformanceDataPoint[] {
  const data: PerformanceDataPoint[] = [];
  const baseValue = 100;
  let currentValue = baseValue;
  
  // Generate 30 days of data
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Random daily change influenced by win rate
    const changePercent = (Math.random() - 0.45) * 5 * (whale.win_rate / 50);
    currentValue = currentValue * (1 + changePercent / 100);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(currentValue * 100) / 100,
    });
  }
  
  return data;
}

// Get category display info
export function getCategoryInfo(category: string) {
  const categories: Record<string, { emoji: string; label: string; color: string }> = {
    politics: { emoji: "🏛️", label: "Politics", color: "text-blue-400" },
    crypto: { emoji: "₿", label: "Crypto", color: "text-orange-400" },
    sports: { emoji: "⚽", label: "Sports", color: "text-green-400" },
    entertainment: { emoji: "🎬", label: "Entertainment", color: "text-pink-400" },
    general: { emoji: "🌐", label: "General", color: "text-muted-foreground" },
  };
  return categories[category] || categories.general;
}

// Get badge display info
export function getBadgeInfo(badge: string) {
  const badges: Record<string, { emoji: string; label: string; description: string }> = {
    'mega-whale': { emoji: "🐋", label: "Mega Whale", description: ">$1M volume" },
    whale: { emoji: "🐳", label: "Whale", description: ">$100k volume" },
    "sharp-money": { emoji: "💎", label: "Sharp Money", description: ">75% win rate" },
    consistent: { emoji: "📈", label: "Consistent", description: ">65% win rate" },
    "hot-streak": { emoji: "🔥", label: "Hot Streak", description: ">30% ROI" },
    profitable: { emoji: "💰", label: "Profitable", description: ">10% ROI" },
    legend: { emoji: "👑", label: "Legend", description: "Top 10" },
    'top-50': { emoji: "🏆", label: "Top 50", description: "Ranked top 50" },
    verified: { emoji: "✓", label: "Verified", description: "Verified account" },
    'big-portfolio': { emoji: "💼", label: "Big Portfolio", description: ">$100k portfolio" },
  };
  return badges[badge] || { emoji: "⭐", label: badge, description: "" };
}

// Format large numbers
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) {
    return "$0";
  }
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}k`;
  }
  return `$${num.toFixed(0)}`;
}

// Format wallet address
export function formatWallet(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
