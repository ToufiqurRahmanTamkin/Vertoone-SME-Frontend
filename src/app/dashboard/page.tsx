import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@/constant";
import { formatAmount, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetDashboardOverviewQuery } from "@/redux/apis/dashboardApis";
import { selectCurrentUser } from "@/redux/authSlice";
import type { PaymentStatus, SubscriptionStatus } from "@/types/domain/soldSubscription";
import { AlertTriangle, BookOpen, Layers, Receipt, Wallet } from "lucide-react";
import { useSelector } from "react-redux";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const CHART_CONFIG = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

/** "2026-08" → "Aug 26", the axis label for a trailing-12-month series. */
const monthLabel = (month: string): string => {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return `${date.toLocaleString(undefined, { month: "short" })} ${String(year).slice(2)}`;
};

export default function DashboardPage() {
  const user = useSelector(selectCurrentUser);
  const { data, isLoading } = useGetDashboardOverviewQuery();

  const stats = data?.stats;
  const currency = stats?.revenue.currency ?? "BDT";

  const cards = [
    {
      label: "Revenue",
      value: formatAmount(stats?.revenue.total, currency),
      description: `${formatAmount(stats?.revenue.thisMonth, currency)} this month`,
      icon: Wallet,
      color: "success" as const,
    },
    {
      label: "Subscriptions",
      value: formatNumber(stats?.subscriptions.total),
      description: `${formatNumber(stats?.subscriptions.active)} active · ${formatNumber(
        stats?.subscriptions.pending
      )} pending`,
      icon: Receipt,
      color: "info" as const,
    },
    {
      label: "Plans",
      value: formatNumber(stats?.plans.total),
      description: `${formatNumber(stats?.plans.active)} active`,
      icon: Layers,
      color: "default" as const,
    },
    {
      label: "Guides",
      value: formatNumber(stats?.guides.total),
      description: `${formatNumber(stats?.guides.published)} published`,
      icon: BookOpen,
      color: "default" as const,
    },
  ];

  const revenueTrend = (data?.revenueTrend ?? []).map((point) => ({
    ...point,
    label: monthLabel(point.month),
  }));

  const outstanding = stats?.revenue.outstanding ?? 0;
  const expiringSoon = stats?.subscriptions.expiringSoon ?? 0;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name ?? "Super Admin"}`}
        description="Revenue, subscriptions and content across the platform."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, description, icon: Icon, color }) => (
          <Stat key={label}>
            <StatLabel>{label}</StatLabel>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <StatValue className="truncate">{value}</StatValue>
            )}
            <StatIndicator variant="icon" color={color}>
              <Icon />
            </StatIndicator>
            {!isLoading && <StatDescription>{description}</StatDescription>}
          </Stat>
        ))}
      </div>

      {/* Only surfaced when there is actually something to act on. */}
      {!isLoading && (outstanding > 0 || expiringSoon > 0) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Needs attention
          </span>
          {outstanding > 0 && (
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatAmount(outstanding, currency)}
              </span>{" "}
              outstanding
            </span>
          )}
          {expiringSoon > 0 && (
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{formatNumber(expiringSoon)}</span>{" "}
              expiring within 30 days
            </span>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue</CardTitle>
            <CardDescription>Paid revenue over the last 12 months.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
                <BarChart data={revenueTrend} margin={{ left: 4, right: 4, top: 4 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(value: number) => formatNumber(value)}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatAmount(Number(value), currency)}
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[4, 4, 0, 0]}
                    // The entry animation is driven by requestAnimationFrame,
                    // which never fires in a hidden/background tab — the bars
                    // would then stay unrendered until the tab is focused.
                    isAnimationActive={false}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top plans</CardTitle>
            <CardDescription>By number of subscriptions sold.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)
            ) : data?.planBreakdown.length ? (
              data.planBreakdown.map((entry) => (
                <div key={entry.planId} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{entry.planName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(entry.sales)} sold
                    </p>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatAmount(entry.revenue, currency)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No sales yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent sales</CardTitle>
          <CardDescription>The eight most recently recorded subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data?.recentSales.length ? (
            <div className="divide-y">
              {data.recentSales.map((sale) => (
                <div
                  key={sale._id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{sale.customerName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      <span className="font-mono">{sale.invoiceNumber}</span> · {sale.planName} ·{" "}
                      {formatDate(sale.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge
                      color={SUBSCRIPTION_STATUS_COLORS[sale.status as SubscriptionStatus] ?? "muted"}
                      label={
                        SUBSCRIPTION_STATUS_LABELS[sale.status as SubscriptionStatus] ?? sale.status
                      }
                    />
                    <StatusBadge
                      color={
                        PAYMENT_STATUS_COLORS[sale.paymentStatus as PaymentStatus] ?? "muted"
                      }
                      label={
                        PAYMENT_STATUS_LABELS[sale.paymentStatus as PaymentStatus] ??
                        sale.paymentStatus
                      }
                    />
                    <span className="w-24 text-right font-medium tabular-nums">
                      {formatAmount(sale.amount, sale.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No sales recorded yet.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
