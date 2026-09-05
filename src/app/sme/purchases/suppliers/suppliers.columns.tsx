import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { PAYMENT_TERM_LABELS, type Supplier } from "@/types/domain/supplier";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, ScrollText, ShoppingCart, Trash2 } from "lucide-react";

export interface SupplierColumnActions {
  onEdit: (supplier: Supplier) => void;
  onViewOrders: (supplier: Supplier) => void;
  onViewBills: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  canEdit: boolean;
  canDelete: boolean;
  canViewOrders: boolean;
  canViewBills: boolean;
}

export function SupplierRowActions({
  supplier,
  ...actions
}: SupplierColumnActions & { supplier: Supplier }) {
  return (
    <RowActions
      label={`Actions for ${supplier.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(supplier),
        },
        actions.canViewOrders && {
          key: "orders",
          label: "Purchase orders",
          icon: ShoppingCart,
          separated: true,
          onSelect: () => actions.onViewOrders(supplier),
        },
        actions.canViewBills && {
          key: "bills",
          label: "Bills and payables",
          icon: ScrollText,
          onSelect: () => actions.onViewBills(supplier),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canDelete,
          title: supplier.openOrderCount > 0 ? "Close their open orders first" : undefined,
          onSelect: () => actions.onDelete(supplier),
        },
      ]}
    />
  );
}

export const supplierColumns = (
  rowActions: SupplierColumnActions
): ColumnDef<Supplier>[] => [
  {
    accessorKey: "name",
    header: "Supplier",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.code}
        </p>
      </div>
    ),
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.contactPerson || "—"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.phone || row.original.email || "No contact details"}
        </p>
      </div>
    ),
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const { city, country } = row.original.address;
      const location = [city, country].filter(Boolean).join(", ");
      return <span className="text-sm">{location || "—"}</span>;
    },
  },
  {
    accessorKey: "paymentTerms",
    header: "Terms",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {PAYMENT_TERM_LABELS[row.original.paymentTerms]}
      </Badge>
    ),
  },
  {
    id: "openOrders",
    header: "Open orders",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.openOrderCount > 0 ? formatNumber(row.original.openOrderCount) : "—"}
      </span>
    ),
  },
  {
    id: "payable",
    header: "Owed to them",
    cell: ({ row }) => (
      <div className="text-sm tabular-nums">
        <p>
          {row.original.payableOutstanding > 0
            ? formatAmountValue(row.original.payableOutstanding)
            : "—"}
        </p>
        {row.original.overdueValue > 0 && (
          <p className="text-xs text-destructive">
            {formatAmountValue(row.original.overdueValue)} overdue
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={row.original.isActive ? "green" : "zinc"}
        label={row.original.isActive ? "Active" : "Inactive"}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <SupplierRowActions supplier={row.original} {...rowActions} />,
  },
];
