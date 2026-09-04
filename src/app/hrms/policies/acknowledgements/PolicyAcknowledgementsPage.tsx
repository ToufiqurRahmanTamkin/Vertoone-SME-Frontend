import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Progress } from "@/components/ui/progress";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useGetPoliciesQuery,
  useGetPolicyAcknowledgementSummaryQuery,
  useGetPolicyAcknowledgementsQuery,
} from "@/redux/apis/policyApis";
import { POLICY_CATEGORY_LABELS, type PolicyAcknowledgement } from "@/types/domain/policy";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

const formatMoment = (value: string): string =>
  new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function PolicyAcknowledgementsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();

  const { data: policies } = useGetPoliciesQuery({ limit: 100, status: "PUBLISHED" });

  const { data, isLoading, isFetching } = useGetPolicyAcknowledgementsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    policyId: filters.policyId as string | undefined,
    outdatedOnly: filters.outdatedOnly === "true" ? true : undefined,
  });

  const { data: summary } = useGetPolicyAcknowledgementSummaryQuery();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "policyId",
        label: "Policy",
        type: "select",
        options: (policies?.data ?? []).map((row) => ({ label: row.title, value: row._id })),
      },
      {
        name: "outdatedOnly",
        label: "Version",
        type: "select",
        options: [{ label: "On an old version", value: "true" }],
      },
    ],
    [policies]
  );

  const columns = React.useMemo<ColumnDef<PolicyAcknowledgement>[]>(
    () => [
      {
        accessorKey: "employee",
        header: "Who",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">
              {row.original.employee?.name || row.original.userName || "—"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.employee?.employeeCode || "User account"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "policy",
        header: "Policy",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.original.policy?.title ?? "—"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.policy
                ? POLICY_CATEGORY_LABELS[row.original.policy.category]
                : ""}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "version",
        header: "Version",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px]">
            v{row.original.version}
          </Badge>
        ),
      },
      {
        accessorKey: "acknowledgedAt",
        header: "When",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatMoment(row.original.acknowledgedAt)}
          </span>
        ),
      },
      {
        accessorKey: "isCurrentVersion",
        header: "Still current",
        cell: ({ row }) => (
          <StatusBadge
            color={row.original.isCurrentVersion ? "green" : "amber"}
            label={row.original.isCurrentVersion ? "Up to date" : "Old version"}
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
        title="Policy acknowledgements"
        description="Who has confirmed reading which policy, and who is still on an older version."
        actions={<BackLink to="/hrms/policies/overview" label="Policies overview" />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Coverage</StatLabel>
          <StatValue>{summary?.coverageRate ?? 0}%</StatValue>
          <StatDescription className="space-y-1.5">
            <Progress value={summary?.coverageRate ?? 0} className="h-1.5" />
            <span>Across {summary?.policiesTracked ?? 0} tracked policies</span>
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Acknowledgements</StatLabel>
          <StatValue>{summary?.total ?? 0}</StatValue>
          <StatDescription>From {summary?.peopleAcknowledged ?? 0} people</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>On an old version</StatLabel>
          <StatValue>{summary?.outdatedCount ?? 0}</StatValue>
          <StatDescription>They need to read the update</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Still waiting</StatLabel>
          <StatValue>{summary?.pendingCount ?? 0}</StatValue>
          <StatDescription>People who have not acknowledged yet</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search by person or policy..."
        filters={tableFilters}
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
        mobileCard={(record) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {record.employee?.name || record.userName || "—"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {record.policy?.title ?? "—"}
                </p>
              </div>
              <StatusBadge
                color={record.isCurrentVersion ? "green" : "amber"}
                label={record.isCurrentVersion ? "Up to date" : "Old version"}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                v{record.version}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {formatMoment(record.acknowledgedAt)}
              </Badge>
            </div>
          </div>
        )}
      />
    </>
  );
}
