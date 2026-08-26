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
import { LOGIN_DEVICE_TYPE_LABELS } from "@/constant";
import { formatNumber } from "@/lib/amount";
import { downloadCsv } from "@/lib/csv";
import { formatDateTime } from "@/lib/date";
import { deviceIcon } from "@/lib/device-icons";
import { useGetSecurityReportQuery } from "@/redux/apis/reportApis";
import type { SecurityDeviceRow, SecurityReportRow } from "@/types/domain/report";
import type { LoginDeviceType } from "@/types/domain/loginHistory";
import { Globe, Laptop, ShieldAlert, ShieldCheck } from "lucide-react";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ReportLayout } from "./components/ReportLayout";
import { reportCsvColumns, toCsvRows } from "./report-csv";
import { useReportRange } from "./use-report-range";
import { ReportStats } from "./components/ReportStats";
import { ReportTable, type ReportColumn } from "./components/ReportTable";
import { describePeriod, formatPeriodLabel } from "./report-period";

const CHART_CONFIG = {
  successful: { label: "Successful", color: "var(--chart-1)" },
  failed: { label: "Failed", color: "var(--chart-4)" },
} satisfies ChartConfig;

export default function SecurityReportPage() {
  const { range, setFilter, clearFilters } = useReportRange();
  const { data, isLoading, isFetching } = useGetSecurityReportQuery(range);

  const groupBy = data?.period.groupBy ?? "month";
  const rows = React.useMemo(() => data?.rows ?? [], [data?.rows]);
  const devices = React.useMemo(() => data?.devices ?? [], [data?.devices]);
  const totals = data?.totals;

  const chartData = React.useMemo(
    () => rows.map((row) => ({ ...row, label: formatPeriodLabel(row.period, groupBy) })),
    [rows, groupBy]
  );

  const columns = React.useMemo<ReportColumn<SecurityReportRow>[]>(
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
        key: "successful",
        label: "Successful",
        align: "right",
        render: (row) => (
          <span className="text-emerald-600 dark:text-emerald-400">
            {formatNumber(row.successful)}
          </span>
        ),
        csv: (row) => row.successful,
      },
      {
        key: "failed",
        label: "Failed",
        align: "right",
        render: (row) => (
          <span className={row.failed > 0 ? "text-red-600 dark:text-red-400" : undefined}>
            {formatNumber(row.failed)}
          </span>
        ),
        csv: (row) => row.failed,
      },
    ],
    [groupBy]
  );

  const deviceColumns = React.useMemo<ReportColumn<SecurityDeviceRow>[]>(
    () => [
      {
        key: "deviceName",
        label: "Device",
        render: (row) => {
          const Icon = deviceIcon(row.deviceType);
          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{row.deviceName}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {LOGIN_DEVICE_TYPE_LABELS[row.deviceType as LoginDeviceType] ?? row.deviceType}
                </p>
              </div>
            </div>
          );
        },
        csv: (row) => row.deviceName,
      },
      {
        key: "browser",
        label: "Browser",
        render: (row) => <span className="text-sm">{row.browser}</span>,
        csv: (row) => row.browser,
      },
      {
        key: "os",
        label: "Operating system",
        render: (row) => <span className="text-sm">{row.os}</span>,
        csv: (row) => row.os,
      },
      {
        key: "logins",
        label: "Sign-ins",
        align: "right",
        render: (row) => formatNumber(row.logins),
        csv: (row) => row.logins,
      },
      {
        key: "lastSeenAt",
        label: "Last seen",
        align: "right",
        render: (row) => (
          <span className="text-xs text-muted-foreground">{formatDateTime(row.lastSeenAt)}</span>
        ),
        csv: (row) => row.lastSeenAt ?? "",
      },
    ],
    []
  );

  const onExport = () =>
    downloadCsv(`sign-in-report-${groupBy}`, toCsvRows(rows, columns), reportCsvColumns(columns));

  const failed = totals?.failed ?? 0;

  return (
    <ReportLayout
      title="Sign-in activity"
      description="Successful and failed sign-in attempts across the console, and the devices behind them."
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
            label: "Successful",
            value: formatNumber(totals?.successful),
            description: "Sign-ins in this period",
            icon: ShieldCheck,
            color: "success",
          },
          {
            label: "Failed",
            value: formatNumber(failed),
            description: failed > 0 ? "Review if this looks unusual" : "No failed attempts",
            icon: ShieldAlert,
            color: failed > 0 ? "error" : "default",
          },
          {
            label: "Networks",
            value: formatNumber(totals?.distinctIps),
            description: "Distinct IP addresses seen",
            icon: Globe,
            color: "info",
          },
          {
            label: "Devices",
            value: formatNumber(devices.length),
            description: "Distinct devices signed in",
            icon: Laptop,
            color: "default",
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sign-in attempts</CardTitle>
          <CardDescription>Successful versus failed attempts per period.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <ChartContainer config={CHART_CONFIG} className="h-72 w-full">
              <BarChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="successful"
                  fill="var(--color-successful)"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="failed"
                  fill="var(--color-failed)"
                  radius={[4, 4, 0, 0]}
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
        getRowId={(row) => row.period}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Devices</CardTitle>
          <CardDescription>Devices that signed in successfully during this period.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportTable
            columns={deviceColumns}
            rows={devices}
            isLoading={isLoading}
            getRowId={(row) => `${row.deviceName}-${row.browser}-${row.os}`}
            emptyMessage="No successful sign-ins in this period."
          />
        </CardContent>
      </Card>
    </ReportLayout>
  );
}
