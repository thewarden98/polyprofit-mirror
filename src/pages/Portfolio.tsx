import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wallet, TrendingUp, Clock } from "lucide-react";

export default function Portfolio() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Your Portfolio</h1>
          <p className="text-muted-foreground mt-1">Track your active copy positions</p>
        </div>

        {/* Empty State */}
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

        {/* Stats Cards - will be populated when user has copies */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Locked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">$0.00</div>
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
              <div className="text-2xl font-bold text-muted-foreground">—</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
