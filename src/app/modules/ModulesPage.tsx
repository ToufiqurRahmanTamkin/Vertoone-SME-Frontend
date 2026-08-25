import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteAppModuleMutation,
  useGetAppModulesQuery,
} from "@/redux/apis/appModuleApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { AppModule } from "@/types/domain/appModule";
import { Boxes, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AppModuleFormModal } from "./components/AppModuleFormModal";
import { appModuleColumns } from "./modules.columns";

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

export default function ModulesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();

  const { data, isLoading, isFetching } = useGetAppModulesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive as unknown as boolean | undefined,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AppModule | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<AppModule | null>(null);
  const [deleteModule, { isLoading: isDeleting }] = useDeleteAppModuleMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (entry: AppModule) => {
    setEditing(entry);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteModule(pendingDelete._id).unwrap();
      toast.success("Module deleted");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the module");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () => appModuleColumns({ onEdit: openEdit, onDelete: setPendingDelete }),
    []
  );

  const modules = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Modules"
        description="The product features a subscription plan can grant. Active modules appear as options when building a plan."
      />

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search modules..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          <Button className="cursor-pointer" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            New module
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={modules}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(entry) => (
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {entry.icon ? (
                  <img
                    src={entry.icon}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-md border bg-background object-contain p-1"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                    <Boxes className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{entry.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    {entry.key}
                  </p>
                </div>
              </div>
              {entry.isActive ? (
                <StatusBadge color="green" label="Active" />
              ) : (
                <StatusBadge color="zinc" label="Inactive" />
              )}
            </div>
            {entry.description && (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                {entry.description}
              </p>
            )}
            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => openEdit(entry)}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(entry)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      />

      <AppModuleFormModal open={formOpen} onOpenChange={setFormOpen} module={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="Modules attached to a plan cannot be deleted — remove them from the plan or deactivate instead."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
