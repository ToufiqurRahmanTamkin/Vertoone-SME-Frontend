import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useGetEmployeeAccessSourcesQuery,
  useGetEmployeeAccessSummaryQuery,
  useUpdateEmployeeAccessRolesMutation,
} from "@/redux/apis/employeeAccessApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  EMPLOYEE_ACCESS_SOURCE_COLORS,
  EMPLOYEE_ACCESS_SOURCE_LABELS,
  type EmployeeAccessSource,
  type EmployeeAccessSourceType,
} from "@/types/domain/employeeAccess";
import { ArrowRight } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  EmployeeAccessRowMenu,
  EmployeeAccessRoles,
  employeeAccessColumns,
} from "./employeeAccess.columns";
import { SourceRolesDialog } from "./components/SourceRolesDialog";

const FILTERS: FilterConfig[] = [
  {
    name: "type",
    label: "Kind",
    type: "select",
    options: [
      { label: "Departments", value: "DEPARTMENT" },
      { label: "Designations", value: "DESIGNATION" },
      { label: "Teams", value: "TEAM" },
    ],
  },
  {
    name: "hasRoles",
    label: "Roles",
    type: "select",
    options: [
      { label: "Has roles", value: "true" },
      { label: "No roles", value: "false" },
    ],
  },
];

export default function EmployeeRolesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/settings/employee-roles-and-permissions");

  const { data, isLoading, isFetching } = useGetEmployeeAccessSourcesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    type: filters.type as EmployeeAccessSourceType | undefined,
    hasRoles: filters.hasRoles === undefined ? undefined : filters.hasRoles === "true",
  });

  const { data: summary } = useGetEmployeeAccessSummaryQuery();

  const [managing, setManaging] = React.useState<EmployeeAccessSource | null>(null);
  const [pendingClear, setPendingClear] = React.useState<EmployeeAccessSource | null>(null);
  const [updateRoles, { isLoading: isClearing }] = useUpdateEmployeeAccessRolesMutation();

  const rowActions = React.useMemo(
    () => ({
      onManage: setManaging,
      onClear: setPendingClear,
      canEdit: access.canEdit,
    }),
    [access.canEdit]
  );

  const columns = React.useMemo(() => employeeAccessColumns(rowActions), [rowActions]);

  const confirmClear = async () => {
    if (!pendingClear) return;
    try {
      await updateRoles({
        type: pendingClear.type,
        id: pendingClear._id,
        roleIds: [],
      }).unwrap();
      toast.success(`Roles removed from ${pendingClear.name}`);
      setPendingClear(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the roles");
    }
  };

  const sources = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Employee roles & permissions"
        description="Where your people's access comes from: the roles a department, designation or team hands to everybody inside it."
        actions={<BackLink to="/hrms/settings/overview" label="All settings" />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Employees</StatLabel>
          <StatValue>{summary?.employees ?? 0}</StatValue>
          <StatDescription>
            {summary?.employeesWithAccount ?? 0} of them can sign in
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Accounts with access</StatLabel>
          <StatValue>{summary?.accountsWithAccess ?? 0}</StatValue>
          <StatDescription>
            {summary?.accountsWithoutAccess ?? 0} reach nothing beyond their own records
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Roles in use</StatLabel>
          <StatValue>{summary?.rolesInUse ?? 0}</StatValue>
          <StatDescription>Of {summary?.totalRoles ?? 0} roles defined</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Personal grants</StatLabel>
          <StatValue>{summary?.directGrants ?? 0}</StatValue>
          <StatDescription>Accounts holding a role of their own</StatDescription>
        </Stat>
      </StatGrid>

      <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-sm text-muted-foreground">
          Roles themselves — the menus each one opens — are defined once under Roles &amp;
          Permissions. Here you decide who inherits them.
        </p>
        <Button variant="outline" size="sm" className="shrink-0 cursor-pointer" asChild>
          <Link to="/settings/users-and-roles/roles-and-permissions">
            Manage roles
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search departments, designations and teams..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
      />

      <DataTable
        columns={columns}
        data={sources}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => `${row.type}-${row._id}`}
        mobileCard={(source) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{source.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {source.description || "No description"}
                </p>
              </div>
              <StatusBadge
                color={EMPLOYEE_ACCESS_SOURCE_COLORS[source.type]}
                label={EMPLOYEE_ACCESS_SOURCE_LABELS[source.type]}
              />
            </div>

            <div className="mt-3">
              <EmployeeAccessRoles source={source} />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Menus granted</dt>
                <dd className="font-medium">{source.moduleCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Employees reached</dt>
                <dd className="font-medium">{source.employeeCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium">{source.isActive ? "Active" : "Inactive"}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <EmployeeAccessRowMenu source={source} actions={rowActions} />
            </div>
          </div>
        )}
      />

      <SourceRolesDialog
        open={Boolean(managing)}
        onOpenChange={(open) => !open && setManaging(null)}
        source={managing}
      />

      <ConfirmDialog
        open={Boolean(pendingClear)}
        onOpenChange={(open) => !open && setPendingClear(null)}
        title={`Remove every role from "${pendingClear?.name ?? ""}"?`}
        description="Everybody who only had access through this source loses it as soon as you confirm. Anything granted to them personally stays."
        confirmText="Remove roles"
        variant="destructive"
        isLoading={isClearing}
        onConfirm={confirmClear}
      />
    </>
  );
}
