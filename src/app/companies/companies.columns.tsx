import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, CheckCircle2, MoreHorizontal, PlayCircle, Trash2, XCircle } from "lucide-react";

export type CompanyAction = "APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE" | "DELETE";

export interface CompanyColumnActions {
  onAction: (company: Company, action: CompanyAction) => void;
}

export const companyColumns = ({
  onAction,
}: CompanyColumnActions): ColumnDef<Company>[] => [
  {
    accessorKey: "name",
    header: "Company",
    cell: ({ row }) => {
      const company = row.original;
      return (
        <div className="min-w-0">
          <p className="truncate font-medium">{company.name}</p>
          <p className="max-w-xs truncate text-xs text-muted-foreground">
            {company.email} · {company.phone}
          </p>
        </div>
      );
    },
  },
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{row.original.ownerName}</p>
        <p className="max-w-xs truncate text-xs text-muted-foreground">
          {row.original.ownerEmail}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "employeeRange",
    header: "Employees",
    cell: ({ row }) => (
      <span className="text-sm">
        {EMPLOYEE_RANGE_LABELS[row.original.employeeRange] ?? row.original.employeeRange}
      </span>
    ),
  },
  {
    id: "plan",
    header: "Plan",
    cell: ({ row }) => {
      const subscription = companySubscription(row.original);
      return (
        <div className="min-w-0">
          <p className="truncate text-sm">{companyPlanName(row.original)}</p>
          {subscription && (
            <p className="truncate text-xs tabular-nums text-muted-foreground">
              {formatAmount(subscription.amount, subscription.currency)} ·{" "}
              <span className="font-mono">{subscription.invoiceNumber}</span>
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: "payment",
    header: "Payment",
    cell: ({ row }) => {
      const subscription = companySubscription(row.original);
      if (!subscription) return <span className="text-sm text-muted-foreground">—</span>;
      const status = subscription.paymentStatus as PaymentStatus;
      return (
        <StatusBadge
          color={PAYMENT_STATUS_COLORS[status] ?? "muted"}
          label={PAYMENT_STATUS_LABELS[status] ?? subscription.paymentStatus}
        />
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={COMPANY_STATUS_COLORS[row.original.status] ?? "muted"}
        label={COMPANY_STATUS_LABELS[row.original.status] ?? row.original.status}
      />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Registered",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const company = row.original;
      const isPending = company.status === "PENDING";
      const isApproved = company.status === "APPROVED";
      const isSuspended = company.status === "SUSPENDED";

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                aria-label={`Actions for ${company.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isPending && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onAction(company, "APPROVE")}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => onAction(company, "REJECT")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
              {isApproved && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onAction(company, "SUSPEND")}
                >
                  <Ban className="mr-2 h-4 w-4 text-orange-500" />
                  Suspend
                </DropdownMenuItem>
              )}
              {isSuspended && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onAction(company, "REACTIVATE")}
                >
                  <PlayCircle className="mr-2 h-4 w-4 text-emerald-600" />
                  Reactivate
                </DropdownMenuItem>
              )}
              {!isApproved && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => onAction(company, "DELETE")}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
