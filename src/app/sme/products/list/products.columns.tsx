import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_TYPE_LABELS, type Product } from "@/types/domain/product";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface ProductColumnActions {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function ProductRowActions({
  product,
  ...actions
}: ProductColumnActions & { product: Product }) {
  return (
    <RowActions
      label={`Actions for ${product.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(product),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(product),
        },
      ]}
    />
  );
}

export const productColumns = (
  rowActions: ProductColumnActions
): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-2">
        {row.original.imageUrl ? (
          <img
            src={row.original.imageUrl}
            alt=""
            className="h-9 w-9 shrink-0 rounded-md border object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate font-mono text-xs uppercase text-muted-foreground">
            {row.original.sku}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-1">
        {row.original.category ? (
          <ColorChip color={row.original.category.color} label={row.original.category.name} />
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
        {row.original.subCategory && (
          <span className="truncate text-xs text-muted-foreground">
            {row.original.subCategory.name}
          </span>
        )}
      </div>
    ),
  },
  {
    id: "brand",
    header: "Brand",
    cell: ({ row }) =>
      row.original.brand ? (
        <ColorChip color={row.original.brand.color} label={row.original.brand.name} />
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {PRODUCT_TYPE_LABELS[row.original.type]}
      </Badge>
    ),
  },
  {
    accessorKey: "sellingPrice",
    header: "Selling price",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.sellingPrice ? row.original.sellingPrice.toLocaleString() : "—"}
      </span>
    ),
  },
  {
    accessorKey: "openingStock",
    header: "Stock",
    cell: ({ row }) => {
      const { openingStock, lowStockAlert } = row.original;
      const isLow = lowStockAlert > 0 && openingStock <= lowStockAlert;
      return (
        <span className={isLow ? "text-sm font-medium tabular-nums text-amber-600" : "text-sm tabular-nums"}>
          {openingStock.toLocaleString()}
        </span>
      );
    },
  },
  {
    id: "channels",
    header: "Channels",
    cell: ({ row }) => {
      const { pos, shop } = row.original.channels;
      if (!pos && !shop) return <span className="text-sm text-muted-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {pos && (
            <Badge variant="outline" className="text-[10px]">
              POS
            </Badge>
          )}
          {shop && (
            <Badge variant="outline" className="text-[10px]">
              Shop
            </Badge>
          )}
        </div>
      );
    },
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
    cell: ({ row }) => <ProductRowActions product={row.original} {...rowActions} />,
  },
];
