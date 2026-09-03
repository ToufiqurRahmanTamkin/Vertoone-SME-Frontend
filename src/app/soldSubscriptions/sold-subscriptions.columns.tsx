import { StatusBadge } from "@/components/shared/status-badge";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@/constant";
import { formatAmountValue } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import type { SoldSubscription } from "@/types/domain/soldSubscription";
import type { ColumnDef } from "@tanstack/react-table";
import { RefreshCcw } from "lucide-react";
import {
  SoldSubscriptionRowActions,
  type SoldSubscriptionRowActionHandlers,
} from "./components/SoldSubscriptionRowActions";

export const soldSubscriptionColumns = (
  rowActions: SoldSubscriptionRowActionHandlers
): ColumnDef<SoldSubscription>[] => [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice",
    cell: ({ row }) => (
      <div className="min-w-0">
        <span className="font-mono text-xs font-medium">{row.original.invoiceNumber}</span>
        {row.original.billingOrigin === "AUTO_RENEWAL" && (
          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase text-violet-600 dark:text-violet-400">
            <RefreshCcw className="size-2.5" />
            Auto renewal
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="min-w-0">
          <p className="truncate font-medium">{record.customerName}</p>
          <p className="max-w-[14rem] truncate text-xs text-muted-foreground">
            {record.companyName ? `${record.companyName} · ` : ""}
            {record.customerEmail}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "planName",
    header: "Plan",
    cell: ({ row }) => <span className="text-sm">{row.original.planName}</span>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {formatAmountValue(row.original.amount)}
      </span>
    ),
  },
  {
    id: "term",
    header: "Term",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        <div>{formatDate(row.original.startDate)}</div>
        <div>to {formatDate(row.original.endDate)}</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={SUBSCRIPTION_STATUS_COLORS[row.original.status]}
        label={SUBSCRIPTION_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => (
      <StatusBadge
        color={PAYMENT_STATUS_COLORS[row.original.paymentStatus]}
        label={PAYMENT_STATUS_LABELS[row.original.paymentStatus]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <SoldSubscriptionRowActions record={row.original} {...rowActions} />,
  },
];
