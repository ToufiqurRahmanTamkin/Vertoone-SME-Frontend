import { formatAmountValue, formatNumber } from "@/lib/amount";
import { downloadCsv } from "@/lib/csv";
import { formatDate } from "@/lib/date";
import { useGetCustomerReportQuery } from "@/redux/apis/reportApis";
import type { CustomerReportRow } from "@/types/domain/report";
import { Crown, Users, Wallet } from "lucide-react";
import * as React from "react";
import { ReportLayout } from "./components/ReportLayout";
import { describePeriod } from "./report-period";
import { reportCsvColumns, toCsvRows } from "./report-csv";
import { useReportRange } from "./use-report-range";
import { ReportStats } from "./components/ReportStats";
import { ReportTable, type ReportColumn } from "./components/ReportTable";

export default function CustomersReportPage() {
  const { range, setFilter, clearFilters } = useReportRange();
  const { data, isLoading, isFetching } = useGetCustomerReportQuery(range);

  const currency = data?.currency ?? "BDT";
  const rows = React.useMemo(() => data?.rows ?? [], [data?.rows]);
  const totals = data?.totals;

  const columns = React.useMemo<ReportColumn<CustomerReportRow>[]>(
    () => [
      {
        key: "customerName",
        label: "Customer",
        render: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.customerName}</p>
            <p className="truncate text-[11px] text-muted-foreground">{row.customerEmail}</p>
          </div>
        ),
        csv: (row) => row.customerName,
      },
      {
        key: "companyName",
        label: "Company",
        render: (row) => (
          <span className="text-sm text-muted-foreground">{row.companyName || "—"}</span>
        ),
        csv: (row) => row.companyName,
      },
      {
        key: "subscriptions",
        label: "Subscriptions",
        align: "right",
        render: (row) => formatNumber(row.subscriptions),
        csv: (row) => row.subscriptions,
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
        render: (row) => (
          <span className={row.outstanding > 0 ? "text-amber-600 dark:text-amber-400" : undefined}>
            {formatAmountValue(row.outstanding)}
          </span>
        ),
        csv: (row) => row.outstanding,
      },
      {
        key: "lastPurchaseAt",
        label: "Last purchase",
        align: "right",
        render: (row) => (
          <span className="text-xs text-muted-foreground">{formatDate(row.lastPurchaseAt)}</span>
        ),
        csv: (row) => row.lastPurchaseAt ?? "",
      },
    ],
    []
  );

  const onExport = () =>
    downloadCsv("customer-report", toCsvRows(rows, columns), reportCsvColumns(columns));

  const topCustomer = rows[0];

  return (
    <ReportLayout
      title="Customer report"
      description="The customers driving revenue in this period, ranked by what they have actually paid."
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
            label: "Customers",
            value: formatNumber(totals?.customers),
            description: "Bought at least once in this period",
            icon: Users,
            color: "info",
          },
          {
            label: "Collected revenue",
            value: formatAmountValue(totals?.collectedRevenue),
            description: "Paid across all customers",
            icon: Wallet,
            color: "success",
          },
          {
            label: "Average per customer",
            value: formatAmountValue(totals?.averageRevenuePerCustomer),
            description: "Collected revenue ÷ customers",
            icon: Wallet,
            color: "default",
          },
          {
            label: "Top customer",
            value: topCustomer?.customerName ?? "—",
            description: topCustomer
              ? formatAmountValue(topCustomer.collectedRevenue)
              : "No purchases in this period",
            icon: Crown,
            color: "warning",
          },
        ]}
      />

      <ReportTable
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        getRowId={(row) => row.customerEmail}
        emptyMessage="No customer purchases in this period."
      />
    </ReportLayout>
  );
}
