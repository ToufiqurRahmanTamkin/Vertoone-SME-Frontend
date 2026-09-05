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
import {
  useDeleteReorderRuleMutation,
  useGetReorderRuleSummaryQuery,
  useGetReorderRulesQuery,
} from "@/redux/apis/reorderRuleApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  REORDER_STATUSES,
  REORDER_STATUS_COLORS,
  REORDER_STATUS_LABELS,
  type ReorderRule,
  type ReorderStatus,
} from "@/types/domain/reorderRule";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ReorderRuleFormModal } from "./components/ReorderRuleFormModal";
import { ReorderRowActions, reorderColumns } from "./reorder-rules.columns";

export default function ReorderRulesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/inventory/reorder-rules");

  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();
  const { data: suppliers = [] } = useGetSupplierOptionsQuery();

  const { data, isLoading, isFetching } = useGetReorderRulesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    warehouseId: filters.warehouseId as string | undefined,
    supplierId: filters.supplierId as string | undefined,
    status: filters.status as ReorderStatus | undefined,
  });

  const { data: summary } = useGetReorderRuleSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ReorderRule | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<ReorderRule | null>(null);
  const [deleteRule, { isLoading: isDeleting }] = useDeleteReorderRuleMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: REORDER_STATUSES.map((status) => ({
          label: REORDER_STATUS_LABELS[status],
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
        name: "supplierId",
        label: "Supplier",
        type: "select",
        options: suppliers.map((supplier) => ({ label: supplier.name, value: supplier._id })),
      },
    ],
    [warehouses, suppliers]
  );

  const rowActions = React.useMemo(
    () => ({
      onEdit: (rule: ReorderRule) => {
        setEditing(rule);
        setFormOpen(true);
      },
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => reorderColumns(rowActions), [rowActions]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteRule(pendingDelete._id).unwrap();
      toast.success("Reorder rule deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the reorder rule");
    }
  };

  const rules = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Reorder rules"
        description="Minimum levels that trigger a purchase suggestion, and who to buy from when they do."
        actions={<BackLink to="/sme/inventory/overview" label="Inventory overview" />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Rules</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Below minimum</StatLabel>
          <StatValue>{formatNumber(summary?.belowMinimumCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.outOfStockCount ?? 0)} already out of stock
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Units to order</StatLabel>
          <StatValue>{formatNumber(summary?.suggestedUnits ?? 0)}</StatValue>
          <StatDescription>Suggested across every rule that has tripped</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Average lead time</StatLabel>
          <StatValue>{summary?.averageLeadTimeDays ?? 0}d</StatValue>
          <StatDescription>How long replenishment usually takes</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search rules by product or SKU..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New rule"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} reorder rules. Delete one or upgrade to add more.`
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
          You have used all {limit} reorder rules your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={rules}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(rule) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{rule.name}</p>
                <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                  {rule.sku}
                </p>
              </div>
              <StatusBadge
                color={REORDER_STATUS_COLORS[rule.status]}
                label={REORDER_STATUS_LABELS[rule.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Applies at</dt>
                <dd className="truncate font-medium">
                  {rule.warehouse?.name ?? "Every warehouse"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">On hand</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(rule.onHand)} (min {formatNumber(rule.minimumQuantity)})
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Suggest ordering</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(rule.suggestedQuantity)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Buy from</dt>
                <dd className="truncate font-medium">{rule.preferredSupplier?.name ?? "—"}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <ReorderRowActions rule={rule} {...rowActions} />
            </div>
          </div>
        )}
      />

      <ReorderRuleFormModal open={formOpen} onOpenChange={setFormOpen} rule={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete the rule for "${pendingDelete?.name ?? ""}"?`}
        description="The product stops being watched. Its stock is left untouched."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
