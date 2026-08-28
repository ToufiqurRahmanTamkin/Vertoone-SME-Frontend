import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { USER_STATUS_COLORS, USER_STATUS_LABELS } from "@/constant";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatDate } from "@/lib/date";
import { useGetConcernHeadsQuery, useGetConcernSummaryQuery } from "@/redux/apis/concernApis";
import type { UserStatus } from "@/types/domain/auth";
import type { ConcernHeadListItem } from "@/types/domain/concern";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Sign-in status",
    type: "select",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
    ],
  },
];

const menuCount = (head: ConcernHeadListItem): number =>
  Object.values(head.effectivePermissions).filter((permission) => permission.canView).length;

const columns: ColumnDef<ConcernHeadListItem>[] = [
  {
    accessorKey: "name",
    header: "Head",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    id: "concern",
    header: "Concern",
    cell: ({ row }) =>
      row.original.concern ? (
        <div className="min-w-0">
          <p className="truncate text-sm">{row.original.concern.name}</p>
          <p className="truncate font-mono text-[10px] text-muted-foreground">
            {row.original.concern.code}
          </p>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Unassigned</span>
      ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.phone || "—"}</span>
    ),
  },
  {
    id: "access",
    header: "Menu access",
    cell: ({ row }) => {
      const count = menuCount(row.original);
      return (
        <Badge variant={count === 0 ? "outline" : "secondary"} className="text-[10px]">
          {count === 0 ? "No menus" : `${count} menu${count === 1 ? "" : "s"}`}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last sign-in",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.lastLoginAt ? formatDate(row.original.lastLoginAt) : "Never"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={USER_STATUS_COLORS[row.original.status]}
        label={USER_STATUS_LABELS[row.original.status]}
      />
    ),
  },
];

export default function ConcernHeadsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();

  const { data, isLoading, isFetching } = useGetConcernHeadsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as UserStatus | undefined,
  });
  const { data: summary } = useGetConcernSummaryQuery();

  const heads = React.useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta;

  const withoutConcern = heads.filter((head) => head.concern === null).length;

  return (
    <>
      <PageHeader
        title="Concern Heads"
        description="Every concern head sign-in, the concern they run and the menus they can reach. Edit a head from its concern."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Head accounts</StatLabel>
          <StatValue>{summary?.headCount ?? 0}</StatValue>
          <StatDescription>One per concern you have created</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Can sign in</StatLabel>
          <StatValue>{summary?.activeHeadCount ?? 0}</StatValue>
          <StatDescription>Active sign-ins right now</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Unassigned on this page</StatLabel>
          <StatValue>{withoutConcern}</StatValue>
          <StatDescription>Heads whose concern was removed</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search concern heads..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
      />

      <DataTable
        columns={columns}
        data={heads}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(head) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{head.name}</p>
                <p className="truncate text-xs text-muted-foreground">{head.email}</p>
              </div>
              <StatusBadge
                color={USER_STATUS_COLORS[head.status]}
                label={USER_STATUS_LABELS[head.status]}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {head.concern ? head.concern.name : "No concern assigned"}
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-[10px]">
                {menuCount(head)} menus
              </Badge>
            </div>
          </div>
        )}
      />
    </>
  );
}
