import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_TERM_LABELS, type Supplier } from "@/types/domain/supplier";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface SupplierColumnActions {
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  canEdit: boolean;
  canDelete: boolean;
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
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
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
    accessorKey: "openingBalance",
    header: "Opening balance",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.openingBalance ? row.original.openingBalance.toLocaleString() : "—"}
      </span>
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
