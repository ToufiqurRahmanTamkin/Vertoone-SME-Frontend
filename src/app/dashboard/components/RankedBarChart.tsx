import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/amount";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export interface RankedBarRow {
  key: string;
  label: string;
  value: number;
}

interface RankedBarChartProps {
  rows: RankedBarRow[];
  valueLabel: string;
  color?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function RankedBarChart({
  rows,
  valueLabel,
  color = "var(--chart-1)",
  isLoading = false,
  emptyMessage = "Nothing to show yet.",
}: RankedBarChartProps) {
  if (isLoading) return <Skeleton className="h-64 w-full" />;

  if (rows.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const config = { value: { label: valueLabel, color } } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={rows} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(value: number) => formatNumber(value)}
        />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={130}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => formatNumber(Number(value))} />}
        />
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          radius={[0, 4, 4, 0]}
          barSize={18}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}
