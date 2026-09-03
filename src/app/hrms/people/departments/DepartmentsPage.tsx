import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useGetAiAllowanceQuery } from "@/redux/apis/aiApis";
import {
  useDeleteDepartmentMutation,
  useGetDepartmentSummaryQuery,
  useGetDepartmentsQuery,
} from "@/redux/apis/departmentApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Department } from "@/types/domain/department";
import { Bot, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AiDepartmentsModal } from "./components/AiDepartmentsModal";
import { DepartmentFormModal } from "./components/DepartmentFormModal";
import { DepartmentRowActions, departmentColumns } from "./departments.columns";

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

export default function DepartmentsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/directory/departments");

  const { data, isLoading, isFetching } = useGetDepartmentsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetDepartmentSummaryQuery();

  const { data: ai } = useGetAiAllowanceQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [aiOpen, setAiOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Department | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Department | null>(null);
  const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (department: Department) => {
    setEditing(department);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteDepartment(pendingDelete._id).unwrap();
      toast.success("Department deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the department");
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

  const columns = React.useMemo(() => departmentColumns(rowActions), [rowActions]);

  const departments = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Departments"
        description="The groups employees are organised into. An employee can belong to more than one."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Departments</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Offered when assigning an employee</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Unassigned employees</StatLabel>
          <StatValue>{summary?.unassignedEmployeeCount ?? 0}</StatValue>
          <StatDescription>People not in any department yet</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search departments..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <>
              {ai?.isConfigured && (
                <ActionButton
                  icon={Bot}
                  label="Generate with AI"
                  variant="outline"
                  onClick={() => setAiOpen(true)}
                  disabled={isLimitReached}
                  title={
                    isLimitReached
                      ? `Your plan allows ${limit} departments. Delete one or upgrade to add more.`
                      : undefined
                  }
                />
              )}
              <ActionButton
                icon={Plus}
                label="New department"
                onClick={openCreate}
                disabled={isLimitReached}
                title={
                  isLimitReached
                    ? `Your plan allows ${limit} departments. Delete one or upgrade to add more.`
                    : undefined
                }
              />
            </>
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} departments your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={departments}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(department) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{department.name}</p>
                <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                  {department.code}
                </p>
              </div>
              <StatusBadge
                color={department.isActive ? "green" : "zinc"}
                label={department.isActive ? "Active" : "Inactive"}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Head</dt>
                <dd className="font-medium">{department.head?.name ?? "Unassigned"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Employees</dt>
                <dd className="font-medium">{department.employeeCount}</dd>
              </div>
            </dl>

            {department.description && (
              <p className="mt-3 text-xs text-muted-foreground">{department.description}</p>
            )}

            <div className="mt-3 border-t pt-3">
              <DepartmentRowActions department={department} {...rowActions} />
            </div>
          </div>
        )}
      />

      <DepartmentFormModal open={formOpen} onOpenChange={setFormOpen} department={editing} />

      <AiDepartmentsModal
        open={aiOpen}
        onOpenChange={setAiOpen}
        remaining={limit === null ? null : Math.max(0, limit - used)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="A department that still has employees in it cannot be deleted. Move them elsewhere first."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
