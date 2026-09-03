import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { ProductSubCategory } from "@/types/domain/productSubCategory";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface ProductSubCategoryColumnActions {
  onEdit: (subCategory: ProductSubCategory) => void;
  onDelete: (subCategory: ProductSubCategory) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function ProductSubCategoryRowActions({
  subCategory,
  ...actions
}: ProductSubCategoryColumnActions & { subCategory: ProductSubCategory }) {
  return (
    <RowActions
      label={`Actions for ${subCategory.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(subCategory),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(subCategory),
        },
      ]}
    />
  );
}

export const productSubCategoryColumns = (
  rowActions: ProductSubCategoryColumnActions
): ColumnDef<ProductSubCategory>[] => [
  {
    accessorKey: "name",
    header: "Sub category",
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
    id: "category",
    header: "Category",
    cell: ({ row }) =>
      row.original.category ? (
        <ColorChip color={row.original.category.color} label={row.original.category.name} />
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
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
    cell: ({ row }) => <ProductSubCategoryRowActions subCategory={row.original} {...rowActions} />,
  },
];
