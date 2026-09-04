import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteAssetCategoryMutation,
  useGetAssetCategoriesQuery,
} from "@/redux/apis/assetApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { AssetCategory } from "@/types/domain/asset";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AssetCategoryFormModal } from "./components/AssetCategoryFormModal";

const FILTERS: FilterConfig[] = [
  {
    name: "isActive",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
];

export default function AssetCategoriesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/assets/categories");

  const { data, isLoading, isFetching } = useGetAssetCategoriesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AssetCategory | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<AssetCategory | null>(null);
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteAssetCategoryMutation();

  const onEdit = React.useCallback((category: AssetCategory) => {
    setEditing(category);
    setFormOpen(true);
  }, []);

  const rowMenu = React.useCallback(
    (category: AssetCategory) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer"
              aria-label={`More actions for ${category.name}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={!access.canEdit} onSelect={() => onEdit(category)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={!access.canDelete}
              onSelect={() => setPendingDelete(category)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    [access.canEdit, access.canDelete, onEdit]
  );

  const columns = React.useMemo<ColumnDef<AssetCategory>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Category",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: row.original.color }}
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.description}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
      },
      {
        accessorKey: "usefulLifeMonths",
        header: "Useful life",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.usefulLifeMonths} months
          </span>
        ),
      },
      {
        accessorKey: "assetCount",
        header: () => <div className="text-right">Assets</div>,
        cell: ({ row }) => <div className="text-right text-sm">{row.original.assetCount}</div>,
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
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => rowMenu(row.original),
      },
    ],
    [rowMenu]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCategory(pendingDelete._id).unwrap();
      toast.success("Category removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the category");
    }
  };

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Asset categories"
        description="How assets are grouped, and how long each kind is expected to last."
        actions={<BackLink to="/hrms/assets/overview" label="Assets overview" />}
      />

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search categories..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New category"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            />
          )
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
        getRowId={(row) => row._id}
        mobileCard={(category) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{category.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{category.code}</p>
                </div>
              </div>
              <StatusBadge
                color={category.isActive ? "green" : "zinc"}
                label={category.isActive ? "Active" : "Inactive"}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {category.assetCount} asset{category.assetCount === 1 ? "" : "s"}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {category.usefulLifeMonths} months
              </Badge>
            </div>

            <div className="mt-3 border-t pt-3">{rowMenu(category)}</div>
          </div>
        )}
      />

      <AssetCategoryFormModal open={formOpen} onOpenChange={setFormOpen} category={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.name ?? ""}"?`}
        description="Only categories with no assets filed under them can go."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
