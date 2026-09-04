import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { CurrencyNote } from "@/components/shared/currency-note";
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
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue } from "@/lib/amount";
import {
  useDeleteMaintenanceMutation,
  useGetAssetMaintenanceQuery,
  useGetAssetMaintenanceSummaryQuery,
  useGetAssetSummaryQuery,
} from "@/redux/apis/assetApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  MAINTENANCE_STATUSES,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_TYPES,
  MAINTENANCE_TYPE_LABELS,
  type AssetMaintenance,
  type MaintenanceStatus,
  type MaintenanceType,
} from "@/types/domain/asset";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { MaintenanceFormModal } from "./components/MaintenanceFormModal";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: MAINTENANCE_STATUSES.map((value) => ({
      label: MAINTENANCE_STATUS_LABELS[value],
      value,
    })),
  },
  {
    name: "type",
    label: "Kind",
    type: "select",
    options: MAINTENANCE_TYPES.map((value) => ({
      label: MAINTENANCE_TYPE_LABELS[value],
      value,
    })),
  },
];

const STATUS_COLORS: Record<MaintenanceStatus, "green" | "blue" | "amber" | "zinc"> = {
  SCHEDULED: "amber",
  IN_PROGRESS: "blue",
  COMPLETED: "green",
  CANCELLED: "zinc",
};

const formatDay = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function AssetMaintenancePage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/assets/maintenance");

  const { data, isLoading, isFetching } = useGetAssetMaintenanceQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as MaintenanceStatus | undefined,
    type: filters.type as MaintenanceType | undefined,
  });

  const { data: summary } = useGetAssetMaintenanceSummaryQuery();
  const { data: assetSummary } = useGetAssetSummaryQuery();
  const currency = assetSummary?.currency ?? "BDT";

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AssetMaintenance | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<AssetMaintenance | null>(null);
  const [deleteMaintenance, { isLoading: isDeleting }] = useDeleteMaintenanceMutation();

  const onEdit = React.useCallback((record: AssetMaintenance) => {
    setEditing(record);
    setFormOpen(true);
  }, []);

  const rowMenu = React.useCallback(
    (record: AssetMaintenance) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer"
              aria-label={`More actions for ${record.title}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={!access.canEdit} onSelect={() => onEdit(record)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={!access.canDelete}
              onSelect={() => setPendingDelete(record)}
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

  const columns = React.useMemo<ColumnDef<AssetMaintenance>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Job",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.asset?.name ?? "Removed asset"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Kind",
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-[10px]">
            {MAINTENANCE_TYPE_LABELS[row.original.type]}
          </Badge>
        ),
      },
      {
        accessorKey: "scheduledAt",
        header: "Scheduled",
        cell: ({ row }) => (
          <span
            className={
              row.original.isOverdue
                ? "text-sm font-medium text-red-600 dark:text-red-400"
                : "text-sm text-muted-foreground"
            }
          >
            {formatDay(row.original.scheduledAt)}
          </span>
        ),
      },
      {
        accessorKey: "vendorName",
        header: "Done by",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.vendorName || row.original.performedBy?.name || "—"}
          </span>
        ),
      },
      {
        accessorKey: "cost",
        header: () => <div className="text-right">Cost</div>,
        cell: ({ row }) => (
          <div className="text-right text-sm">{formatAmountValue(row.original.cost)}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            color={row.original.isOverdue ? "red" : STATUS_COLORS[row.original.status]}
            label={
              row.original.isOverdue
                ? "Overdue"
                : MAINTENANCE_STATUS_LABELS[row.original.status]
            }
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
      await deleteMaintenance(pendingDelete._id).unwrap();
      toast.success("Maintenance job removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the job");
    }
  };

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Asset maintenance"
        description="Repairs, services and inspections — what is booked, what is late and what it cost."
        actions={
          <>
            <BackLink to="/hrms/assets/overview" label="Assets overview" />
            <CurrencyNote currency={currency} />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Booked in</StatLabel>
          <StatValue>{summary?.scheduledCount ?? 0}</StatValue>
          <StatDescription>{summary?.inProgressCount ?? 0} under way</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Overdue</StatLabel>
          <StatValue>{summary?.overdueCount ?? 0}</StatValue>
          <StatDescription>Past their scheduled date</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Finished</StatLabel>
          <StatValue>{summary?.completedCount ?? 0}</StatValue>
          <StatDescription>Out of {summary?.total ?? 0} jobs</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Spent on upkeep</StatLabel>
          <StatValue>{formatAmountValue(summary?.totalCost ?? 0)}</StatValue>
          <StatDescription>Across every job recorded</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search maintenance..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New job"
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
        mobileCard={(record) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{record.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {record.asset?.name ?? "Removed asset"}
                </p>
              </div>
              <StatusBadge
                color={record.isOverdue ? "red" : STATUS_COLORS[record.status]}
                label={record.isOverdue ? "Overdue" : MAINTENANCE_STATUS_LABELS[record.status]}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {MAINTENANCE_TYPE_LABELS[record.type]}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {formatDay(record.scheduledAt)}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {formatAmountValue(record.cost)}
              </Badge>
            </div>

            <div className="mt-3 border-t pt-3">{rowMenu(record)}</div>
          </div>
        )}
      />

      <MaintenanceFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        record={editing}
        currency={currency}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.title ?? ""}"?`}
        description="The job disappears from the asset's history."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
