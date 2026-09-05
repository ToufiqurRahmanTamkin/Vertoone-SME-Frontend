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
  useDeleteUnitMutation,
  useGetUnitOptionsQuery,
  useGetUnitSummaryQuery,
  useGetUnitsQuery,
} from "@/redux/apis/unitOfMeasureApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  UNIT_FAMILIES,
  UNIT_FAMILY_LABELS,
  type UnitFamily,
  type UnitOfMeasure,
} from "@/types/domain/unitOfMeasure";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { UnitFormModal } from "./components/UnitFormModal";
import { UnitRowActions, conversionLabel, unitColumns } from "./units.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "family",
    label: "Measures",
    type: "select",
    options: UNIT_FAMILIES.map((family) => ({
      label: UNIT_FAMILY_LABELS[family],
      value: family,
    })),
  },
  {
    name: "isBase",
    label: "Kind",
    type: "select",
    options: [
      { label: "Base units", value: "true" },
      { label: "Derived units", value: "false" },
    ],
  },
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

export default function UnitsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/products/units");

  const { data, isLoading, isFetching } = useGetUnitsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    family: filters.family as UnitFamily | undefined,
    isBase: filters.isBase === undefined ? undefined : filters.isBase === "true",
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetUnitSummaryQuery();
  const { data: unitOptions = [] } = useGetUnitOptionsQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UnitOfMeasure | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<UnitOfMeasure | null>(null);
  const [deleteUnit, { isLoading: isDeleting }] = useDeleteUnitMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (unit: UnitOfMeasure) => {
    setEditing(unit);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteUnit(pendingDelete._id).unwrap();
      toast.success("Unit deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the unit");
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

  const columns = React.useMemo(() => unitColumns(rowActions), [rowActions]);

  const units = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Units of measure"
        description="How each product is counted, and the conversions between the units you buy, stock and sell in."
        actions={<BackLink to="/sme/products/overview" label="Products overview" />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Units</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Base units</StatLabel>
          <StatValue>{formatNumber(summary?.baseCount ?? 0)}</StatValue>
          <StatDescription>Everything else converts into these</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Families covered</StatLabel>
          <StatValue>{formatNumber(summary?.familyCount ?? 0)}</StatValue>
          <StatDescription>Weight, volume, length and the rest</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Products measured</StatLabel>
          <StatValue>{formatNumber(summary?.linkedProductCount ?? 0)}</StatValue>
          <StatDescription>Products carrying a unit</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search units..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New unit"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} units. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} units your plan allows. Delete one or upgrade your subscription
          to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={units}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(unit) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{unit.name}</p>
                <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                  {unit.code}
                </p>
              </div>
              <StatusBadge
                color={unit.isActive ? "green" : "zinc"}
                label={unit.isActive ? "Active" : "Inactive"}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Measures</dt>
                <dd className="font-medium">{UNIT_FAMILY_LABELS[unit.family]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Conversion</dt>
                <dd className="font-medium">{conversionLabel(unit)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Products</dt>
                <dd className="font-medium tabular-nums">{unit.productCount}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <UnitRowActions unit={unit} {...rowActions} />
            </div>
          </div>
        )}
      />

      <UnitFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        unit={editing}
        baseUnits={unitOptions}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="Units still measuring a product, or used as a base by another unit, cannot be deleted."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
