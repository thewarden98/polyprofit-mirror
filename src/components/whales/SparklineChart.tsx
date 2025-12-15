import { PerformanceDataPoint } from "@/types";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: PerformanceDataPoint[];
  isPositive: boolean;
}

export function SparklineChart({ data, isPositive }: SparklineChartProps) {
  const color = isPositive ? "hsl(142, 71%, 45%)" : "hsl(0, 72%, 51%)";
  const fillColor = isPositive ? "hsl(142, 71%, 45%)" : "hsl(0, 72%, 51%)";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${isPositive ? 'positive' : 'negative'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#gradient-${isPositive ? 'positive' : 'negative'})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
