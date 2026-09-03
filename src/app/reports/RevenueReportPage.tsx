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
import { formatAmount, formatAmountValue, formatNumber } from "@/lib/amount";
import { downloadCsv } from "@/lib/csv";
import { useGetRevenueReportQuery } from "@/redux/apis/reportApis";
import type { RevenueReportRow } from "@/types/domain/report";
import { Banknote, Receipt, TrendingUp, Wallet } from "lucide-react";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ReportLayout } from "./components/ReportLayout";
import { reportCsvColumns, toCsvRows } from "./report-csv";
import { useReportRange } from "./use-report-range";
import { ReportStats } from "./components/ReportStats";
import { ReportTable, type ReportColumn } from "./components/ReportTable";
import { describePeriod, formatPeriodLabel } from "./report-period";

const CHART_CONFIG = {
  collectedRevenue: { label: "Collected", color: "var(--chart-1)" },
  outstanding: { label: "Outstanding", color: "var(--chart-2)" },
  sales: { label: "Sales", color: "var(--chart-3)" },
} satisfies ChartConfig;

export default function RevenueReportPage() {
  const { range, setFilter, clearFilters } = useReportRange();
  const { data, isLoading, isFetching } = useGetRevenueReportQuery(range);

  const currency = data?.currency ?? "BDT";
  const groupBy = data?.period.groupBy ?? "month";
  const rows = React.useMemo(() => data?.rows ?? [], [data?.rows]);
  const totals = data?.totals;

  const chartData = React.useMemo(
    () => rows.map((row) => ({ ...row, label: formatPeriodLabel(row.period, groupBy) })),
    [rows, groupBy]
  );

  const columns = React.useMemo<ReportColumn<RevenueReportRow>[]>(
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
        key: "grossRevenue",
        label: "Gross",
        align: "right",
        render: (row) => formatAmountValue(row.grossRevenue),
        csv: (row) => row.grossRevenue,
      },
      {
        key: "collectedRevenue",
        label: "Collected",
        align: "right",
        render: (row) => (
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {formatAmountValue(row.collectedRevenue)}
          </span>
        ),
        csv: (row) => row.collectedRevenue,
      },
      {
        key: "outstanding",
        label: "Outstanding",
        align: "right",
        render: (row) => (
          <span className={row.outstanding > 0 ? "text-amber-600 dark:text-amber-400" : undefined}>
            {formatAmountValue(row.outstanding)}
          </span>
        ),
        csv: (row) => row.outstanding,
      },
      {
        key: "refunded",
        label: "Refunded",
        align: "right",
        render: (row) => formatAmountValue(row.refunded),
        csv: (row) => row.refunded,
      },
      {
        key: "sales",
        label: "Sales",
        align: "right",
        render: (row) => formatNumber(row.sales),
        csv: (row) => row.sales,
      },
    ],
    [groupBy]
  );

  const onExport = () =>
    downloadCsv(`revenue-report-${groupBy}`, toCsvRows(rows, columns), reportCsvColumns(columns));

  return (
    <ReportLayout
      title="Revenue report"
      description="Gross, collected and outstanding revenue over time, with the sale volume behind it."
      range={range}
      onFilterChange={setFilter}
      onReset={clearFilters}
      onExport={onExport}
      isFetching={isFetching}
      currency={currency}
      periodLabel={describePeriod(data?.period.from, data?.period.to)}
    >
      <ReportStats
        isLoading={isLoading}
        items={[
          {
            label: "Collected",
            value: formatAmountValue(totals?.collectedRevenue),
            description: `of ${formatAmountValue(totals?.grossRevenue)} invoiced`,
            icon: Wallet,
            color: "success",
          },
          {
            label: "Outstanding",
            value: formatAmountValue(totals?.outstanding),
            description: "Invoiced but not yet collected",
            icon: Banknote,
            color: "warning",
          },
          {
            label: "Sales",
            value: formatNumber(totals?.sales),
            description: `${formatAmountValue(totals?.averageSaleValue)} average value`,
            icon: Receipt,
            color: "info",
          },
          {
            label: "Refunded",
            value: formatAmountValue(totals?.refunded),
            description: "Returned to customers",
            icon: TrendingUp,
            color: "error",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Collected vs outstanding</CardTitle>
            <CardDescription>Revenue recognised in each period.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ChartContainer config={CHART_CONFIG} className="h-72 w-full">
                <BarChart data={chartData} margin={{ left: 4, right: 4, top: 4 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={(value: number) => formatNumber(value)}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatAmount(Number(value), currency)}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="collectedRevenue"
                    stackId="revenue"
                    fill="var(--color-collectedRevenue)"
                    radius={[0, 0, 4, 4]}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="outstanding"
                    stackId="revenue"
                    fill="var(--color-outstanding)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sale volume</CardTitle>
            <CardDescription>Subscriptions invoiced per period.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ChartContainer config={CHART_CONFIG} className="h-72 w-full">
                <LineChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="sales"
                    stroke="var(--color-sales)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ChartContainer>
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
