import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatAmountValue } from "@/lib/amount";
import {
  PRODUCT_OPTION_DISPLAY_LABELS,
  type ProductOption,
  type ProductVariant,
} from "@/types/domain/productVariant";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface VariantColumnActions {
  onEdit: (variant: ProductVariant) => void;
  onDelete: (variant: ProductVariant) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export interface OptionColumnActions {
  onEdit: (option: ProductOption) => void;
  onDelete: (option: ProductOption) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function VariantRowActions({
  variant,
  ...actions
}: VariantColumnActions & { variant: ProductVariant }) {
  return (
    <RowActions
      label={`Actions for ${variant.name || variant.sku}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(variant),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(variant),
        },
      ]}
    />
  );
}

export function OptionRowActions({
  option,
  ...actions
}: OptionColumnActions & { option: ProductOption }) {
  return (
    <RowActions
      label={`Actions for ${option.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(option),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(option),
        },
      ]}
    />
  );
}

export const selectionLabel = (variant: ProductVariant): string =>
  variant.selections.map((entry) => `${entry.optionName}: ${entry.value}`).join(" · ") || "—";

export const variantColumns = (
  rowActions: VariantColumnActions
): ColumnDef<ProductVariant>[] => [
  {
    accessorKey: "name",
    header: "Variant",
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
          <p className="truncate font-medium">{row.original.name || row.original.sku}</p>
          <p className="truncate font-mono text-xs uppercase text-muted-foreground">
            {row.original.sku}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => (
      <span className="truncate text-sm">{row.original.product?.name ?? "—"}</span>
    ),
  },
  {
    id: "selections",
    header: "Options",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.selections.map((entry) => (
          <Badge key={`${entry.optionName}-${entry.value}`} variant="secondary" className="text-[10px]">
            {entry.optionName}: {entry.value}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "sellingPrice",
    header: "Selling price",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatAmountValue(row.original.sellingPrice)}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        {row.original.isDefault && <StatusBadge color="blue" label="Default" />}
        <StatusBadge
          color={row.original.isActive ? "green" : "zinc"}
          label={row.original.isActive ? "Active" : "Inactive"}
        />
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <VariantRowActions variant={row.original} {...rowActions} />,
  },
];

export const optionColumns = (rowActions: OptionColumnActions): ColumnDef<ProductOption>[] => [
  {
    accessorKey: "name",
    header: "Option set",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        {row.original.description && (
          <p className="truncate text-xs text-muted-foreground">{row.original.description}</p>
        )}
      </div>
    ),
  },
  {
    id: "values",
    header: "Values",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.values.slice(0, 6).map((value) => (
          <Badge key={value} variant="secondary" className="text-[10px]">
            {value}
          </Badge>
        ))}
        {row.original.values.length > 6 && (
          <Badge variant="outline" className="text-[10px]">
            +{row.original.values.length - 6}
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "displayType",
    header: "Shown as",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {PRODUCT_OPTION_DISPLAY_LABELS[row.original.displayType]}
      </span>
    ),
  },
  {
    accessorKey: "variantCount",
    header: "Variants",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] tabular-nums">
        {row.original.variantCount}
      </Badge>
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
    cell: ({ row }) => <OptionRowActions option={row.original} {...rowActions} />,
  },
];
