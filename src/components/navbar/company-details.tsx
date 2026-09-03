import { NAV_ICON_BUTTON } from "@/components/navbar/navbar-styles";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  COMPANY_STATUS_COLORS,
  COMPANY_STATUS_LABELS,
  EMPLOYEE_RANGE_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetMyCompanyQuery } from "@/redux/apis/companyApis";
import { selectCurrentUser } from "@/redux/authSlice";
import { isPlatformRole } from "@/types/domain/auth";
import { companyPlanName } from "@/types/domain/company";
import type { PaymentStatus, SubscriptionStatus } from "@/types/domain/soldSubscription";
import { AlertTriangle, Building2 } from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-right text-sm font-medium break-words">{value || "—"}</dd>
  </div>
);

export function CompanyDetails() {
  const user = useSelector(selectCurrentUser);
  const isCompanyUser = Boolean(user) && !isPlatformRole(user?.role);

  const [open, setOpen] = React.useState(false);
  const [hasOpened, setHasOpened] = React.useState(false);

  const { data, isLoading, isError } = useGetMyCompanyQuery(undefined, {
    skip: !isCompanyUser || !hasOpened,
  });

  if (!isCompanyUser) return null;

  const company = data?.company;
  const currency = data?.invoices[0]?.currency ?? "BDT";
  const activeInvoice = data?.invoices.find((invoice) => invoice.status === "ACTIVE");

  const onOpenChange = (next: boolean) => {
    if (next) setHasOpened(true);
    setOpen(next);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={NAV_ICON_BUTTON}
            onClick={() => onOpenChange(true)}
            aria-label="Company details"
          >
            <Building2 className="size-[18px]" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Company details</TooltipContent>
      </Tooltip>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b p-4 sm:p-5">
            <SheetTitle className="pr-8 text-lg">{company?.name ?? "Your company"}</SheetTitle>
            <SheetDescription>
              The company this workspace belongs to, and what your subscription covers.
            </SheetDescription>
            {company && (
              <div className="pt-1">
                <StatusBadge
                  color={COMPANY_STATUS_COLORS[company.status] ?? "muted"}
                  label={COMPANY_STATUS_LABELS[company.status] ?? company.status}
                />
              </div>
            )}
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 8 }, (_, index) => (
                  <Skeleton key={index} className="h-8 w-full" />
                ))}
              </div>
            )}

            {isError && !isLoading && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-muted-foreground">
                  No company is linked to this account. Contact support if you believe this is a
                  mistake.
                </p>
              </div>
            )}

            {company && !isLoading && (
              <div className="space-y-5">
                <section>
                  <p className="mb-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    Contact
                  </p>
                  <dl className="divide-y">
                    <Row label="Email" value={company.email} />
                    <Row label="Phone" value={company.phone} />
                    <Row label="Address" value={company.address} />
                    <Row
                      label="Company size"
                      value={EMPLOYEE_RANGE_LABELS[company.employeeRange] ?? company.employeeRange}
                    />
                  </dl>
                </section>

                <section>
                  <p className="mb-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    Owner
                  </p>
                  <dl className="divide-y">
                    <Row label="Name" value={company.ownerName} />
                    <Row label="Email" value={company.ownerEmail} />
                    <Row label="Registered" value={formatDate(company.createdAt)} />
                  </dl>
                </section>

                <section>
                  <p className="mb-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    Subscription
                  </p>
                  <dl className="divide-y">
                    <Row label="Plan" value={companyPlanName(company)} />
                    <Row
                      label="Period"
                      value={
                        activeInvoice
                          ? `${formatDate(activeInvoice.startDate)} — ${formatDate(activeInvoice.endDate)}`
                          : "No active billing period"
                      }
                    />
                    {activeInvoice && (
                      <Row
                        label="Billing"
                        value={
                          <span className="flex flex-wrap items-center justify-end gap-1.5">
                            <StatusBadge
                              color={
                                SUBSCRIPTION_STATUS_COLORS[
                                  activeInvoice.status as SubscriptionStatus
                                ] ?? "muted"
                              }
                              label={
                                SUBSCRIPTION_STATUS_LABELS[
                                  activeInvoice.status as SubscriptionStatus
                                ] ?? activeInvoice.status
                              }
                            />
                            <StatusBadge
                              color={
                                PAYMENT_STATUS_COLORS[
                                  activeInvoice.paymentStatus as PaymentStatus
                                ] ?? "muted"
                              }
                              label={
                                PAYMENT_STATUS_LABELS[
                                  activeInvoice.paymentStatus as PaymentStatus
                                ] ?? activeInvoice.paymentStatus
                              }
                            />
                          </span>
                        }
                      />
                    )}
                    <Row label="Total paid" value={formatAmount(data?.totalPaid, currency)} />
                    <Row label="Outstanding" value={formatAmount(data?.outstanding, currency)} />
                    <Row label="Invoices" value={`${data?.invoices.length ?? 0} on record`} />
                  </dl>
                </section>

                {user?.role === "COMPANY_OWNER" && (
                  <Button asChild variant="outline" className="w-full cursor-pointer">
                    <Link to="/company/dashboard" onClick={() => setOpen(false)}>
                      Open my company
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
