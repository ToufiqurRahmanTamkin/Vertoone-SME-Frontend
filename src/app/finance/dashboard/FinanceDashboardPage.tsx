import { BreakdownBars, type BreakdownRow } from "@/app/dashboard/components/BreakdownBars";
import { FinanceTrendChart } from "@/app/dashboard/components/FinanceTrendChart";
import { KpiCard } from "@/app/dashboard/components/KpiCard";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatGrid } from "@/components/ui/stat";
import {
  FINANCE_CATEGORY_TYPE_COLORS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_COLORS,
  INVOICE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/constant";
import { formatAmount, formatNumber } from "@/lib/amount";
import { formatDate, formatDateTime } from "@/lib/date";
import { useGetFinanceDashboardQuery } from "@/redux/apis/financeApis";
import type { CategoryBreakdownEntry } from "@/types/domain/financeDashboard";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  FileText,
  Layers,
  Percent,
  Receipt,
  Scale,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

const categoryRows = (
  entries: CategoryBreakdownEntry[],
  type: "INCOME" | "EXPENSE",
  currency: string
): BreakdownRow[] =>
  entries.map((entry) => ({
    key: entry.categoryId,
    label: entry.categoryName,
    count: entry.count,
    color: FINANCE_CATEGORY_TYPE_COLORS[type],
    valueLabel: formatAmount(entry.amount, currency),
  }));

export default function FinanceDashboardPage() {
  const { data, isLoading } = useGetFinanceDashboardQuery();

  const currency = data?.currency ?? "BDT";
  const ledger = data?.kpis.ledger;
  const receivables = data?.kpis.receivables;
  const invoices = data?.kpis.invoices;
  const entries = data?.kpis.entries;

  const net = ledger?.net ?? 0;
  const overdueCount = receivables?.overdueCount ?? 0;
  const draftCount = invoices?.draft ?? 0;
  const dueThisWeek = receivables?.dueThisWeek ?? 0;
  const hasAlerts = overdueCount > 0 || draftCount > 0 || dueThisWeek > 0;

  const ledgerCards = [
    {
      label: "Net profit",
      value: formatAmount(net, currency),
      description: `${formatAmount(ledger?.netThisMonth, currency)} this month`,
      icon: Scale,
      color: net >= 0 ? ("success" as const) : ("error" as const),
    },
    {
      label: "Income",
      value: formatAmount(ledger?.income, currency),
      description: `${formatAmount(ledger?.incomeThisMonth, currency)} this month`,
      icon: TrendingUp,
      color: "success" as const,
      changePercent: ledger?.incomeChangePercent,
    },
    {
      label: "Expense",
      value: formatAmount(ledger?.expense, currency),
      description: `${formatAmount(ledger?.expenseThisMonth, currency)} this month`,
      icon: TrendingDown,
      color: "warning" as const,
      changePercent: ledger?.expenseChangePercent,
    },
    {
      label: "Margin",
      value: `${ledger?.margin ?? 0}%`,
      description: "Net as a share of income",
      icon: Percent,
      color: "info" as const,
    },
  ];

  const billingCards = [
    {
      label: "Receivable",
      value: formatAmount(receivables?.receivable, currency),
      description: `${formatAmount(receivables?.overdueReceivable, currency)} of it overdue`,
      icon: ArrowUpRight,
      color: "info" as const,
    },
    {
      label: "Payable",
      value: formatAmount(receivables?.payable, currency),
      description: `${formatAmount(receivables?.overduePayable, currency)} of it overdue`,
      icon: ArrowDownRight,
      color: "warning" as const,
    },
    {
      label: "Due this week",
      value: formatAmount(receivables?.dueThisWeek, currency),
      description: `${formatNumber(overdueCount)} invoice(s) already past due`,
      icon: CalendarClock,
      color: overdueCount > 0 ? ("error" as const) : ("default" as const),
    },
    {
      label: "Collection rate",
      value: `${invoices?.collectionRate ?? 0}%`,
      description: `${formatNumber(invoices?.paid)} of ${formatNumber(invoices?.total)} invoices paid`,
      icon: Receipt,
      color: "success" as const,
    },
  ];

  const statusRows: BreakdownRow[] = (data?.invoiceStatusBreakdown ?? []).map((row) => ({
    key: row.status,
    label: INVOICE_STATUS_LABELS[row.status],
    count: row.count,
    color: INVOICE_STATUS_COLORS[row.status],
    valueLabel: formatAmount(row.amount, currency),
  }));

  const methodRows: BreakdownRow[] = (data?.paymentMethods ?? []).map((row) => ({
    key: row.method,
    label: PAYMENT_METHOD_LABELS[row.method],
    count: row.count,
    color: "blue" as const,
    valueLabel: formatAmount(row.amount, currency),
  }));

  return (
    <>
      <PageHeader
        title="Finance"
        description={
          data
            ? `Money in, money out and what is still owed · updated ${formatDateTime(data.generatedAt)}`
            : "Money in, money out and what is still owed."
        }
        actions={
          <Button asChild variant="outline" className="cursor-pointer">
            <Link to="/finance/invoices">
              All invoices
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {!isLoading && hasAlerts && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Needs attention
          </span>
          {overdueCount > 0 && (
            <Link
              to="/finance/invoices?overdue=true"
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="font-semibold text-foreground">{formatNumber(overdueCount)}</span>{" "}
              invoice(s) past their due date
            </Link>
          )}
          {draftCount > 0 && (
            <Link
              to="/finance/invoices?status=DRAFT"
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="font-semibold text-foreground">{formatNumber(draftCount)}</span>{" "}
              draft invoice(s) not yet issued
            </Link>
          )}
          {dueThisWeek > 0 && (
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatAmount(dueThisWeek, currency)}
              </span>{" "}
              falls due within seven days
            </span>
          )}
        </div>
      )}

      <StatGrid className="xl:grid-cols-4">
        {ledgerCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <StatGrid className="xl:grid-cols-4">
        {billingCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          icon={Wallet}
          title="Cash flow"
          description="Booked income against booked expense over the last twelve months, with the net line."
          className="xl:col-span-2"
        >
          <FinanceTrendChart
            points={data?.trend ?? []}
            currency={currency}
            isLoading={isLoading}
          />
        </SectionCard>

        <SectionCard
          icon={FileText}
          title="Invoices by status"
          description="Draft and unpaid invoices are the ones still waiting on you."
        >
          <BreakdownBars
            rows={statusRows}
            isLoading={isLoading}
            emptyMessage="No invoices raised yet."
            rowCount={4}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          icon={TrendingUp}
          title="Top income categories"
          description="Where the money came from."
        >
          <BreakdownBars
            rows={categoryRows(data?.incomeCategories ?? [], "INCOME", currency)}
            isLoading={isLoading}
            emptyMessage="No income booked yet."
          />
        </SectionCard>

        <SectionCard
          icon={TrendingDown}
          title="Top expense categories"
          description="Where the money went."
        >
          <BreakdownBars
            rows={categoryRows(data?.expenseCategories ?? [], "EXPENSE", currency)}
            isLoading={isLoading}
            emptyMessage="No expense booked yet."
          />
        </SectionCard>

        <SectionCard
          icon={CreditCard}
          title="Settled by method"
          description="How paid invoices were actually settled."
        >
          <BreakdownBars
            rows={methodRows}
            isLoading={isLoading}
            emptyMessage="Nothing settled yet."
            rowCount={4}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={AlertTriangle}
          title="Overdue invoices"
          description="Past their due date and still unpaid."
          contentClassName="p-0 md:p-0"
        >
          {isLoading ? (
            <div className="space-y-2 p-5 md:p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.overdueInvoices ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing is overdue. Nice.
            </p>
          ) : (
            <ul className="divide-y">
              {data?.overdueInvoices.map((invoice) => (
                <li
                  key={invoice._id}
                  className="flex items-center justify-between gap-4 px-5 py-3 md:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="truncate text-sm">{invoice.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invoice.party || "No party"} · due {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium tabular-nums">
                      {formatAmount(invoice.amount, invoice.currency)}
                    </p>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                      {invoice.daysOverdue} day(s) late
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={Receipt}
          title="Latest invoices"
          description="The most recently raised invoices and the entry each one bills."
          contentClassName="p-0 md:p-0"
        >
          {isLoading ? (
            <div className="space-y-2 p-5 md:p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.recentInvoices ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No invoices raised yet.
            </p>
          ) : (
            <ul className="divide-y">
              {data?.recentInvoices.map((invoice) => (
                <li
                  key={invoice._id}
                  className="flex items-center justify-between gap-4 px-5 py-3 md:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="truncate text-sm">{invoice.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invoice.categoryName || "Uncategorised"} ·{" "}
                      {invoice.linked ? "entry linked" : "no entry"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-medium tabular-nums">
                      {formatAmount(invoice.amount, invoice.currency)}
                    </span>
                    <StatusBadge
                      color={INVOICE_STATUS_COLORS[invoice.status]}
                      label={INVOICE_STATUS_LABELS[invoice.status]}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard
        icon={Layers}
        title="Latest ledger entries"
        description={`Income and expense as they were recorded. ${formatNumber(
          entries?.incomeCount
        )} income and ${formatNumber(entries?.expenseCount)} expense entries across ${formatNumber(
          entries?.categoryCount
        )} active categories.`}
        contentClassName="p-0 md:p-0"
      >
        {isLoading ? (
          <div className="space-y-2 p-5 md:p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : (data?.recentEntries ?? []).length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No income or expense recorded yet.
          </p>
        ) : (
          <ul className="divide-y">
            {data?.recentEntries.map((entry) => (
              <li
                key={`${entry.type}-${entry._id}`}
                className="flex items-center justify-between gap-4 px-5 py-3 md:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <StatusBadge
                    color={INVOICE_TYPE_COLORS[entry.type]}
                    label={INVOICE_TYPE_LABELS[entry.type]}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{entry.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.categoryName || "Uncategorised"} · {formatDate(entry.date)}
                      {entry.invoiceNumber ? ` · ${entry.invoiceNumber}` : " · not billed"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-medium tabular-nums">
                    {formatAmount(entry.amount, entry.currency)}
                  </span>
                  <StatusBadge
                    color={INVOICE_STATUS_COLORS[entry.status]}
                    label={INVOICE_STATUS_LABELS[entry.status]}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </>
  );
}
