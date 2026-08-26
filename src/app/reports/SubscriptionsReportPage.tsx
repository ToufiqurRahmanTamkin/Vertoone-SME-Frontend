import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_STATUS_LABELS } from "@/constant";
import { formatAmount, formatNumber } from "@/lib/amount";
import { downloadCsv } from "@/lib/csv";
import { useGetSubscriptionReportQuery } from "@/redux/apis/reportApis";
import type { SubscriptionReportRow } from "@/types/domain/report";
import type { SubscriptionStatus } from "@/types/domain/soldSubscription";
import { CalendarClock, Receipt, RefreshCcw, Zap } from "lucide-react";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ReportLayout } from "./components/ReportLayout";
import { reportCsvColumns, toCsvRows } from "./report-csv";
import { useReportRange } from "./use-report-range";
import { ReportStats } from "./components/ReportStats";
import { ReportTable, type ReportColumn } from "./components/ReportTable";
import { describePeriod, formatPeriodLabel } from "./report-period";

const CHART_CONFIG = {
  created: { label: "Created", color: "var(--chart-1)" },
  activated: { label: "Active", color: "var(--chart-2)" },
  expired: { label: "Expired", color: "var(--chart-3)" },
  cancelled: { label: "Cancelled", color: "var(--chart-4)" },
} satisfies ChartConfig;

export default function SubscriptionsReportPage() {
  const { range, setFilter, clearFilters } = useReportRange();
  const { data, isLoading, isFetching } = useGetSubscriptionReportQuery(range);

  const currency = data?.currency ?? "BDT";
  const groupBy = data?.period.groupBy ?? "month";
  const rows = React.useMemo(() => data?.rows ?? [], [data?.rows]);
  const totals = data?.totals;
  const statusBreakdown = React.useMemo(() => data?.statusBreakdown ?? [], [data?.statusBreakdown]);

  const chartData = React.useMemo(
    () => rows.map((row) => ({ ...row, label: formatPeriodLabel(row.period, groupBy) })),
    [rows, groupBy]
  );

  const columns = React.useMemo<ReportColumn<SubscriptionReportRow>[]>(
    () => [
      {
        key: "period",
        label: "Period",
        render: (row) => (
          <span className="font-medium">{formatPeriodLabel(row.period, groupBy)}</span>
        ),
        csv: (row) => row.period,
      },
      {
        key: "created",
        label: "Created",
        align: "right",
        render: (row) => formatNumber(row.created),
        csv: (row) => row.created,
      },
      {
        key: "activated",
        label: "Active",
        align: "right",
        render: (row) => formatNumber(row.activated),
        csv: (row) => row.activated,
      },
      {
        key: "expired",
        label: "Expired",
        align: "right",
        render: (row) => formatNumber(row.expired),
        csv: (row) => row.expired,
      },
      {
        key: "cancelled",
        label: "Cancelled",
        align: "right",
        render: (row) => formatNumber(row.cancelled),
        csv: (row) => row.cancelled,
      },
    ],
    [groupBy]
  );

  const onExport = () =>
    downloadCsv(
      `subscription-report-${groupBy}`,
      toCsvRows(rows, columns),
      reportCsvColumns(columns)
    );

  return (
    <ReportLayout
      title="Subscription report"
      description="How many subscriptions were created, activated, expired and cancelled across the period."
      range={range}
      onFilterChange={setFilter}
      onReset={clearFilters}
      onExport={onExport}
      isFetching={isFetching}
      periodLabel={describePeriod(data?.period.from, data?.period.to)}
    >
      <ReportStats
        isLoading={isLoading}
        items={[
          {
            label: "New subscriptions",
            value: formatNumber(totals?.created),
            description: "Created in this period",
            icon: Receipt,
            color: "info",
          },
          {
            label: "Active now",
            value: formatNumber(totals?.active),
            description: "Across all periods",
            icon: Zap,
            color: "success",
          },
          {
            label: "Expiring soon",
            value: formatNumber(totals?.expiringSoon),
            description: "Within the next 30 days",
            icon: CalendarClock,
            color: "warning",
          },
          {
            label: "Auto-renew rate",
            value: `${totals?.renewalRate ?? 0}%`,
            description: "Of active subscriptions",
            icon: RefreshCcw,
            color: "default",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Subscription lifecycle</CardTitle>
            <CardDescription>Created, active, expired and cancelled per period.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ChartContainer config={CHART_CONFIG} className="h-72 w-full">
                <AreaChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    dataKey="created"
                    stroke="var(--color-created)"
                    fill="var(--color-created)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <Area
                    dataKey="activated"
                    stroke="var(--color-activated)"
                    fill="var(--color-activated)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <Area
                    dataKey="expired"
                    stroke="var(--color-expired)"
                    fill="var(--color-expired)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <Area
                    dataKey="cancelled"
                    stroke="var(--color-cancelled)"
                    fill="var(--color-cancelled)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status breakdown</CardTitle>
            <CardDescription>Subscriptions created in this period, by status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-full" />
              ))
            ) : statusBreakdown.length > 0 ? (
              statusBreakdown.map((entry) => (
                <div key={entry.status} className="flex items-center justify-between gap-3 text-sm">
                  <StatusBadge
                    color={
                      SUBSCRIPTION_STATUS_COLORS[entry.status as SubscriptionStatus] ?? "muted"
                    }
                    label={
                      SUBSCRIPTION_STATUS_LABELS[entry.status as SubscriptionStatus] ??
                      entry.status
                    }
                  />
                  <div className="text-right">
                    <p className="font-medium tabular-nums">{formatNumber(entry.count)}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatAmount(entry.amount, currency)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No subscriptions in this period.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <ReportTable
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        getRowId={(row) => row.period}
      />
    </ReportLayout>
  );
}
