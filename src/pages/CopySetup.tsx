import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock, AlertTriangle, TrendingUp, Users, DollarSign, Info } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { getCategoryInfo, getBadgeInfo, formatWallet } from "@/data/whaleHelpers";
import { usePolymarketLeaderboard } from "@/hooks/usePolymarket";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const LOCK_DURATION_DAYS = 60;
const PLATFORM_FEE_PERCENT = 5;
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 100000;

export default function CopySetup() {
  const { whaleId } = useParams();
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  
  const [amount, setAmount] = useState<string>("100");
  const [whaleSharePercent, setWhaleSharePercent] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch live whales data
  const { data: whales, isLoading } = usePolymarketLeaderboard();

  // Find the whale from live data
  const whale = useMemo(() => 
    whales?.find(w => w.id === whaleId), 
    [whales, whaleId]
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!whale) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Trader not found</h2>
          <p className="text-muted-foreground mb-4">This trader may no longer be on the leaderboard.</p>
          <Link to="/">
            <Button>Back to Leaderboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const categoryInfo = getCategoryInfo(whale.category);
  const amountNum = parseFloat(amount) || 0;
  const userSharePercent = 100 - whaleSharePercent - PLATFORM_FEE_PERCENT;

  // Calculate projected returns based on whale's historical performance
  const projectedProfit = amountNum * (whale.total_profit / whale.total_volume);
  const userProfit = projectedProfit * (userSharePercent / 100);
  const whaleProfit = projectedProfit * (whaleSharePercent / 100);
  const platformFee = projectedProfit * (PLATFORM_FEE_PERCENT / 100);

  // Pie chart data
  const pieData = [
    { name: `Your Share (${userSharePercent}%)`, value: userSharePercent, color: "hsl(142, 71%, 45%)" },
    { name: `Whale Share (${whaleSharePercent}%)`, value: whaleSharePercent, color: "hsl(271, 81%, 60%)" },
    { name: `Platform Fee (${PLATFORM_FEE_PERCENT}%)`, value: PLATFORM_FEE_PERCENT, color: "hsl(240, 10%, 50%)" },
  ];

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleConfirm = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    if (amountNum < MIN_AMOUNT) {
      toast({
        title: "Amount too low",
        description: `Minimum amount is $${MIN_AMOUNT} USDC.`,
        variant: "destructive",
      });
      return;
    }

    if (amountNum > MAX_AMOUNT) {
      toast({
        title: "Amount too high",
        description: `Maximum amount is $${MAX_AMOUNT.toLocaleString()} USDC.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Copy Position Created! 🎉",
      description: `You're now copying ${whale.username} with $${amountNum.toLocaleString()} USDC locked for ${LOCK_DURATION_DAYS} days.`,
    });

    setIsSubmitting(false);
    navigate("/portfolio");
  };

  const truncatedAddress = `${whale.wallet_address.slice(0, 6)}...${whale.wallet_address.slice(-4)}`;
  const unlockDate = new Date();
  unlockDate.setDate(unlockDate.getDate() + LOCK_DURATION_DAYS);

  return (
    <Layout>
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Leaderboard
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Whale Summary Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Copying Whale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">
                  {whale.username?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate">{whale.username}</h3>
                    {whale.is_verified && (
                      <Badge variant="secondary" className="text-xs shrink-0">✓ Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={categoryInfo.color}>{categoryInfo.emoji} {categoryInfo.label}</span>
                    <span>•</span>
                    <span>{truncatedAddress}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className={cn("text-lg font-bold", whale.win_rate >= 70 ? "text-success" : "")}>
                    {whale.win_rate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-success">
                    +{((whale.total_profit / whale.total_volume) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    {whale.follower_count.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
              </div>

              {/* Badges */}
              {whale.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {whale.badges.map((badge) => {
                    const badgeInfo = getBadgeInfo(badge);
                    return (
                      <Badge key={badge} variant="outline" className="text-xs">
                        {badgeInfo.emoji} {badgeInfo.label}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lock Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Lock Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Lock (USDC)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="pl-10 text-lg font-semibold"
                    placeholder="100"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: ${MIN_AMOUNT}</span>
                  <span>Max: ${MAX_AMOUNT.toLocaleString()}</span>
                </div>
                {/* Quick amount buttons */}
                <div className="flex gap-2 pt-2">
                  {[50, 100, 500, 1000].map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === String(preset) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAmount(String(preset))}
                      className="flex-1"
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Lock Duration */}
              <div className="space-y-2">
                <Label>Lock Duration</Label>
                <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{LOCK_DURATION_DAYS} Days</div>
                    <div className="text-sm text-muted-foreground">
                      Unlocks: {unlockDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>

              <Separator />

              {/* Whale Share Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Whale Profit Share</Label>
                  <span className="text-lg font-semibold text-primary">{whaleSharePercent}%</span>
                </div>
                <Slider
                  value={[whaleSharePercent]}
                  onValueChange={(v) => setWhaleSharePercent(v[0])}
                  min={10}
                  max={25}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10% (Minimum)</span>
                  <span>25% (Maximum)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview & Confirm */}
        <div className="space-y-6">
          {/* Profit Allocation Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Profit Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pie Chart */}
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Projected Returns */}
              {amountNum >= MIN_AMOUNT && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <Info className="w-4 h-4" />
                    Projected returns based on whale's historical performance
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your projected profit:</span>
                    <span className="font-semibold text-success">+${userProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Whale earns:</span>
                    <span className="font-semibold text-primary">${whaleProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform fee:</span>
                    <span className="font-semibold">${platformFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total if profitable:</span>
                    <span className="font-bold text-lg">${(amountNum + userProfit).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Alert variant="default" className="border-warning/50 bg-warning/10">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">Important Disclaimer</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Lock Period:</strong> Your funds will be locked for {LOCK_DURATION_DAYS} days. You cannot withdraw during this period.
              </p>
              <p>
                <strong>Profit Sharing:</strong> If the whale generates profits, {whaleSharePercent}% goes to the whale and {PLATFORM_FEE_PERCENT}% to the platform. You keep {userSharePercent}%.
              </p>
              <p>
                <strong>Risk Warning:</strong> Past performance does not guarantee future results. You may lose some or all of your locked funds if the whale's positions lose value.
              </p>
              <p>
                <strong>No Guaranteed Returns:</strong> Projected returns are estimates based on historical data and are not guaranteed.
              </p>
            </AlertDescription>
          </Alert>

          {/* Confirm Section */}
          <Card className="border-primary/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount to lock:</span>
                  <span className="text-2xl font-bold">${amountNum.toLocaleString()} USDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold">{LOCK_DURATION_DAYS} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Unlocks on:</span>
                  <span className="font-semibold">{unlockDate.toLocaleDateString()}</span>
                </div>

                <Separator />

                {isConnected ? (
                  <Button
                    className="w-full gradient-primary border-0 h-12 text-lg"
                    onClick={handleConfirm}
                    disabled={isSubmitting || amountNum < MIN_AMOUNT}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Lock & Copy {whale.username}
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-center text-muted-foreground">
                      Connect your wallet to continue
                    </p>
                    <div className="flex justify-center">
                      <ConnectButton />
                    </div>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  By clicking "Lock & Copy", you agree to the terms and understand the risks involved.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
