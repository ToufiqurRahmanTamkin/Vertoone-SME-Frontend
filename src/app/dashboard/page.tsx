import { BreakdownBars, type BreakdownRow } from "@/app/dashboard/components/BreakdownBars";
import { FinanceTrendChart } from "@/app/dashboard/components/FinanceTrendChart";
import { GrowthTrendChart } from "@/app/dashboard/components/GrowthTrendChart";
import { KpiCard } from "@/app/dashboard/components/KpiCard";
import { RevenueTrendChart } from "@/app/dashboard/components/RevenueTrendChart";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatGrid } from "@/components/ui/stat";
import {
  BILLING_ORIGIN_COLORS,
  BILLING_ORIGIN_LABELS,
  EMPLOYEE_RANGE_LABELS,
  LOGIN_FAILURE_REASON_LABELS,
  LOGIN_STATUS_COLORS,
  LOGIN_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@/constant";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate, formatDateTime } from "@/lib/date";
import { useGetDashboardOverviewQuery } from "@/redux/apis/dashboardApis";
import { selectCurrentUser } from "@/redux/authSlice";
import type { EmployeeRange } from "@/types/domain/company";
import type { LoginFailureReason, LoginStatus } from "@/types/domain/loginHistory";
import type {
  BillingOrigin,
  PaymentMethod,
  PaymentStatus,
  SubscriptionStatus,
} from "@/types/domain/soldSubscription";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarClock,
  CreditCard,
  Layers,
  Mail,
  Receipt,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const user = useSelector(selectCurrentUser);
  const { data, isLoading } = useGetDashboardOverviewQuery();

  const kpis = data?.kpis;
  const currency = data?.currency ?? "BDT";

  const primaryCards = [
    {
      label: "Revenue",
      value: formatAmountValue(kpis?.revenue.total),
      description: `${formatAmountValue(kpis?.revenue.thisMonth)} this month`,
      icon: Wallet,
      color: "success" as const,
      changePercent: kpis?.revenue.changePercent,
    },
    {
      label: "Companies",
      value: formatNumber(kpis?.companies.total),
      description: `${formatNumber(kpis?.companies.approved)} approved · ${formatNumber(
        kpis?.companies.pending
      )} pending`,
      icon: Building2,
      color: "info" as const,
    },
    {
      label: "Subscriptions",
      value: formatNumber(kpis?.subscriptions.total),
      description: `${formatNumber(kpis?.subscriptions.active)} active · ${formatNumber(
        kpis?.subscriptions.pending
      )} pending`,
      icon: Receipt,
      color: "default" as const,
      changePercent: kpis?.subscriptions.changePercent,
    },
    {
      label: "Net profit",
      value: formatAmountValue(kpis?.finance.net),
      description: `${formatAmountValue(kpis?.finance.income)} in · ${formatAmountValue(
        kpis?.finance.expense
      )} out`,
      icon: Trophy,
      color: (kpis?.finance.net ?? 0) >= 0 ? ("success" as const) : ("error" as const),
    },
  ];

  const secondaryCards = [
    {
      label: "Outstanding",
      value: formatAmountValue(kpis?.revenue.outstanding),
      description: `${formatNumber(kpis?.subscriptions.awaitingApproval)} invoice(s) awaiting approval`,
      icon: CreditCard,
      color: "warning" as const,
    },
    {
      label: "Average sale",
      value: formatAmountValue(kpis?.revenue.averageSaleValue),
      description: `${formatAmountValue(kpis?.revenue.refunded)} refunded to date`,
      icon: ArrowUpRight,
      color: "default" as const,
    },
    {
      label: "Plans",
      value: formatNumber(kpis?.plans.total),
      description: `${formatNumber(kpis?.plans.active)} active · ${formatNumber(
        kpis?.plans.inactive
      )} retired`,
      icon: Layers,
      color: "default" as const,
    },
    {
      label: "Renewals due",
      value: formatNumber(kpis?.subscriptions.expiringSoon),
      description: `${formatNumber(kpis?.subscriptions.autoRenewEnabled)} on auto renew`,
      icon: CalendarClock,
      color: "info" as const,
    },
    {
      label: "Emails",
      value: formatNumber(kpis?.emails.sent),
      description: `${formatNumber(kpis?.emails.failed)} failed · ${formatNumber(
        kpis?.emails.skipped
      )} skipped`,
      icon: Mail,
      color: (kpis?.emails.failed ?? 0) > 0 ? ("error" as const) : ("default" as const),
    },
    {
      label: "Guides",
      value: formatNumber(kpis?.guides.total),
      description: `${formatNumber(kpis?.guides.published)} published · ${formatNumber(
        kpis?.guides.totalViews
      )} views`,
      icon: BookOpen,
      color: "default" as const,
    },
    {
      label: "Sign-ins",
      value: formatNumber(kpis?.security.logins),
      description: `${formatNumber(kpis?.security.failedLogins)} failed in ${formatNumber(
        kpis?.security.windowDays
      )} days`,
      icon: ShieldCheck,
      color: (kpis?.security.failedLogins ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Devices",
      value: formatNumber(kpis?.security.distinctDevices),
      description: "Distinct devices used recently",
      icon: Users,
      color: "default" as const,
    },
  ];

  const subscriptionRows: BreakdownRow[] = (data?.subscriptionStatusBreakdown ?? []).map(
    (entry) => ({
      key: entry.key,
      label: SUBSCRIPTION_STATUS_LABELS[entry.key as SubscriptionStatus] ?? entry.key,
      count: entry.count,
      color: SUBSCRIPTION_STATUS_COLORS[entry.key as SubscriptionStatus] ?? "muted",
    })
  );

  const paymentStatusRows: BreakdownRow[] = (data?.paymentStatusBreakdown ?? []).map((entry) => ({
    key: entry.key,
    label: PAYMENT_STATUS_LABELS[entry.key as PaymentStatus] ?? entry.key,
    count: entry.count,
    color: PAYMENT_STATUS_COLORS[entry.key as PaymentStatus] ?? "muted",
    valueLabel: `${entry.count.toLocaleString()} · ${formatAmountValue(entry.amount)}`,
  }));

  const paymentMethodRows: BreakdownRow[] = (data?.paymentMethodBreakdown ?? []).map((entry) => ({
    key: entry.key,
    label: PAYMENT_METHOD_LABELS[entry.key as PaymentMethod] ?? entry.key,
    count: entry.count,
    color: "blue" as const,
    valueLabel: `${entry.count.toLocaleString()} · ${formatAmountValue(entry.amount)}`,
  }));

  const employeeRangeRows: BreakdownRow[] = (data?.employeeRangeBreakdown ?? []).map((entry) => ({
    key: entry.key,
    label: EMPLOYEE_RANGE_LABELS[entry.key as EmployeeRange] ?? entry.key,
    count: entry.count,
    color: "violet" as const,
  }));

  const outstanding = kpis?.revenue.outstanding ?? 0;
  const pendingCompanies = kpis?.companies.pending ?? 0;
  const awaitingApproval = kpis?.subscriptions.awaitingApproval ?? 0;
  const expiringSoon = kpis?.subscriptions.expiringSoon ?? 0;
  const hasAlerts =
    outstanding > 0 || pendingCompanies > 0 || awaitingApproval > 0 || expiringSoon > 0;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name ?? "Super Admin"}`}
        description={
          data
            ? `Platform overview · updated ${formatDateTime(data.generatedAt)}`
            : "Revenue, companies, subscriptions and content across the platform."
        }
        actions={<CurrencyNote currency={currency} />}
      />

      {!isLoading && hasAlerts && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Needs attention
          </span>
          {pendingCompanies > 0 && (
            <Link to="/platform/companies" className="text-muted-foreground hover:text-foreground">
              <span className="font-semibold text-foreground">
                {formatNumber(pendingCompanies)}
              </span>{" "}
              company registration(s) awaiting approval
            </Link>
          )}
          {awaitingApproval > 0 && (
            <Link to="/platform/sold-subscriptions" className="text-muted-foreground hover:text-foreground">
              <span className="font-semibold text-foreground">
                {formatNumber(awaitingApproval)}
              </span>{" "}
              payment(s) awaiting review
            </Link>
          )}
          {outstanding > 0 && (
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatAmountValue(outstanding)}
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

      <StatGrid className="xl:grid-cols-4">
        {primaryCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <StatGrid className="lg:grid-cols-4">
        {secondaryCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          icon={Wallet}
          title="Revenue"
          description="Paid revenue over the last 12 months."
          className="xl:col-span-2"
        >
          <RevenueTrendChart
            points={data?.revenueTrend ?? []}
            currency={currency}
            isLoading={isLoading}
          />
        </SectionCard>

        <SectionCard
          icon={Receipt}
          title="Subscription status"
          description="Where every sold subscription currently sits."
        >
          <BreakdownBars rows={subscriptionRows} isLoading={isLoading} />
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          icon={Layers}
          title="Income vs expense"
          description="Recorded finance entries over the last 12 months."
          className="xl:col-span-2"
        >
          <FinanceTrendChart
            points={data?.financeTrend ?? []}
            currency={currency}
            isLoading={isLoading}
          />
        </SectionCard>

        <SectionCard
          icon={CreditCard}
          title="Payment mix"
          description="How approved payments were made."
        >
          <BreakdownBars
            rows={paymentMethodRows}
            isLoading={isLoading}
            emptyMessage="No approved payments yet."
            rowCount={4}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          icon={Building2}
          title="Growth"
          description="New subscriptions and company registrations per month."
          className="xl:col-span-2"
        >
          <GrowthTrendChart points={data?.revenueTrend ?? []} isLoading={isLoading} />
        </SectionCard>

        <SectionCard
          icon={CreditCard}
          title="Invoice payment status"
          description="Every invoice by payment state and value."
        >
          <BreakdownBars rows={paymentStatusRows} isLoading={isLoading} rowCount={4} />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={Layers}
          title="Plan performance"
          description="Sales, active subscriptions and revenue per plan."
        >
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : data?.planBreakdown.length ? (
            <div className="divide-y">
              {data.planBreakdown.map((entry) => (
                <div
                  key={entry.planId}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{entry.planName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(entry.sales)} sold · {formatNumber(entry.activeCount)} active
                    </p>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatAmountValue(entry.revenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No sales yet.</p>
          )}
        </SectionCard>

        <SectionCard
          icon={Users}
          title="Company size mix"
          description="Registered companies by employee range."
        >
          <BreakdownBars
            rows={employeeRangeRows}
            isLoading={isLoading}
            emptyMessage="No companies registered yet."
            rowCount={5}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={Building2}
          title="Pending registrations"
          description="Companies waiting for approval before their owner can sign in."
          action={
            <Button asChild size="sm" variant="outline" className="cursor-pointer">
              <Link to="/platform/companies">Review</Link>
            </Button>
          }
        >
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.pendingCompanies.length ? (
            <div className="divide-y">
              {data.pendingCompanies.map((company) => (
                <div
                  key={company._id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{company.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {company.ownerName} · {company.ownerEmail}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {company.planName || "No plan"}
                    </span>
                    <span>{formatDate(company.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nothing waiting for approval.
            </p>
          )}
        </SectionCard>

        <SectionCard
          icon={CalendarClock}
          title="Upcoming renewals"
          description="Active subscriptions ending within 30 days."
        >
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.upcomingRenewals.length ? (
            <div className="divide-y">
              {data.upcomingRenewals.map((renewal) => (
                <div
                  key={renewal._id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {renewal.companyName || renewal.customerName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      <span className="font-mono">{renewal.invoiceNumber}</span> ·{" "}
                      {renewal.planName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge
                      color={renewal.daysRemaining <= 7 ? "red" : "amber"}
                      label={`${renewal.daysRemaining}d left`}
                    />
                    <span className="w-24 text-right font-medium tabular-nums">
                      {formatAmountValue(renewal.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No renewals in the next 30 days.
            </p>
          )}
        </SectionCard>
      </div>

      <SectionCard
        icon={Receipt}
        title="Recent sales"
        description="The eight most recently recorded subscriptions."
        action={
          <Button asChild size="sm" variant="outline" className="cursor-pointer">
            <Link to="/platform/sold-subscriptions">Open</Link>
          </Button>
        }
      >
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
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
                  <p className="truncate font-medium">{sale.companyName || sale.customerName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-mono">{sale.invoiceNumber}</span> · {sale.planName} ·{" "}
                    {formatDate(sale.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <StatusBadge
                    color={BILLING_ORIGIN_COLORS[sale.billingOrigin as BillingOrigin] ?? "muted"}
                    label={
                      BILLING_ORIGIN_LABELS[sale.billingOrigin as BillingOrigin] ??
                      sale.billingOrigin
                    }
                  />
                  <StatusBadge
                    color={SUBSCRIPTION_STATUS_COLORS[sale.status as SubscriptionStatus] ?? "muted"}
                    label={
                      SUBSCRIPTION_STATUS_LABELS[sale.status as SubscriptionStatus] ?? sale.status
                    }
                  />
                  <StatusBadge
                    color={PAYMENT_STATUS_COLORS[sale.paymentStatus as PaymentStatus] ?? "muted"}
                    label={
                      PAYMENT_STATUS_LABELS[sale.paymentStatus as PaymentStatus] ??
                      sale.paymentStatus
                    }
                  />
                  <span className="w-24 text-right font-medium tabular-nums">
                    {formatAmountValue(sale.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">No sales recorded yet.</p>
        )}
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard icon={Trophy} title="Top customers" description="By total approved spend.">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : data?.topCustomers.length ? (
            <div className="divide-y">
              {data.topCustomers.map((customer, index) => (
                <div
                  key={customer.customerEmail}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {customer.companyName || customer.customerName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {customer.customerEmail} · {formatNumber(customer.purchases)} purchase(s)
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatAmountValue(customer.totalSpend)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No approved payments yet.
            </p>
          )}
        </SectionCard>

        <SectionCard
          icon={ShieldCheck}
          title="Sign-in activity"
          description="The most recent authentication attempts."
          action={
            <Button asChild size="sm" variant="outline" className="cursor-pointer">
              <Link to="/platform/reports/sign-in-activity">Details</Link>
            </Button>
          }
        >
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : data?.recentLogins.length ? (
            <div className="divide-y">
              {data.recentLogins.map((login) => (
                <div
                  key={login._id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{login.email}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {login.browser} on {login.os} · {login.ipAddress || "unknown IP"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge
                      color={LOGIN_STATUS_COLORS[login.status as LoginStatus] ?? "muted"}
                      label={
                        login.failureReason
                          ? (LOGIN_FAILURE_REASON_LABELS[
                              login.failureReason as LoginFailureReason
                            ] ?? login.failureReason)
                          : (LOGIN_STATUS_LABELS[login.status as LoginStatus] ?? login.status)
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(login.loginAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No sign-in activity recorded yet.
            </p>
          )}
        </SectionCard>
      </div>
    </>
  );
}
