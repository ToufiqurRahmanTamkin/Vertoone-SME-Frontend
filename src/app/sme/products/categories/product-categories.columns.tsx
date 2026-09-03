import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { ProductCategory } from "@/types/domain/productCategory";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface ProductCategoryColumnActions {
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function ProductCategoryRowActions({
  category,
  ...actions
}: ProductCategoryColumnActions & { category: ProductCategory }) {
  return (
    <RowActions
      label={`Actions for ${category.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(category),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(category),
        },
      ]}
    />
  );
}

export const productCategoryColumns = (
  rowActions: ProductCategoryColumnActions
): ColumnDef<ProductCategory>[] => [
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => (
      <div className="min-w-0">
        <ColorChip color={row.original.color} label={row.original.name} />
        {row.original.code && (
          <p className="mt-1 truncate font-mono text-xs uppercase text-muted-foreground">
            {row.original.code}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="line-clamp-2 text-sm text-muted-foreground">
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    accessorKey: "subCategoryCount",
    header: "Sub categories",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] tabular-nums">
        {row.original.subCategoryCount}
      </Badge>
    ),
  },
  {
    accessorKey: "productCount",
    header: "Products",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] tabular-nums">
        {row.original.productCount}
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
    cell: ({ row }) => <ProductCategoryRowActions category={row.original} {...rowActions} />,
  },
];
