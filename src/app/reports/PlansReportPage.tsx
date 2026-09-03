import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BILLING_CYCLE_LABELS } from "@/constant";
import { formatAmount, formatAmountValue, formatNumber } from "@/lib/amount";
import { downloadCsv } from "@/lib/csv";
import { useGetPlanReportQuery } from "@/redux/apis/reportApis";
import type { BillingCycle } from "@/types/domain/plan";
import type { PlanReportRow } from "@/types/domain/report";
import { CreditCard, Layers, Receipt, Wallet } from "lucide-react";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ReportLayout } from "./components/ReportLayout";
import { describePeriod } from "./report-period";
import { reportCsvColumns, toCsvRows } from "./report-csv";
import { useReportRange } from "./use-report-range";
import { ReportStats } from "./components/ReportStats";
import { ReportTable, type ReportColumn } from "./components/ReportTable";

const CHART_CONFIG = {
  collectedRevenue: { label: "Collected revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

const TOP_PLANS_IN_CHART = 8;

export default function PlansReportPage() {
  const { range, setFilter, clearFilters } = useReportRange();
  const { data, isLoading, isFetching } = useGetPlanReportQuery(range);

  const currency = data?.currency ?? "BDT";
  const rows = React.useMemo(() => data?.rows ?? [], [data?.rows]);
  const totals = data?.totals;

  const chartData = React.useMemo(
    () =>
      rows
        .slice(0, TOP_PLANS_IN_CHART)
        .map((row) => ({ ...row, label: row.planName })),
    [rows]
  );

  const columns = React.useMemo<ReportColumn<PlanReportRow>[]>(
    () => [
      {
        key: "planName",
        label: "Plan",
        render: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.planName}</p>
            <p className="text-[11px] text-muted-foreground">
              {BILLING_CYCLE_LABELS[row.billingCycle as BillingCycle] ?? row.billingCycle} ·{" "}
              {formatAmountValue(row.price)}
            </p>
          </div>
        ),
        csv: (row) => row.planName,
      },
      {
        key: "sales",
        label: "Sales",
        align: "right",
        render: (row) => formatNumber(row.sales),
        csv: (row) => row.sales,
      },
      {
        key: "activeSubscriptions",
        label: "Active",
        align: "right",
        render: (row) => formatNumber(row.activeSubscriptions),
        csv: (row) => row.activeSubscriptions,
      },
      {
        key: "collectedRevenue",
        label: "Collected",
        align: "right",
        render: (row) => (
          <span className="font-medium">{formatAmountValue(row.collectedRevenue)}</span>
        ),
        csv: (row) => row.collectedRevenue,
      },
      {
        key: "outstanding",
        label: "Outstanding",
        align: "right",
        render: (row) => formatAmountValue(row.outstanding),
        csv: (row) => row.outstanding,
      },
      {
        key: "share",
        label: "Revenue share",
        align: "right",
        render: (row) => (
          <div className="flex items-center justify-end gap-2">
            <Progress value={row.share} className="h-1.5 w-16" />
            <span className="w-11 text-right tabular-nums">{row.share}%</span>
          </div>
        ),
        csv: (row) => row.share,
      },
    ],
    []
  );

  const onExport = () =>
    downloadCsv("plan-performance-report", toCsvRows(rows, columns), reportCsvColumns(columns));

  const topPlan = rows[0];

  return (
    <ReportLayout
      title="Plan performance"
      description="How each subscription plan sells, earns and retains across the selected period."
      range={range}
      onFilterChange={setFilter}
      onReset={clearFilters}
      onExport={onExport}
      isFetching={isFetching}
      showGroupBy={false}
      currency={currency}
      periodLabel={describePeriod(data?.period.from, data?.period.to)}
    >
      <ReportStats
        isLoading={isLoading}
        items={[
          {
            label: "Plans",
            value: formatNumber(totals?.plans),
            description: "In the catalog",
            icon: Layers,
            color: "default",
          },
          {
            label: "Sales",
            value: formatNumber(totals?.sales),
            description: "Across every plan",
            icon: Receipt,
            color: "info",
          },
          {
            label: "Collected",
            value: formatAmountValue(totals?.collectedRevenue),
            description: "Paid subscriptions only",
            icon: Wallet,
            color: "success",
          },
          {
            label: "Top plan",
            value: topPlan?.planName ?? "—",
            description: topPlan
              ? `${topPlan.share}% of collected revenue`
              : "No sales in this period",
            icon: CreditCard,
            color: "warning",
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue by plan</CardTitle>
          <CardDescription>Collected revenue for the highest-earning plans.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <ChartContainer config={CHART_CONFIG} className="h-72 w-full">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => formatNumber(value)}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatAmount(Number(value), currency)}
                    />
                  }
                />
                <Bar
                  dataKey="collectedRevenue"
                  fill="var(--color-collectedRevenue)"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <ReportTable
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        getRowId={(row) => row.planId}
        emptyMessage="No plans in the catalog yet."
      />
    </ReportLayout>
  );
}
