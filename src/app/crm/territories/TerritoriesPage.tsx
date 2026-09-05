import { ActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import {
  useDeleteTerritoryMutation,
  useGetTerritoriesQuery,
  useGetTerritorySummaryQuery,
} from "@/redux/apis/territoryApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  TERRITORY_MATCH_MODE_COLORS,
  TERRITORY_MATCH_MODE_LABELS,
  TERRITORY_MATCH_MODES,
  type Territory,
  type TerritoryMatchMode,
} from "@/types/domain/territory";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { TerritoryFormModal } from "./components/TerritoryFormModal";
import {
  TerritoryRowActions,
  ruleSummaryOf,
  territoryColumns,
} from "./territories.columns";

export default function TerritoriesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/crm/territories");

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: systemConfig } = useGetPublicSystemConfigQuery();

  const { data, isLoading, isFetching } = useGetTerritoriesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    matchMode: filters.matchMode as TerritoryMatchMode | undefined,
    managerId: filters.managerId as string | undefined,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetTerritorySummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Territory | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Territory | null>(null);
  const [deleteTerritory, { isLoading: isDeleting }] = useDeleteTerritoryMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "matchMode",
        label: "Matched",
        type: "select",
        options: TERRITORY_MATCH_MODES.map((mode) => ({
          label: TERRITORY_MATCH_MODE_LABELS[mode],
          value: mode,
        })),
      },
      {
        name: "managerId",
        label: "Manager",
        type: "select",
        options: employeeOptions.map((employee) => ({
          label: employee.name,
          value: employee._id,
        })),
      },
      {
        name: "isActive",
        label: "State",
        type: "select",
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
    ],
    [employeeOptions]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (territory: Territory) => {
    setEditing(territory);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteTerritory(pendingDelete._id).unwrap();
      toast.success("Territory deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the territory");
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

  const columns = React.useMemo(() => territoryColumns(rowActions), [rowActions]);

  const territories = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Territories"
        description="How accounts and leads are split across your team, and what each patch is carrying."
        actions={<CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Territories</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null
              ? `${summary?.activeCount ?? 0} active`
              : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Contacts covered</StatLabel>
          <StatValue>{formatNumber(summary?.coveredContactCount)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.uncoveredContactCount)} fall outside every territory
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Deals covered</StatLabel>
          <StatValue>{formatNumber(summary?.coveredDealCount)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.uncoveredDealCount)} sit with nobody's patch
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Open value covered</StatLabel>
          <StatValue>{formatAmountValue(summary?.coveredOpenValue)}</StatValue>
          <StatDescription>Open deal value inside a territory</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search territories..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New territory"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} territories. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} territories your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={territories}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
        getRowId={(row) => row._id}
        mobileCard={(territory) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <ColorChip color={territory.color} label={territory.name} />
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {ruleSummaryOf(territory)}
                </p>
              </div>
              <StatusBadge
                color={territory.isActive ? "green" : "zinc"}
                label={territory.isActive ? "Active" : "Inactive"}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Matched</dt>
                <dd className="font-medium">
                  {TERRITORY_MATCH_MODE_LABELS[territory.matchMode]}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Manager</dt>
                <dd className="truncate font-medium">{territory.manager?.name || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Contacts</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(territory.coverage.contactCount)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Open deals</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(territory.coverage.openDealCount)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Open value</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(territory.coverage.openValue)}
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge
                color={TERRITORY_MATCH_MODE_COLORS[territory.matchMode]}
                label={`Order ${territory.priority}`}
              />
            </div>

            <div className="mt-3 border-t pt-3">
              <TerritoryRowActions territory={territory} {...rowActions} />
            </div>
          </div>
        )}
      />

      <TerritoryFormModal open={formOpen} onOpenChange={setFormOpen} territory={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The territory stops grouping records. The contacts, leads and deals behind it are kept."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
