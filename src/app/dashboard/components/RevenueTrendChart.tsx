import { compactNumber, monthLabel } from "@/app/dashboard/dashboard-format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/amount";
import type { RevenuePoint } from "@/types/domain/dashboard";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const CHART_CONFIG = {
  revenue: { label: "Paid revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface RevenueTrendChartProps {
  points: RevenuePoint[];
  currency: string;
  isLoading: boolean;
}

export function RevenueTrendChart({ points, currency, isLoading }: RevenueTrendChartProps) {
  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const data = points.map((point) => ({ ...point, label: monthLabel(point.month) }));

  return (
    <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="dashboard-revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          minTickGap={0}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(value: number) => compactNumber(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatAmount(Number(value), currency)}
            />
          }
        />
        <Area
          dataKey="revenue"
          type="monotone"
          stroke="var(--color-revenue)"
          strokeWidth={2}
          fill="url(#dashboard-revenue-fill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
