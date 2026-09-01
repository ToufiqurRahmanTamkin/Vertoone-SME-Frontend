import { compactNumber, monthLabel } from "@/app/dashboard/dashboard-format";
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
import type { BusinessToolsTrendPoint } from "@/types/domain/businessToolsDashboard";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

const CHART_CONFIG = {
  emailsSent: { label: "Emails sent", color: "var(--chart-1)" },
  responses: { label: "Form responses", color: "var(--chart-2)" },
  published: { label: "Items published", color: "var(--chart-4)" },
} satisfies ChartConfig;

interface BusinessToolsTrendChartProps {
  points: BusinessToolsTrendPoint[];
  isLoading: boolean;
}

export function BusinessToolsTrendChart({ points, isLoading }: BusinessToolsTrendChartProps) {
  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const data = points.map((point) => ({ ...point, label: monthLabel(point.month) }));

  return (
    <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
      <ComposedChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
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
        <Bar
          dataKey="emailsSent"
          fill="var(--color-emailsSent)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
        <Bar
          dataKey="responses"
          fill="var(--color-responses)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
        <Line
          dataKey="published"
          type="monotone"
          stroke="var(--color-published)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
