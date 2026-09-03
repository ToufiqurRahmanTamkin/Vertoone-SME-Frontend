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
import type { DocumentsTrendPoint } from "@/types/domain/documentsOverview";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

const CHART_CONFIG = {
  uploaded: { label: "Documents added", color: "var(--chart-2)" },
  signed: { label: "Contracts signed", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface DocumentsTrendChartProps {
  points: DocumentsTrendPoint[];
  isLoading: boolean;
}

export function DocumentsTrendChart({ points, isLoading }: DocumentsTrendChartProps) {
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
          dataKey="uploaded"
          fill="var(--color-uploaded)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
        <Line
          dataKey="signed"
          type="monotone"
          stroke="var(--color-signed)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
