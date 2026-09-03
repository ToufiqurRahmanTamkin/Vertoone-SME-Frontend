import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteEmployeeRoleMutation,
  useGetEmployeeRoleSummaryQuery,
  useGetEmployeeRolesQuery,
} from "@/redux/apis/employeeRoleApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { EmployeeRole } from "@/types/domain/employeeRole";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AssignEmployeesDialog } from "./components/AssignEmployeesDialog";
import { EmployeeRoleFormModal } from "./components/EmployeeRoleFormModal";
import { EmployeeRoleRowActions, employeeRoleColumns } from "./employeeRoles.columns";

const FILTERS: FilterConfig[] = [
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

const describeAllowance = (used: number, limit: number | null): string =>
  limit === null
    ? `${used} in use · unlimited on your plan`
    : `${used} of ${limit} allowed by your plan`;

export default function EmployeeRolesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/settings/employee-roles-and-permissions");

  const { data, isLoading, isFetching } = useGetEmployeeRolesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetEmployeeRoleSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EmployeeRole | null>(null);
  const [assigning, setAssigning] = React.useState<EmployeeRole | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<EmployeeRole | null>(null);
  const [deleteEmployeeRole, { isLoading: isDeleting }] = useDeleteEmployeeRoleMutation();

  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: (role: EmployeeRole) => {
        setEditing(role);
        setFormOpen(true);
      },
      onAssign: setAssigning,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => employeeRoleColumns(rowActions), [rowActions]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteEmployeeRole(pendingDelete._id).unwrap();
      toast.success("Employee role removed");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the employee role");
    } finally {
      setPendingDelete(null);
    }
  };

  const roles = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Employee roles & permissions"
        description="Permission sets built for your workforce. Create a role, tick what it opens, then assign it to the employees who need it."
        actions={<BackLink to="/hrms/settings/overview" label="All settings" />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Employee roles</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>{describeAllowance(used, limit)}</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Granting access right now</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Employees with a role</StatLabel>
          <StatValue>{summary?.assignedEmployeeCount ?? 0}</StatValue>
          <StatDescription>Holding at least one employee role</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Without a role</StatLabel>
          <StatValue>{summary?.unassignedEmployeeCount ?? 0}</StatValue>
          <StatDescription>They reach only their own records</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search employee roles..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New employee role"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} employee roles. Remove one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} employee roles your plan allows. Remove one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
        getRowId={(row) => row._id}
        mobileCard={(role) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{role.name}</p>
                <p className="truncate text-xs text-muted-foreground">{role.description || "—"}</p>
              </div>
              <StatusBadge
                color={role.isActive ? "green" : "zinc"}
                label={role.isActive ? "Active" : "Inactive"}
              />
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {role.moduleCount} menus
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {role.employeeCount} employees
              </Badge>
            </div>

            <div className="mt-3 border-t pt-3">
              <EmployeeRoleRowActions role={role} {...rowActions} />
            </div>
          </div>
        )}
      />

      <EmployeeRoleFormModal open={formOpen} onOpenChange={setFormOpen} role={editing} />

      <AssignEmployeesDialog
        open={Boolean(assigning)}
        onOpenChange={(open) => !open && setAssigning(null)}
        role={assigning}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.name ?? ""}"?`}
        description={
          pendingDelete && pendingDelete.employeeCount > 0
            ? `${pendingDelete.employeeCount} employee${
                pendingDelete.employeeCount === 1 ? "" : "s"
              } lose the access this role granted, immediately.`
            : "This role is not assigned to anybody, so nothing changes for your people."
        }
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
