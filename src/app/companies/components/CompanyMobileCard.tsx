import { CardActionButton } from "@/components/shared/action-button";
import type { CompanyAction } from "@/app/companies/companies.columns";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  COMPANY_STATUS_COLORS,
  COMPANY_STATUS_LABELS,
  EMPLOYEE_RANGE_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { companyPlanName, companySubscription, type Company } from "@/types/domain/company";
import type { PaymentStatus } from "@/types/domain/soldSubscription";
import { Ban, CheckCircle2, PlayCircle, Trash2, XCircle } from "lucide-react";

interface CompanyMobileCardProps {
  company: Company;
  onAction: (company: Company, action: CompanyAction) => void;
}

export function CompanyMobileCard({ company, onAction }: CompanyMobileCardProps) {
  const subscription = companySubscription(company);
  const paymentStatus = subscription?.paymentStatus as PaymentStatus | undefined;

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{company.name}</p>
          <p className="truncate text-xs text-muted-foreground">{company.email}</p>
        </div>
        <StatusBadge
          color={COMPANY_STATUS_COLORS[company.status] ?? "muted"}
          label={COMPANY_STATUS_LABELS[company.status] ?? company.status}
        />
      </div>

      <dl className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Owner</dt>
          <dd className="min-w-0 truncate font-medium">{company.ownerName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Phone</dt>
          <dd className="min-w-0 truncate font-medium">{company.phone}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Employees</dt>
          <dd className="min-w-0 truncate font-medium">
            {EMPLOYEE_RANGE_LABELS[company.employeeRange] ?? company.employeeRange}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="min-w-0 truncate font-medium">{companyPlanName(company)}</dd>
        </div>
        {subscription && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="min-w-0 truncate font-medium tabular-nums">
              {formatAmount(subscription.amount, subscription.currency)}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Registered</dt>
          <dd className="min-w-0 truncate font-medium">{formatDate(company.createdAt)}</dd>
        </div>
      </dl>

      {paymentStatus && (
        <div className="mt-3">
          <StatusBadge
            color={PAYMENT_STATUS_COLORS[paymentStatus] ?? "muted"}
            label={PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {company.status === "PENDING" && (
          <>
            <CardActionButton
              icon={CheckCircle2}
              label="Approve"
              onClick={() => onAction(company, "APPROVE")}
            />
            <CardActionButton
              icon={XCircle}
              label="Reject"
              variant="destructive"
              onClick={() => onAction(company, "REJECT")}
            />
          </>
        )}
        {company.status === "APPROVED" && (
          <CardActionButton
            icon={Ban}
            label="Suspend"
            onClick={() => onAction(company, "SUSPEND")}
          />
        )}
        {company.status === "SUSPENDED" && (
          <CardActionButton
            icon={PlayCircle}
            label="Reactivate"
            onClick={() => onAction(company, "REACTIVATE")}
          />
        )}
        {company.status !== "APPROVED" && (
          <CardActionButton
            icon={Trash2}
            label="Delete"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onAction(company, "DELETE")}
          />
        )}
      </div>
    </div>
  );
}
