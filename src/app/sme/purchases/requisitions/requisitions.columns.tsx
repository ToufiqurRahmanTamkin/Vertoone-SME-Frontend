import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  PURCHASE_REQUISITION_PRIORITY_COLORS,
  PURCHASE_REQUISITION_PRIORITY_LABELS,
  PURCHASE_REQUISITION_STATUS_COLORS,
  PURCHASE_REQUISITION_STATUS_LABELS,
  type PurchaseRequisition,
} from "@/types/domain/purchaseRequisition";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, CheckCheck, Pencil, Send, ShoppingCart, Trash2, XCircle } from "lucide-react";

export interface RequisitionColumnActions {
  onEdit: (requisition: PurchaseRequisition) => void;
  onSubmit: (requisition: PurchaseRequisition) => void;
  onApprove: (requisition: PurchaseRequisition) => void;
  onReject: (requisition: PurchaseRequisition) => void;
  onConvert: (requisition: PurchaseRequisition) => void;
  onCancel: (requisition: PurchaseRequisition) => void;
  onDelete: (requisition: PurchaseRequisition) => void;
  canEdit: boolean;
  canDelete: boolean;
  canRaiseOrder: boolean;
}

export function RequisitionRowActions({
  requisition,
  ...actions
}: RequisitionColumnActions & { requisition: PurchaseRequisition }) {
  const isDraft = requisition.status === "DRAFT";
  const isSubmitted = requisition.status === "SUBMITTED";
  const isApproved = requisition.status === "APPROVED";
  const isClosed =
    requisition.status === "CANCELLED" ||
    requisition.status === "REJECTED" ||
    requisition.status === "ORDERED";

  return (
    <RowActions
      label={`Actions for ${requisition.requisitionNumber}`}
      actions={[
        !isClosed && {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(requisition),
        },
        isDraft && {
          key: "submit",
          label: "Send for approval",
          icon: Send,
          disabled: !actions.canEdit,
          onSelect: () => actions.onSubmit(requisition),
        },
        isSubmitted && {
          key: "approve",
          label: "Approve",
          icon: CheckCheck,
          disabled: !actions.canEdit,
          onSelect: () => actions.onApprove(requisition),
        },
        isSubmitted && {
          key: "reject",
          label: "Turn down",
          icon: XCircle,
          disabled: !actions.canEdit,
          onSelect: () => actions.onReject(requisition),
        },
        isApproved && {
          key: "convert",
          label: "Raise purchase order",
          icon: ShoppingCart,
          disabled: !actions.canRaiseOrder,
          title: actions.canRaiseOrder
            ? undefined
            : "You need permission to create purchase orders",
          onSelect: () => actions.onConvert(requisition),
        },
        requisition.status !== "CANCELLED" && {
          key: "cancel",
          label: "Cancel",
          icon: Ban,
          separated: true,
          disabled: !actions.canEdit || requisition.purchaseOrderIds.length > 0,
          onSelect: () => actions.onCancel(requisition),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canDelete || requisition.purchaseOrderIds.length > 0,
          onSelect: () => actions.onDelete(requisition),
        },
      ]}
    />
  );
}

export const requisitionColumns = (
  rowActions: RequisitionColumnActions
): ColumnDef<PurchaseRequisition>[] => [
  {
    accessorKey: "requisitionNumber",
    header: "Requisition",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">
          {row.original.requisitionNumber}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.requisitionDate)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "What is needed",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.department?.name ?? "No department"} ·{" "}
          {row.original.warehouse?.name ?? "—"}
        </p>
      </div>
    ),
  },
  {
    id: "requiredBy",
    header: "Needed by",
    cell: ({ row }) =>
      row.original.requiredBy ? (
        <div className="min-w-0 text-sm">
          <p className="truncate">{formatDate(row.original.requiredBy)}</p>
          {row.original.isOverdue && <p className="text-xs text-destructive">Past due</p>}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">No date</span>
      ),
  },
  {
    id: "lines",
    header: "Lines",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatNumber(row.original.items.length)}
        <span className="ml-1 text-xs text-muted-foreground">
          ({formatNumber(row.original.pendingQuantity)} left to order)
        </span>
      </span>
    ),
  },
  {
    accessorKey: "estimatedTotal",
    header: "Estimated",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatAmountValue(row.original.estimatedTotal)}
      </span>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <StatusBadge
        color={PURCHASE_REQUISITION_PRIORITY_COLORS[row.original.priority] as StatusColor}
        label={PURCHASE_REQUISITION_PRIORITY_LABELS[row.original.priority]}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={PURCHASE_REQUISITION_STATUS_COLORS[row.original.status] as StatusColor}
        label={PURCHASE_REQUISITION_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RequisitionRowActions requisition={row.original} {...rowActions} />,
  },
];
