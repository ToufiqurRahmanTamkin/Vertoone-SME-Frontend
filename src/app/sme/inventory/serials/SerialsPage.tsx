import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatNumber } from "@/lib/amount";
import { useGetProductOptionsQuery } from "@/redux/apis/productApis";
import {
  useDeleteSerialNumberMutation,
  useGetSerialNumberSummaryQuery,
  useGetSerialNumbersQuery,
} from "@/redux/apis/serialNumberApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  SERIAL_STATUSES,
  SERIAL_STATUS_COLORS,
  SERIAL_STATUS_LABELS,
  type SerialNumber,
  type SerialStatus,
} from "@/types/domain/serialNumber";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { SerialFormModal } from "./components/SerialFormModal";
import { SerialRowActions, serialColumns, warrantyLabel } from "./serials.columns";

export default function SerialsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/inventory/serials");

  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();
  const { data: products = [] } = useGetProductOptionsQuery();

  const { data, isLoading, isFetching } = useGetSerialNumbersQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    productId: filters.productId as string | undefined,
    warehouseId: filters.warehouseId as string | undefined,
    status: filters.status as SerialStatus | undefined,
  });

  const { data: summary } = useGetSerialNumberSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SerialNumber | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<SerialNumber | null>(null);
  const [deleteSerial, { isLoading: isDeleting }] = useDeleteSerialNumberMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: SERIAL_STATUSES.map((status) => ({
          label: SERIAL_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "warehouseId",
        label: "Warehouse",
        type: "select",
        options: warehouses.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse._id,
        })),
      },
      {
        name: "productId",
        label: "Product",
        type: "select",
        options: products.map((product) => ({ label: product.name, value: product._id })),
      },
    ],
    [warehouses, products]
  );

  const rowActions = React.useMemo(
    () => ({
      onEdit: (serial: SerialNumber) => {
        setEditing(serial);
        setFormOpen(true);
      },
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => serialColumns(rowActions), [rowActions]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteSerial(pendingDelete._id).unwrap();
      toast.success("Serial number deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the serial number");
    }
  };

  const serials = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Serial numbers"
        description="Serialised units tracked from receipt through to sale, with their warranty cover."
        actions={<BackLink to="/sme/inventory/overview" label="Inventory overview" />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Serials tracked</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>In stock</StatLabel>
          <StatValue>{formatNumber(summary?.inStockCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.reservedCount ?? 0)} reserved on open orders
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Sold</StatLabel>
          <StatValue>{formatNumber(summary?.soldCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.damagedCount ?? 0)} written off as damaged
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Under warranty</StatLabel>
          <StatValue>{formatNumber(summary?.underWarrantyCount ?? 0)}</StatValue>
          <StatDescription>
            Across {formatNumber(summary?.trackedProductCount ?? 0)} products
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search serials or references..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Record serials"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} serial numbers. Delete some or upgrade to add more.`
                  : undefined
              }
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} serial numbers your plan allows. Delete some or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={serials}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(serial) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">
                  {serial.serialNumber}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {serial.product?.name ?? "—"}
                </p>
              </div>
              <StatusBadge
                color={SERIAL_STATUS_COLORS[serial.status]}
                label={SERIAL_STATUS_LABELS[serial.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Held at</dt>
                <dd className="truncate font-medium">{serial.warehouse?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Batch</dt>
                <dd className="truncate font-medium">{serial.batch?.batchNumber ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Warranty</dt>
                <dd className="font-medium">{warrantyLabel(serial)}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <SerialRowActions serial={serial} {...rowActions} />
            </div>
          </div>
        )}
      />

      <SerialFormModal open={formOpen} onOpenChange={setFormOpen} serial={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.serialNumber ?? ""}"?`}
        description="The unit stops being tracked. Stock levels themselves are left untouched."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
