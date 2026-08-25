import {
  AlertCircle,
  BookOpen,
  CalendarClock,
  CircleDollarSign,
  Package,
  Receipt,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatDate, formatMonthKey, formatNumber } from "@/lib/format";
import { useGetDashboardOverviewQuery } from "@/redux/apis/dashboardApi";

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useGetDashboardOverviewQuery();

  const stats = data?.stats;
  const currency = stats?.revenue.currency ?? "BDT";

  if (isError) {
    return (
      <>
        <PageHeader title="Dashboard" description="Platform overview at a glance." />
        <EmptyState
          icon={AlertCircle}
          title="Could not load the dashboard"
          description={getApiErrorMessage(error, "The server did not respond.")}
        />
      </>
    );
  }

  const revenueTrend = (data?.revenueTrend ?? []).map((point) => ({
    ...point,
    label: formatMonthKey(point.month),
  }));

  return (
    <>
      <PageHeader title="Dashboard" description="Platform overview at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatCurrency(stats?.revenue.total ?? 0, currency)}
          hint={`${formatCurrency(stats?.revenue.thisMonth ?? 0, currency)} this month`}
          icon={CircleDollarSign}
          isLoading={isLoading}
        />
        <StatCard
          label="Active subscriptions"
          value={formatNumber(stats?.subscriptions.active ?? 0)}
          hint={`${formatNumber(stats?.subscriptions.total ?? 0)} sold in total`}
          icon={Receipt}
          isLoading={isLoading}
        />
        <StatCard
          label="Active plans"
          value={formatNumber(stats?.plans.active ?? 0)}
          hint={`${formatNumber(stats?.plans.total ?? 0)} plans in the catalogue`}
          icon={Package}
          isLoading={isLoading}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(stats?.revenue.outstanding ?? 0, currency)}
          hint={`${formatNumber(stats?.subscriptions.pending ?? 0)} awaiting payment`}
          icon={AlertCircle}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Expiring in 30 days"
          value={formatNumber(stats?.subscriptions.expiringSoon ?? 0)}
          icon={CalendarClock}
          isLoading={isLoading}
        />
        <StatCard
          label="Expired"
          value={formatNumber(stats?.subscriptions.expired ?? 0)}
          icon={AlertCircle}
          isLoading={isLoading}
        />
        <StatCard
          label="Cancelled"
          value={formatNumber(stats?.subscriptions.cancelled ?? 0)}
          icon={Receipt}
          isLoading={isLoading}
        />
        <StatCard
          label="Published guides"
          value={formatNumber(stats?.guides.published ?? 0)}
          hint={`${formatNumber(stats?.guides.total ?? 0)} written`}
          icon={BookOpen}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Paid revenue over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {isLoading ? (
              <Skeleton className="size-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                    stroke="currentColor"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                    stroke="currentColor"
                    width={64}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--border)" }}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      color: "var(--popover-foreground)",
                      fontSize: "0.8125rem",
                    }}
                    formatter={(value: number) => [formatCurrency(value, currency), "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales by plan</CardTitle>
            <CardDescription>Top plans by number of sales</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {isLoading ? (
              <Skeleton className="size-full" />
            ) : data?.planBreakdown.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.planBreakdown}
                  layout="vertical"
                  margin={{ top: 4, right: 12, bottom: 0, left: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    horizontal={false}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="planName"
                    width={96}
                    tickLine={false}
                    axisLine={false}
                    className="text-xs"
                    stroke="currentColor"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      color: "var(--popover-foreground)",
                      fontSize: "0.8125rem",
                    }}
                    formatter={(value: number) => [formatNumber(value), "Sales"]}
                  />
                  <Bar dataKey="sales" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No sales yet"
                description="Plan performance appears here once subscriptions are sold."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent sales</CardTitle>
          <CardDescription>The eight most recent subscription sales</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-full" />
              ))}
            </div>
          ) : data?.recentSales.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentSales.map((sale) => (
                    <TableRow key={sale._id}>
                      <TableCell className="font-mono text-xs">{sale.invoiceNumber}</TableCell>
                      <TableCell className="font-medium">{sale.customerName}</TableCell>
                      <TableCell>{sale.planName}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(sale.amount, sale.currency)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={sale.status} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={sale.paymentStatus} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(sale.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No sales recorded"
              description="Record your first sale from the Sold Subscriptions page."
              action={
                <Link
                  to="/sold-subscriptions"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Go to Sold Subscriptions
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
