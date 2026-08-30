import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYMENT_TERM_LABELS, type Supplier } from "@/types/domain/supplier";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

interface SupplierColumnActions {
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const supplierColumns = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: SupplierColumnActions): ColumnDef<Supplier>[] => [
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
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => onEdit(row.original)}
          disabled={!canEdit}
          aria-label={`Edit ${row.original.name}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
          onClick={() => onDelete(row.original)}
          disabled={!canDelete}
          aria-label={`Delete ${row.original.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
