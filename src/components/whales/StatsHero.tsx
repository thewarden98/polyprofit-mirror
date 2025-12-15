import { TrendingUp, Users, DollarSign, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsHeroProps {
  totalLocked: number;
  activeCopiers: number;
  topPerformerToday: string;
  topPerformerGain: number;
}

export function StatsHero({ totalLocked, activeCopiers, topPerformerToday, topPerformerGain }: StatsHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 md:p-8 mb-6">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/20 blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-6 h-6 text-primary-foreground" />
          <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground">
            PolyForge
          </h1>
        </div>
        <p className="text-primary-foreground/80 mb-6 max-w-lg">
          Copy the best prediction market traders. Lock USDC, mirror their moves, share in the profits.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-1">
              <DollarSign className="w-4 h-4" />
              Total Locked
            </div>
            <div className="text-xl md:text-2xl font-bold text-primary-foreground">
              ${(totalLocked / 1000000).toFixed(2)}M
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-1">
              <Users className="w-4 h-4" />
              Active Copiers
            </div>
            <div className="text-xl md:text-2xl font-bold text-primary-foreground">
              {activeCopiers.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Top Performer Today
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-bold text-primary-foreground">
                {topPerformerToday}
              </span>
              <span className="text-lg font-semibold text-green-300">
                +{topPerformerGain.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
