export type WhaleCategory = 'politics' | 'crypto' | 'sports' | 'entertainment' | 'general';
export type CopyStatus = 'active' | 'completed' | 'cancelled';
export type PositionOutcome = 'pending' | 'won' | 'lost';

// Raw data from Polymarket API
export interface PolymarketTrader {
  proxyWallet: string;
  name?: string;
  userName?: string;
  pseudonym?: string;
  bio?: string;
  profileImage?: string;
  profileImageOptimized?: string;
  xUsername?: string;
  verifiedBadge?: boolean;
  displayUsernamePublic?: boolean;
  // Volume & PnL fields
  volume_amount?: number;
  volume_position?: number;
  profile_profit?: number;
  profile_volume?: number;
  profile_value?: number;
  vol?: number;
  pnl?: number;
  rank?: string | number;
  // Position counts
  openPositionCount?: number;
  closedPositionCount?: number;
  totalPositions?: number;
  marketsTraded?: number;
}

export interface Whale {
  id: string;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  category: WhaleCategory;
  total_volume: number;
  total_profit: number;
  portfolio_value: number;
  win_rate: number;
  total_trades: number;
  open_positions: number;
  closed_positions: number;
  winning_trades: number;
  follower_count: number;
  is_verified: boolean;
  badges: string[];
  rank: number;
  x_username: string | null;
  created_at: string;
  updated_at: string;
}

export interface TraderPosition {
  proxyWallet: string;
  asset: string;
  conditionId: string;
  size: number;
  avgPrice: number;
  initialValue: number;
  currentValue: number;
  cashPnl: number;
  percentPnl: number;
  totalBought: number;
  realizedPnl: number;
  percentRealizedPnl: number;
  curPrice: number;
  redeemable: boolean;
  mergeable: boolean;
  title: string;
  slug: string;
  icon: string;
  eventSlug: string;
  outcome: string;
  outcomeIndex: number;
  oppositeOutcome: string;
  oppositeAsset: string;
  endDate: string;
  negativeRisk: boolean;
}

export interface Copy {
  id: string;
  user_id: string;
  whale_id: string;
  locked_amount: number;
  current_value: number;
  profit_loss: number;
  whale_share_percent: number;
  platform_fee_percent: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: CopyStatus;
  transaction_hash: string | null;
  created_at: string;
  updated_at: string;
  whale?: Whale;
}

export interface MirroredPosition {
  id: string;
  copy_id: string;
  user_id: string;
  whale_id: string;
  market_id: string;
  market_title: string;
  market_category: WhaleCategory;
  position_side: 'yes' | 'no';
  position_size: number;
  entry_price: number;
  current_price: number | null;
  profit_loss: number;
  outcome: PositionOutcome;
  polymarket_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  wallet_address: string | null;
  username: string | null;
  avatar_url: string | null;
  total_locked: number;
  total_profit: number;
  is_whale: boolean;
  whale_id: string | null;
  created_at: string;
  updated_at: string;
}

// Mock data types for demo
export interface PerformanceDataPoint {
  date: string;
  value: number;
}
