import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useGetAssetAssignmentSummaryQuery,
  useGetAssetAssignmentsQuery,
} from "@/redux/apis/assetApis";
import {
  ASSET_CONDITION_LABELS,
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_LABELS,
  type AssetAssignment,
  type AssignmentStatus,
} from "@/types/domain/asset";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ASSIGNMENT_STATUSES.map((value) => ({
      label: ASSIGNMENT_STATUS_LABELS[value],
      value,
    })),
  },
  {
    name: "overdueOnly",
    label: "Overdue",
    type: "select",
    options: [{ label: "Overdue only", value: "true" }],
  },
];

const formatDay = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function AssetAssignmentsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();

  const { data, isLoading, isFetching } = useGetAssetAssignmentsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as AssignmentStatus | undefined,
    overdueOnly: filters.overdueOnly === "true" ? true : undefined,
  });

  const { data: summary } = useGetAssetAssignmentSummaryQuery();

  const columns = React.useMemo<ColumnDef<AssetAssignment>[]>(
    () => [
      {
        accessorKey: "asset",
        header: "Asset",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.asset?.name ?? "Removed asset"}</p>
            <p className="truncate text-xs text-muted-foreground">
              <span className="font-mono">{row.original.asset?.assetCode ?? "—"}</span>
            </p>
          </div>
        ),
      },
      {
        accessorKey: "holder",
        header: "Held by",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.original.holder?.name ?? "—"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.holderType === "USER" ? "User" : "Employee"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "assignedAt",
        header: "Handed over",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDay(row.original.assignedAt)}
          </span>
        ),
      },
      {
        accessorKey: "dueAt",
        header: "Due back",
        cell: ({ row }) => (
          <span
            className={
              row.original.isOverdue
                ? "text-sm font-medium text-red-600 dark:text-red-400"
                : "text-sm text-muted-foreground"
            }
          >
            {formatDay(row.original.dueAt)}
          </span>
        ),
      },
      {
        accessorKey: "daysHeld",
        header: () => <div className="text-right">Days held</div>,
        cell: ({ row }) => <div className="text-right text-sm">{row.original.daysHeld}</div>,
      },
      {
        accessorKey: "conditionOnAssign",
        header: "Condition",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {ASSET_CONDITION_LABELS[row.original.conditionOnAssign]}
            {row.original.conditionOnReturn &&
              ` → ${ASSET_CONDITION_LABELS[row.original.conditionOnReturn]}`}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            color={
              row.original.status === "RETURNED"
                ? "zinc"
                : row.original.isOverdue
                  ? "red"
                  : "blue"
            }
            label={
              row.original.isOverdue && row.original.status === "ACTIVE"
                ? "Overdue"
                : ASSIGNMENT_STATUS_LABELS[row.original.status]
            }
          />
        ),
      },
    ],
    []
  );

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Asset assignments"
        description="Every handover and return, so you always know where a thing went."
        actions={<BackLink to="/hrms/assets/overview" label="Assets overview" />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Out right now</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>
            {summary?.employeeHeldCount ?? 0} with employees · {summary?.userHeldCount ?? 0} with
            users
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Overdue</StatLabel>
          <StatValue>{summary?.overdueCount ?? 0}</StatValue>
          <StatDescription>Past their agreed return date</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Returned</StatLabel>
          <StatValue>{summary?.returnedCount ?? 0}</StatValue>
          <StatDescription>Closed handovers</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>All time</StatLabel>
          <StatValue>{summary?.total ?? 0}</StatValue>
          <StatDescription>Handovers recorded</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search by asset..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
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
        mobileCard={(assignment) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {assignment.asset?.name ?? "Removed asset"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {assignment.holder?.name ?? "—"}
                </p>
              </div>
              <StatusBadge
                color={
                  assignment.status === "RETURNED"
                    ? "zinc"
                    : assignment.isOverdue
                      ? "red"
                      : "blue"
                }
                label={
                  assignment.isOverdue && assignment.status === "ACTIVE"
                    ? "Overdue"
                    : ASSIGNMENT_STATUS_LABELS[assignment.status]
                }
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {formatDay(assignment.assignedAt)}
              </Badge>
              {assignment.dueAt && (
                <Badge variant="outline" className="text-[10px]">
                  Due {formatDay(assignment.dueAt)}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px]">
                {assignment.daysHeld} day{assignment.daysHeld === 1 ? "" : "s"}
              </Badge>
            </div>
          </div>
        )}
      />
    </>
  );
}
