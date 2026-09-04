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
import type { CalendarTrendPoint } from "@/types/domain/calendarOverview";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const CHART_CONFIG = {
  events: { label: "Event registrations", color: "var(--chart-1)" },
  meetings: { label: "Meeting registrations", color: "var(--chart-2)" },
  bookings: { label: "Booking requests", color: "var(--chart-3)" },
} satisfies ChartConfig;

interface CalendarTrendChartProps {
  points: CalendarTrendPoint[];
  isLoading: boolean;
}

export function CalendarTrendChart({ points, isLoading }: CalendarTrendChartProps) {
  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const data = points.map((point) => ({ ...point, label: monthLabel(point.month) }));

  return (
    <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
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
        <Area
          dataKey="events"
          type="monotone"
          stackId="registrations"
          stroke="var(--color-events)"
          fill="var(--color-events)"
          fillOpacity={0.25}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Area
          dataKey="meetings"
          type="monotone"
          stackId="registrations"
          stroke="var(--color-meetings)"
          fill="var(--color-meetings)"
          fillOpacity={0.25}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Area
          dataKey="bookings"
          type="monotone"
          stackId="registrations"
          stroke="var(--color-bookings)"
          fill="var(--color-bookings)"
          fillOpacity={0.25}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
