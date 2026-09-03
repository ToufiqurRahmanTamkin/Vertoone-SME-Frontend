import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount } from "@/lib/amount";
import {
  useDeleteWarehouseMutation,
  useGetWarehouseSummaryQuery,
  useGetWarehousesQuery,
} from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  WAREHOUSE_TYPES,
  WAREHOUSE_TYPE_LABELS,
  type Warehouse,
  type WarehouseType,
} from "@/types/domain/warehouse";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { WarehouseFormModal } from "./components/WarehouseFormModal";
import { WarehouseRowActions, warehouseColumns } from "./warehouses.columns";

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
  {
    name: "type",
    label: "Type",
    type: "select",
    options: WAREHOUSE_TYPES.map((type) => ({
      label: WAREHOUSE_TYPE_LABELS[type],
      value: type,
    })),
  },
];

export default function WarehousesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/inventory/warehouses");

  const { data, isLoading, isFetching } = useGetWarehousesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
    type: filters.type as WarehouseType | undefined,
  });

  const { data: summary } = useGetWarehouseSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Warehouse | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Warehouse | null>(null);
  const [deleteWarehouse, { isLoading: isDeleting }] = useDeleteWarehouseMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (warehouse: Warehouse) => {
    setEditing(warehouse);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteWarehouse(pendingDelete._id).unwrap();
      toast.success("Warehouse deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the warehouse");
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: openEdit,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => warehouseColumns(rowActions), [rowActions]);

  const warehouses = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Warehouses"
        description="Where stock physically sits. Every receipt, transfer and delivery is counted against one."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Warehouses</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Offered when raising a document</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Stock value</StatLabel>
          <StatValue>{formatAmount(summary?.stockValue ?? 0)}</StatValue>
          <StatDescription>At average cost across every location</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search warehouses..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New warehouse"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} warehouses. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} warehouses your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={warehouses}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(warehouse) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{warehouse.name}</p>
                <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                  {warehouse.code}
                </p>
              </div>
              <StatusBadge
                color={warehouse.isActive ? "green" : "zinc"}
                label={warehouse.isActive ? "Active" : "Inactive"}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">{WAREHOUSE_TYPE_LABELS[warehouse.type]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Manager</dt>
                <dd className="font-medium">
                  {warehouse.manager?.name || warehouse.contactPerson || "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Default</dt>
                <dd className="font-medium">{warehouse.isDefault ? "Yes" : "No"}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <WarehouseRowActions warehouse={warehouse} {...rowActions} />
            </div>
          </div>
        )}
      />

      <WarehouseFormModal open={formOpen} onOpenChange={setFormOpen} warehouse={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="A warehouse still holding stock cannot be deleted. Transfer or adjust the stock out first."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
