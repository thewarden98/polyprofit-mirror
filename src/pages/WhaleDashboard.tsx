import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { 
  Crown, Users, DollarSign, Share2, Wallet, 
  CheckCircle2, ArrowRight, Copy, QrCode, Link2,
  TrendingUp, Trophy, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email?: string;
}

export default function WhaleDashboard() {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletLinked, setWalletLinked] = useState(false);

  useEffect(() => {
    // Check auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if wallet is already linked to account
  useEffect(() => {
    if (user && address) {
      // In a real app, we'd check the database
      // For demo, we'll just track locally
      setWalletLinked(true);
    }
  }, [user, address]);

  const handleLinkWallet = async () => {
    if (!user || !address) return;

    try {
      // Update profile with wallet address
      const { error } = await supabase
        .from('profiles')
        .update({ 
          wallet_address: address,
          is_whale: true 
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setWalletLinked(true);
      toast({
        title: "Wallet linked! 🎉",
        description: "Your Polymarket wallet is now connected to your PolyForge account.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to link wallet",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({
      title: "Signed out",
      description: "You've been signed out of your account.",
    });
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/whale/${address}`);
    toast({
      title: "Link copied!",
      description: "Your profile link has been copied to clipboard.",
    });
  };

  // Registration steps
  const steps = [
    { 
      id: 1, 
      title: "Create Account", 
      description: "Sign up with email & password",
      completed: !!user 
    },
    { 
      id: 2, 
      title: "Connect Wallet", 
      description: "Link your Polymarket wallet",
      completed: !!user && isConnected && walletLinked 
    },
    { 
      id: 3, 
      title: "Start Earning", 
      description: "Share your profile & get followers",
      completed: false 
    },
  ];

  const currentStep = steps.findIndex(s => !s.completed) + 1 || steps.length + 1;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  // Not logged in - show registration flow
  if (!user) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Crown className="w-8 h-8 text-primary" />
              Become a Whale
            </h1>
            <p className="text-muted-foreground mt-1">
              Share your trading expertise and earn from copy traders
            </p>
          </div>

          {/* Progress Steps */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                        step.completed 
                          ? "bg-success text-success-foreground" 
                          : currentStep === step.id
                            ? "gradient-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      )}>
                        {step.completed ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                      </div>
                      <div className="text-center mt-2">
                        <div className="text-sm font-medium">{step.title}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "flex-1 h-0.5 mx-4",
                        step.completed ? "bg-success" : "bg-muted"
                      )} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Create Account */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Step 1: Create Your Account</h3>
                <p className="text-muted-foreground">
                  Sign up for a PolyForge account to manage your whale profile and track earnings.
                </p>
                <Link to="/auth">
                  <Button className="gradient-primary border-0 gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-success" />
                  Earn Passive Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Earn 10-25% of profits from traders who copy your positions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Build Your Reputation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Verified badges and leaderboard rankings for top performers.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Grow Your Following
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Shareable profile links and embeddable widgets.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Logged in but wallet not connected
  if (!isConnected) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                <Crown className="w-8 h-8 text-primary" />
                Whale Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Welcome, {user.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>

          {/* Progress Steps */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                        step.completed 
                          ? "bg-success text-success-foreground" 
                          : currentStep === step.id
                            ? "gradient-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      )}>
                        {step.completed ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                      </div>
                      <div className="text-center mt-2">
                        <div className="text-sm font-medium">{step.title}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "flex-1 h-0.5 mx-4",
                        step.completed ? "bg-success" : "bg-muted"
                      )} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 2: Connect Wallet */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Step 2: Connect Your Polymarket Wallet</h3>
                <p className="text-muted-foreground">
                  Connect the wallet you use on Polymarket so we can track your trading performance and mirror your positions to followers.
                </p>
                <Alert>
                  <Wallet className="h-4 w-4" />
                  <AlertDescription>
                    Make sure to connect the same wallet address you use on Polymarket.
                  </AlertDescription>
                </Alert>
                <ConnectButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Logged in and wallet connected but not linked
  if (!walletLinked) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                <Crown className="w-8 h-8 text-primary" />
                Whale Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Welcome, {user.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Almost there! Link your wallet</h3>
                <p className="text-muted-foreground">
                  Wallet connected: <code className="bg-muted px-2 py-1 rounded text-sm">{address}</code>
                </p>
                <p className="text-muted-foreground">
                  Click below to link this wallet to your PolyForge account and start accepting copy traders.
                </p>
                <Button onClick={handleLinkWallet} className="gradient-primary border-0 gap-2">
                  <Link2 className="w-4 h-4" />
                  Link Wallet to Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Fully registered whale - show dashboard
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Crown className="w-8 h-8 text-primary" />
              Whale Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="py-1.5 px-3">
              <div className="w-2 h-2 rounded-full bg-success mr-2" />
              Wallet Linked
            </Badge>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Followers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Share your link to grow</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">From copy traders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Mirrored Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">Total locked by copiers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Profile Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Info */}
        <Card>
          <CardHeader>
            <CardTitle>Linked Wallet</CardTitle>
            <CardDescription>Your Polymarket wallet for position tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-mono text-sm">{address}</div>
                  <div className="text-xs text-muted-foreground">Connected via MetaMask</div>
                </div>
              </div>
              <Badge className="bg-success/20 text-success">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Share Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Promotion Tools</CardTitle>
            <CardDescription>Share your profile to attract copy traders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={copyProfileLink}>
                <Copy className="w-5 h-5" />
                <span>Copy Profile Link</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled>
                <QrCode className="w-5 h-5" />
                <span>QR Code</span>
                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled>
                <Link2 className="w-5 h-5" />
                <span>Embed Widget</span>
                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Tips */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> Start trading on Polymarket to build your track record. 
            Your positions will be automatically tracked and displayed to potential followers.
          </AlertDescription>
        </Alert>
      </div>
    </Layout>
  );
}
