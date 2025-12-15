import { Whale, PerformanceDataPoint } from "@/types";

// Generate realistic mock whales
export const mockWhales: Whale[] = [
  {
    id: "1",
    wallet_address: "0x7a16ff8270133f063aab6c9977183d9e72835428",
    username: "PoliticalProphet",
    avatar_url: null,
    bio: "Former DC insider. Political markets specialist.",
    category: "politics",
    total_volume: 1250000,
    total_profit: 312500,
    win_rate: 73.5,
    total_trades: 156,
    winning_trades: 115,
    follower_count: 2341,
    is_verified: true,
    badges: ["whale", "sharp-money", "hot-streak"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    wallet_address: "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be",
    username: "CryptoOracle",
    avatar_url: null,
    bio: "On-chain analyst. DeFi degen since 2017.",
    category: "crypto",
    total_volume: 890000,
    total_profit: 178000,
    win_rate: 68.2,
    total_trades: 203,
    winning_trades: 138,
    follower_count: 1892,
    is_verified: true,
    badges: ["whale", "sharp-money"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    wallet_address: "0x28c6c06298d514db089934071355e5743bf21d60",
    username: "SportsQuant",
    avatar_url: null,
    bio: "Ex-Vegas oddsmaker. Now betting on predictions.",
    category: "sports",
    total_volume: 2100000,
    total_profit: 567000,
    win_rate: 71.8,
    total_trades: 312,
    winning_trades: 224,
    follower_count: 3456,
    is_verified: true,
    badges: ["whale", "sharp-money", "hot-streak", "legend"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    wallet_address: "0x56eddb7aa87536c09ccc2793473599fd21a8b17f",
    username: "ElectionEdge",
    avatar_url: null,
    bio: "Data scientist. Polling expert.",
    category: "politics",
    total_volume: 540000,
    total_profit: 94500,
    win_rate: 65.4,
    total_trades: 89,
    winning_trades: 58,
    follower_count: 876,
    is_verified: false,
    badges: ["sharp-money"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    wallet_address: "0x21a31ee1afc51d94c2efccaa2092ad1028285549",
    username: "NFTNostradamus",
    avatar_url: null,
    bio: "NFT and crypto culture markets.",
    category: "crypto",
    total_volume: 320000,
    total_profit: 48000,
    win_rate: 62.1,
    total_trades: 145,
    winning_trades: 90,
    follower_count: 654,
    is_verified: false,
    badges: ["hot-streak"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    wallet_address: "0x9bf4001d307dfd62b26a2f1307ee0c0307632d59",
    username: "PopCulturePro",
    avatar_url: null,
    bio: "Entertainment industry insider. Award shows specialist.",
    category: "entertainment",
    total_volume: 180000,
    total_profit: 27000,
    win_rate: 59.3,
    total_trades: 67,
    winning_trades: 40,
    follower_count: 432,
    is_verified: false,
    badges: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "7",
    wallet_address: "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b",
    username: "MacroMaven",
    avatar_url: null,
    bio: "Global macro perspective. Economics PhD.",
    category: "general",
    total_volume: 780000,
    total_profit: 163800,
    win_rate: 69.7,
    total_trades: 178,
    winning_trades: 124,
    follower_count: 1234,
    is_verified: true,
    badges: ["whale", "sharp-money"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "8",
    wallet_address: "0x59a5208b32e627891c389ebafc644145224006e8",
    username: "SuperBowlSage",
    avatar_url: null,
    bio: "NFL and major sports events only.",
    category: "sports",
    total_volume: 450000,
    total_profit: 81000,
    win_rate: 66.5,
    total_trades: 94,
    winning_trades: 63,
    follower_count: 789,
    is_verified: false,
    badges: ["sharp-money"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

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
    whale: { emoji: "🐋", label: "Whale", description: ">$100k volume" },
    "sharp-money": { emoji: "💎", label: "Sharp Money", description: ">70% win rate" },
    "hot-streak": { emoji: "🔥", label: "Hot Streak", description: "5+ wins in a row" },
    legend: { emoji: "👑", label: "Legend", description: "Top 10 all-time" },
  };
  return badges[badge] || { emoji: "⭐", label: badge, description: "" };
}
