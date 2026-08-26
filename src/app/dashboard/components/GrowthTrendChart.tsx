import { monthLabel } from "@/app/dashboard/dashboard-format";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { RevenuePoint } from "@/types/domain/dashboard";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const CHART_CONFIG = {
  sales: { label: "Subscriptions sold", color: "var(--chart-1)" },
  companies: { label: "Companies registered", color: "var(--chart-2)" },
} satisfies ChartConfig;

interface GrowthTrendChartProps {
  points: RevenuePoint[];
  isLoading: boolean;
}

export function GrowthTrendChart({ points, isLoading }: GrowthTrendChartProps) {
  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const data = points.map((point) => ({ ...point, label: monthLabel(point.month) }));

  return (
    <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
      <LineChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
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
        <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="sales"
          type="monotone"
          stroke="var(--color-sales)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
        <Line
          dataKey="companies"
          type="monotone"
          stroke="var(--color-companies)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
