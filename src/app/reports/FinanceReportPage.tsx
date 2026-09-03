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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { FINANCE_CATEGORY_TYPE_COLORS, FINANCE_CATEGORY_TYPE_LABELS } from "@/constant";
import { formatAmount, formatAmountValue, formatNumber } from "@/lib/amount";
import { downloadCsv } from "@/lib/csv";
import { useGetFinanceReportQuery } from "@/redux/apis/reportApis";
import type { FinanceCategoryRow, FinanceReportRow } from "@/types/domain/report";
import { ArrowDownRight, ArrowUpRight, Percent, Scale } from "lucide-react";
import * as React from "react";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { ReportLayout } from "./components/ReportLayout";
import { reportCsvColumns, toCsvRows } from "./report-csv";
import { useReportRange } from "./use-report-range";
import { ReportStats } from "./components/ReportStats";
import { ReportTable, type ReportColumn } from "./components/ReportTable";
import { describePeriod, formatPeriodLabel } from "./report-period";

const CHART_CONFIG = {
  income: { label: "Income", color: "var(--chart-1)" },
  expense: { label: "Expense", color: "var(--chart-2)" },
  net: { label: "Net", color: "var(--chart-3)" },
} satisfies ChartConfig;

export default function FinanceReportPage() {
  const { range, setFilter, clearFilters } = useReportRange();
  const { data, isLoading, isFetching } = useGetFinanceReportQuery(range);

  const currency = data?.currency ?? "BDT";
  const groupBy = data?.period.groupBy ?? "month";
  const rows = React.useMemo(() => data?.rows ?? [], [data?.rows]);
  const categories = React.useMemo(() => data?.categories ?? [], [data?.categories]);
  const totals = data?.totals;

  const chartData = React.useMemo(
    () => rows.map((row) => ({ ...row, label: formatPeriodLabel(row.period, groupBy) })),
    [rows, groupBy]
  );

  const columns = React.useMemo<ReportColumn<FinanceReportRow>[]>(
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
        key: "income",
        label: "Income",
        align: "right",
        render: (row) => (
          <span className="text-emerald-600 dark:text-emerald-400">
            {formatAmountValue(row.income)}
          </span>
        ),
        csv: (row) => row.income,
      },
      {
        key: "expense",
        label: "Expense",
        align: "right",
        render: (row) => (
          <span className="text-orange-600 dark:text-orange-400">
            {formatAmountValue(row.expense)}
          </span>
        ),
        csv: (row) => row.expense,
      },
      {
        key: "net",
        label: "Net",
        align: "right",
        render: (row) => (
          <span className={row.net < 0 ? "font-medium text-red-600 dark:text-red-400" : "font-medium"}>
            {formatAmountValue(row.net)}
          </span>
        ),
        csv: (row) => row.net,
      },
    ],
    [groupBy]
  );

  const categoryColumns = React.useMemo<ReportColumn<FinanceCategoryRow>[]>(
    () => [
      {
        key: "categoryName",
        label: "Category",
        render: (row) => <span className="font-medium">{row.categoryName}</span>,
        csv: (row) => row.categoryName,
      },
      {
        key: "type",
        label: "Type",
        render: (row) => (
          <StatusBadge
            color={FINANCE_CATEGORY_TYPE_COLORS[row.type]}
            label={FINANCE_CATEGORY_TYPE_LABELS[row.type]}
          />
        ),
        csv: (row) => row.type,
      },
      {
        key: "entries",
        label: "Entries",
        align: "right",
        render: (row) => formatNumber(row.entries),
        csv: (row) => row.entries,
      },
      {
        key: "amount",
        label: "Amount",
        align: "right",
        render: (row) => formatAmountValue(row.amount),
        csv: (row) => row.amount,
      },
      {
        key: "share",
        label: "Share",
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
    downloadCsv(`finance-report-${groupBy}`, toCsvRows(rows, columns), reportCsvColumns(columns));

  const net = totals?.net ?? 0;

  return (
    <ReportLayout
      title="Income & expense"
      description="Cash in versus cash out, the resulting net profit and the categories driving both."
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
            label: "Income",
            value: formatAmountValue(totals?.income),
            description: "Recorded in this period",
            icon: ArrowUpRight,
            color: "success",
          },
          {
            label: "Expense",
            value: formatAmountValue(totals?.expense),
            description: "Recorded in this period",
            icon: ArrowDownRight,
            color: "warning",
          },
          {
            label: "Net profit",
            value: formatAmountValue(net),
            description: net < 0 ? "Running at a loss" : "Income minus expense",
            icon: Scale,
            color: net < 0 ? "error" : "success",
          },
          {
            label: "Margin",
            value: `${totals?.margin ?? 0}%`,
            description: "Net as a share of income",
            icon: Percent,
            color: "info",
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cash flow</CardTitle>
          <CardDescription>Income and expense per period, with the net line.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <ChartContainer config={CHART_CONFIG} className="h-72 w-full">
              <ComposedChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
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
                  stroke="var(--color-net)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <ReportTable
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        getRowId={(row) => row.period}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By category</CardTitle>
          <CardDescription>
            Where the money came from and where it went in this period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportTable
            columns={categoryColumns}
            rows={categories}
            isLoading={isLoading}
            getRowId={(row) => `${row.type}-${row.categoryId}`}
            emptyMessage="No income or expense recorded in this period."
          />
        </CardContent>
      </Card>
    </ReportLayout>
  );
}
