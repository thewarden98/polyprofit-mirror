import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown, Users, DollarSign, Share2 } from "lucide-react";

export default function WhaleDashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Crown className="w-8 h-8 text-primary" />
            Whale Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage your followers and earnings</p>
        </div>

        {/* Not a whale yet */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Become a Whale</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Share your prediction market expertise and earn a share of your followers' profits. 
              Top performers get verified badges and priority visibility.
            </p>
            <Button className="gradient-primary border-0">
              Apply to be a Whale
            </Button>
          </CardContent>
        </Card>

        {/* Stats Preview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Followers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">0</div>
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
              <div className="text-2xl font-bold text-muted-foreground">$0.00</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Profile Shares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">0</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
