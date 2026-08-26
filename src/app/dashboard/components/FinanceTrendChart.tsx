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
import { formatAmount } from "@/lib/amount";
import type { FinancePoint } from "@/types/domain/dashboard";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

const CHART_CONFIG = {
  income: { label: "Income", color: "var(--chart-2)" },
  expense: { label: "Expense", color: "var(--chart-5)" },
  net: { label: "Net", color: "var(--chart-3)" },
} satisfies ChartConfig;

interface FinanceTrendChartProps {
  points: FinancePoint[];
  currency: string;
  isLoading: boolean;
}

export function FinanceTrendChart({ points, currency, isLoading }: FinanceTrendChartProps) {
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
          width={52}
          tickFormatter={(value: number) => compactNumber(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <span className="flex w-full justify-between gap-3">
                  <span className="text-muted-foreground">{CHART_CONFIG[name as keyof typeof CHART_CONFIG]?.label ?? name}</span>
                  <span className="font-medium tabular-nums">
                    {formatAmount(Number(value), currency)}
                  </span>
                </span>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="income"
          fill="var(--color-income)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
        <Bar
          dataKey="expense"
          fill="var(--color-expense)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
        <Line
          dataKey="net"
          type="monotone"
          stroke="var(--color-net)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
