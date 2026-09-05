import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import {
  BUNDLE_TYPE_LABELS,
  type ProductBundle,
} from "@/types/domain/productBundle";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface BundleColumnActions {
  onEdit: (bundle: ProductBundle) => void;
  onDelete: (bundle: ProductBundle) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function BundleRowActions({
  bundle,
  ...actions
}: BundleColumnActions & { bundle: ProductBundle }) {
  return (
    <RowActions
      label={`Actions for ${bundle.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(bundle),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(bundle),
        },
      ]}
    />
  );
}

export const bundleColumns = (rowActions: BundleColumnActions): ColumnDef<ProductBundle>[] => [
  {
    accessorKey: "name",
    header: "Bundle",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-2">
        {row.original.imageUrl ? (
          <img
            src={row.original.imageUrl}
            alt=""
            className="h-8 w-8 shrink-0 rounded-md border object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate font-mono text-xs uppercase text-muted-foreground">
            {row.original.code}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Kind",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {BUNDLE_TYPE_LABELS[row.original.type]}
      </Badge>
    ),
  },
  {
    accessorKey: "componentCount",
    header: "Parts",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatNumber(row.original.componentCount)}</span>
    ),
  },
  {
    accessorKey: "sellingPrice",
    header: "Bundle price",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium tabular-nums">
          {formatAmountValue(row.original.sellingPrice)}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          parts {formatAmountValue(row.original.componentsTotal)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "savings",
    header: "Saving",
    cell: ({ row }) =>
      row.original.savings > 0 ? (
        <StatusBadge
          color="green"
          label={`${formatAmountValue(row.original.savings)} · ${row.original.savingsPercent}%`}
        />
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "buildableQuantity",
    header: "Can build",
    cell: ({ row }) => (
      <StatusBadge
        color={row.original.buildableQuantity > 0 ? "green" : "red"}
        label={`${formatNumber(row.original.buildableQuantity)} now`}
      />
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
    cell: ({ row }) => <BundleRowActions bundle={row.original} {...rowActions} />,
  },
];
