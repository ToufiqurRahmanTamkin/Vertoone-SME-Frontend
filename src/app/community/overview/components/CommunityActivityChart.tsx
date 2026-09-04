import { compactNumber } from "@/app/dashboard/dashboard-format";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/amount";
import { safeFormat } from "@/lib/date";
import type { CommunityActivityPoint } from "@/types/domain/community";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const CHART_CONFIG = {
  posts: { label: "Posts", color: "var(--chart-1)" },
  comments: { label: "Comments", color: "var(--chart-2)" },
  reactions: { label: "Reactions", color: "var(--chart-3)" },
} satisfies ChartConfig;

interface CommunityActivityChartProps {
  points: CommunityActivityPoint[];
  isLoading: boolean;
}

export function CommunityActivityChart({ points, isLoading }: CommunityActivityChartProps) {
  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const data = points.map((point) => ({
    ...point,
    label: safeFormat(point.date, "MMM d", point.date),
  }));

  return (
    <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          allowDecimals={false}
          tickFormatter={(value: number) => compactNumber(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <span className="flex w-full justify-between gap-3">
                  <span className="text-muted-foreground">
                    {CHART_CONFIG[name as keyof typeof CHART_CONFIG]?.label ?? name}
                  </span>
                  <span className="font-medium tabular-nums">{formatNumber(Number(value))}</span>
                </span>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="reactions"
          type="monotone"
          stackId="activity"
          stroke="var(--color-reactions)"
          fill="var(--color-reactions)"
          fillOpacity={0.18}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Area
          dataKey="comments"
          type="monotone"
          stackId="activity"
          stroke="var(--color-comments)"
          fill="var(--color-comments)"
          fillOpacity={0.18}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Area
          dataKey="posts"
          type="monotone"
          stackId="activity"
          stroke="var(--color-posts)"
          fill="var(--color-posts)"
          fillOpacity={0.24}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
