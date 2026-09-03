import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { useGetReportSummaryQuery } from "@/redux/apis/reportApis";
import type { ReportKey, ReportSummaryCard } from "@/types/domain/report";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ReportLayout } from "./components/ReportLayout";
import { describePeriod } from "./report-period";
import { useReportRange } from "./use-report-range";

const REPORT_ROUTES: Record<ReportKey, string> = {
  revenue: "/platform/reports/revenue",
  subscriptions: "/platform/reports/subscriptions",
  plans: "/platform/reports/plan-performance",
  finance: "/platform/reports/income-and-expense",
  customers: "/platform/reports/customers",
  security: "/platform/reports/sign-in-activity",
};

const REPORT_ICONS: Record<ReportKey, LucideIcon> = {
  revenue: Wallet,
  subscriptions: Receipt,
  plans: CreditCard,
  finance: BarChart3,
  customers: Users,
  security: ShieldCheck,
};

const formatCardValue = (card: ReportSummaryCard): string => {
  if (card.format === "currency") return formatAmountValue(card.value);
  if (card.format === "percent") return `${card.value}%`;
  return formatNumber(card.value);
};

export default function ReportsPage() {
  const { range, setFilter, clearFilters } = useReportRange();
  const { data, isLoading, isFetching } = useGetReportSummaryQuery(range);

  const currency = data?.currency ?? "BDT";
  const cards = data?.cards ?? [];
  const reports = data?.reports ?? [];

  return (
    <ReportLayout
      title="Reports"
      description="Every report in the console — revenue, subscriptions, finance, customers and sign-in activity."
      range={range}
      onFilterChange={setFilter}
      onReset={clearFilters}
      isFetching={isFetching}
      showGroupBy={false}
      currency={currency}
      periodLabel={describePeriod(data?.period.from, data?.period.to)}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(isLoading ? Array.from({ length: 6 }) : cards).map((entry, index) => {
          const card = entry as ReportSummaryCard | undefined;
          return (
            <div key={card?.key ?? index} className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">
                {card?.label ?? <Skeleton className="h-4 w-24" />}
              </p>
              {card ? (
                <p className="mt-1 truncate text-2xl font-bold tabular-nums">
                  {formatCardValue(card)}
                </p>
              ) : (
                <Skeleton className="mt-2 h-8 w-32" />
              )}
              {card && (
                <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => {
          const Icon = REPORT_ICONS[report.key] ?? BarChart3;
          return (
            <Link key={report.key} to={REPORT_ROUTES[report.key] ?? "/platform/reports/overview"} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon className="size-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base leading-tight">{report.title}</CardTitle>
                      <CardDescription className="mt-1 leading-relaxed">
                        {report.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Open report
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {isLoading &&
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
      </div>
    </ReportLayout>
  );
}
