import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";
import {
  ACTIVITY_ACTION_LABELS,
  ACTIVITY_CATEGORY_COLORS,
  ACTIVITY_CATEGORY_LABELS,
  ACTIVITY_SEVERITY_COLORS,
  ACTIVITY_SEVERITY_LABELS,
  toOptions,
} from "@/constant";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatNumber } from "@/lib/amount";
import { formatDateTime, safeDistanceToNow } from "@/lib/date";
import {
  useGetActivitiesQuery,
  useGetActivityCompaniesQuery,
  useGetActivitySummaryQuery,
} from "@/redux/apis/activityApis";
import type {
  ActivityAction,
  ActivityCategory,
  ActivitySeverity,
} from "@/types/domain/activity";
import { Activity as ActivityIcon, Building2, CalendarClock, TriangleAlert } from "lucide-react";
import * as React from "react";
import { activityColumns } from "./activity.columns";

export default function ActivityPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const { data: companyOptions } = useGetActivityCompaniesQuery();

  const query = {
    search: filters.search,
    companyId: filters.companyId as string | undefined,
    action: filters.action as ActivityAction | undefined,
    category: filters.category as ActivityCategory | undefined,
    severity: filters.severity as ActivitySeverity | undefined,
    from: filters.from as string | undefined,
    to: filters.to as string | undefined,
  };

  const { data, isLoading, isFetching } = useGetActivitiesQuery({
    ...query,
    page: filters.page,
    limit: filters.limit,
  });
  const { data: summary, isLoading: isSummaryLoading } = useGetActivitySummaryQuery(query);

  const filterConfigs: FilterConfig[] = React.useMemo(
    () => [
      {
        name: "companyId",
        label: "Company",
        type: "select",
        triggerClassName: "sm:w-56",
        options: (companyOptions ?? []).map((option) => ({
          value: option.companyId,
          label: `${option.companyName} (${option.count})`,
        })),
      },
      {
        name: "category",
        label: "Area",
        type: "select",
        options: toOptions(ACTIVITY_CATEGORY_LABELS),
      },
      {
        name: "action",
        label: "Action",
        type: "select",
        triggerClassName: "sm:w-52",
        options: toOptions(ACTIVITY_ACTION_LABELS),
      },
      {
        name: "severity",
        label: "Severity",
        type: "select",
        options: toOptions(ACTIVITY_SEVERITY_LABELS),
      },
      { name: "startDate", label: "Date", type: "date-range" },
    ],
    [companyOptions]
  );

  const columns = React.useMemo(() => activityColumns(), []);

  const records = data?.data ?? [];
  const meta = data?.meta;

  const stats = [
    {
      label: "Matching events",
      value: formatNumber(summary?.total),
      icon: ActivityIcon,
      color: "info" as const,
    },
    {
      label: "Today",
      value: formatNumber(summary?.today),
      icon: CalendarClock,
      color: "default" as const,
    },
    {
      label: "Critical",
      value: formatNumber(summary?.criticalCount),
      icon: TriangleAlert,
      color: "error" as const,
    },
    {
      label: "Companies involved",
      value: formatNumber(summary?.companiesTouched),
      icon: Building2,
      color: "success" as const,
    },
  ];

  return (
    <>
      <PageHeader
        title="System Activity"
        description="Every action taken across the system, who took it, and which company it touched."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Stat key={label}>
            <StatLabel>{label}</StatLabel>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <StatValue className="truncate">{value}</StatValue>
            )}
            <StatIndicator variant="icon" color={color}>
              <Icon />
            </StatIndicator>
          </Stat>
        ))}
      </div>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search detail, company, actor or IP..."
        filters={filterConfigs}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
      />

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(record) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {ACTIVITY_ACTION_LABELS[record.action] ?? record.action}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatDateTime(record.createdAt)}
                </p>
              </div>
              <StatusBadge
                color={ACTIVITY_SEVERITY_COLORS[record.severity] ?? "muted"}
                label={ACTIVITY_SEVERITY_LABELS[record.severity] ?? record.severity}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{record.message}</p>
            <dl className="mt-3 space-y-1.5 border-t pt-3 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Area</dt>
                <dd>
                  <StatusBadge
                    color={ACTIVITY_CATEGORY_COLORS[record.category] ?? "muted"}
                    label={ACTIVITY_CATEGORY_LABELS[record.category] ?? record.category}
                  />
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Company</dt>
                <dd className="truncate font-medium">
                  {record.companyId ? record.companyName || "Unnamed company" : "System-wide"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">By</dt>
                <dd className="truncate font-medium">
                  {record.isSystemActor ? "System" : record.actorName || record.actorEmail || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">When</dt>
                <dd className="truncate">{safeDistanceToNow(record.createdAt)}</dd>
              </div>
            </dl>
          </div>
        )}
      />
    </>
  );
}
