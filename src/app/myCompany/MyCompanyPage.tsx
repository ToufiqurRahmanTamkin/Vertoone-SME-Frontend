import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Stat,
  StatDescription,
  StatGrid,
  StatIndicator,
  StatLabel,
  StatValue,
} from "@/components/ui/stat";
import {
  COMPANY_STATUS_COLORS,
  COMPANY_STATUS_LABELS,
  EMPLOYEE_RANGE_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetMyCompanyQuery } from "@/redux/apis/companyApis";
import { selectCurrentUser } from "@/redux/authSlice";
import { companyPlanName, type Company, type CompanyInvoice } from "@/types/domain/company";
import type {
  PaymentMethod,
  PaymentStatus,
  SubscriptionStatus,
} from "@/types/domain/soldSubscription";
import { AlertTriangle, Building2, Receipt, ShieldCheck, Wallet } from "lucide-react";
import { useSelector } from "react-redux";
import { AiAllowanceCard } from "./components/AiAllowanceCard";
import { MyAttendanceCard } from "./components/MyAttendanceCard";
import { PlanEntitlementCard } from "./components/PlanEntitlementCard";
import { SubscriptionManagementCard } from "./components/SubscriptionManagementCard";

const RUNNING_INVOICE_STATUSES: SubscriptionStatus[] = ["TRIALING", "ACTIVE"];

const companyPlanId = (planId: Company["planId"]): string | null => {
  if (!planId) return null;
  return typeof planId === "string" ? planId : planId._id;
};

const InvoiceRow = ({ invoice }: { invoice: CompanyInvoice }) => (
  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 text-sm">
    <div className="min-w-0 flex-1">
      <p className="truncate font-medium">{invoice.planName}</p>
      <p className="truncate text-xs text-muted-foreground">
        <span className="font-mono">{invoice.invoiceNumber}</span> · {formatDate(invoice.startDate)}{" "}
        — {formatDate(invoice.endDate)}
      </p>
    </div>
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <StatusBadge
        color={SUBSCRIPTION_STATUS_COLORS[invoice.status as SubscriptionStatus] ?? "muted"}
        label={SUBSCRIPTION_STATUS_LABELS[invoice.status as SubscriptionStatus] ?? invoice.status}
      />
      <StatusBadge
        color={PAYMENT_STATUS_COLORS[invoice.paymentStatus as PaymentStatus] ?? "muted"}
        label={
          PAYMENT_STATUS_LABELS[invoice.paymentStatus as PaymentStatus] ?? invoice.paymentStatus
        }
      />
      <span className="w-28 text-right font-medium tabular-nums">
        {formatAmount(invoice.amount, invoice.currency)}
      </span>
    </div>
  </div>
);

export default function MyCompanyPage() {
  const user = useSelector(selectCurrentUser);
  const { data, isLoading, isError } = useGetMyCompanyQuery();

  const company = data?.company;
  const currency = data?.invoices[0]?.currency ?? "BDT";
  const activeInvoice = data?.invoices.find((invoice) =>
    RUNNING_INVOICE_STATUSES.includes(invoice.status as SubscriptionStatus)
  );
  const currentSubscription = activeInvoice ?? data?.invoices[0] ?? null;
  const isOwner = user?.role === "COMPANY_OWNER";

  if (isError) {
    return (
      <>
        <PageHeader title="Dashboard" description="How your company is doing today, at a glance." />
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-muted-foreground">
            No company is linked to this account. Contact support if you believe this is a mistake.
          </p>
        </div>
      </>
    );
  }

  const cards = [
    {
      label: "Plan",
      value: company ? companyPlanName(company) : "—",
      description: activeInvoice
        ? activeInvoice.status === "TRIALING"
          ? `Trial bills on ${formatDate(activeInvoice.endDate)}`
          : `Renews ${formatDate(activeInvoice.endDate)}`
        : "No active billing period",
      icon: ShieldCheck,
      color: "info" as const,
    },
    {
      label: "Total paid",
      value: formatAmount(data?.totalPaid, currency),
      description: `${data?.invoices.length ?? 0} invoice(s) on record`,
      icon: Wallet,
      color: "success" as const,
    },
    {
      label: "Outstanding",
      value: formatAmount(data?.outstanding, currency),
      description: (data?.outstanding ?? 0) > 0 ? "Awaiting payment approval" : "Nothing due",
      icon: Receipt,
      color: (data?.outstanding ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Status",
      value: company ? (COMPANY_STATUS_LABELS[company.status] ?? company.status) : "—",
      description: company?.reviewedAt
        ? `Reviewed ${formatDate(company.reviewedAt)}`
        : "Awaiting super admin review",
      icon: Building2,
      color: "default" as const,
    },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name ?? "there"}`}
        description="Your company profile, subscription and billing history."
      />

      <MyAttendanceCard />

      <StatGrid className="xl:grid-cols-4">
        {cards.map(({ label, value, description, icon: Icon, color }) => (
          <Stat key={label}>
            <StatLabel>{label}</StatLabel>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <StatValue className="truncate text-xl">{value}</StatValue>
            )}
            <StatIndicator variant="icon" color={color}>
              <Icon />
            </StatIndicator>
            {!isLoading && <StatDescription>{description}</StatDescription>}
          </Stat>
        ))}
      </StatGrid>

      {company && company.status !== "APPROVED" && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-muted-foreground">
            {company.status === "PENDING" &&
              "Your registration is still awaiting super admin approval."}
            {company.status === "REJECTED" && "Your registration was not approved."}
            {company.status === "SUSPENDED" && "This company is currently suspended."}
            {company.reviewNote && (
              <>
                {" "}
                <span className="font-medium text-foreground">Note:</span> {company.reviewNote}
              </>
            )}
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={Building2}
          title="Company profile"
          description="The details submitted at registration."
        >
          {isLoading || !company ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <dl className="divide-y text-sm">
              {[
                { label: "Company name", value: company.name },
                { label: "Company email", value: company.email },
                { label: "Company phone", value: company.phone },
                { label: "Address", value: company.address },
                {
                  label: "Employees",
                  value: EMPLOYEE_RANGE_LABELS[company.employeeRange] ?? company.employeeRange,
                },
                { label: "Owner", value: `${company.ownerName} (${company.ownerEmail})` },
                { label: "Registered", value: formatDate(company.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 break-words text-right font-medium">{value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-muted-foreground">Approval status</dt>
                <dd>
                  <StatusBadge
                    color={COMPANY_STATUS_COLORS[company.status] ?? "muted"}
                    label={COMPANY_STATUS_LABELS[company.status] ?? company.status}
                  />
                </dd>
              </div>
            </dl>
          )}
        </SectionCard>

        <SectionCard
          icon={Receipt}
          title="Billing history"
          description="Every invoice raised for your company."
        >
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.invoices.length ? (
            <div className="divide-y">
              {data.invoices.map((invoice) => (
                <InvoiceRow key={invoice._id} invoice={invoice} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No invoices yet.</p>
          )}
        </SectionCard>
      </div>

      {isOwner && (
        <SubscriptionManagementCard
          currentPlanId={company ? companyPlanId(company.planId) : null}
          currentPlanName={company ? companyPlanName(company) : "—"}
          subscription={currentSubscription}
          isLoading={isLoading}
        />
      )}

      <AiAllowanceCard />

      <PlanEntitlementCard modulePermissions={data?.modulePermissions} isLoading={isLoading} />

      {data?.invoices[0] && (
        <SectionCard
          icon={Wallet}
          title="Latest payment"
          description="What we recorded for your most recent invoice."
        >
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {[
              { label: "Invoice", value: data.invoices[0].invoiceNumber },
              {
                label: "Method",
                value:
                  PAYMENT_METHOD_LABELS[data.invoices[0].paymentMethod as PaymentMethod] ??
                  data.invoices[0].paymentMethod,
              },
              { label: "Transaction ID", value: data.invoices[0].transactionId || "—" },
              {
                label: "Auto renew",
                value: data.invoices[0].autoRenew ? "Enabled" : "Off",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="min-w-0 truncate font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
      )}
    </>
  );
}
