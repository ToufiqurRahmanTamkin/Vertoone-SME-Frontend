import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { EMPLOYEE_STATUS_LABELS, EMPLOYMENT_TYPE_LABELS, toOptions } from "@/constant";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteEmployeeMutation,
  useGetEmployeeSummaryQuery,
  useGetEmployeesQuery,
} from "@/redux/apis/employeeApis";
import { useGetDepartmentOptionsQuery } from "@/redux/apis/departmentApis";
import { useGetDesignationOptionsQuery } from "@/redux/apis/designationApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import type { Employee, EmployeeStatus, EmploymentType } from "@/types/domain/employee";
import { Plus, Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { EmployeeFormModal } from "./components/EmployeeFormModal";
import { EmployeeImportModal } from "./components/EmployeeImportModal";
import { EmployeeMobileCard } from "./components/EmployeeMobileCard";
import { employeeColumns } from "./employees.columns";

export default function EmployeesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/people/employees");

  const { data: tagOptions = [] } = useGetTagOptionsQuery({ scope: "EMPLOYEE" });
  const { data: departmentOptions = [] } = useGetDepartmentOptionsQuery();
  const { data: designationOptions = [] } = useGetDesignationOptionsQuery();

  const { data, isLoading, isFetching } = useGetEmployeesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as EmployeeStatus | undefined,
    employmentType: filters.employmentType as EmploymentType | undefined,
    departmentIds: filters.departmentIds as string | undefined,
    designationIds: filters.designationIds as string | undefined,
    tagIds: filters.tagIds as string | undefined,
  });

  const { data: summary } = useGetEmployeeSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Employee | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Employee | null>(null);
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: toOptions(EMPLOYEE_STATUS_LABELS),
      },
      {
        name: "employmentType",
        label: "Type",
        type: "select",
        options: toOptions(EMPLOYMENT_TYPE_LABELS),
      },
      {
        name: "departmentIds",
        label: "Department",
        type: "select",
        options: departmentOptions.map((department) => ({
          label: department.name,
          value: department._id,
        })),
      },
      {
        name: "designationIds",
        label: "Designation",
        type: "select",
        options: designationOptions.map((designation) => ({
          label: designation.name,
          value: designation._id,
        })),
      },
      {
        name: "tagIds",
        label: "Tag",
        type: "select",
        options: tagOptions.map((tag) => ({ label: tag.name, value: tag._id })),
      },
    ],
    [departmentOptions, designationOptions, tagOptions]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEditing(employee);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteEmployee(pendingDelete._id).unwrap();
      toast.success("Employee removed");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the employee");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () =>
      employeeColumns({
        onEdit: openEdit,
        onDelete: setPendingDelete,
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const employees = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Employees"
        description="Everyone on your payroll, with their contact, job and payroll details."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Employees</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Currently working</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>On leave</StatLabel>
          <StatValue>{summary?.onLeaveCount ?? 0}</StatValue>
          <StatDescription>Away but still employed</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search name, email, phone or ID..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <>
              <ActionButton
                icon={Upload}
                label="Import"
                variant="outline"
                onClick={() => setImportOpen(true)}
                disabled={isLimitReached}
                title={
                  isLimitReached
                    ? `Your plan allows ${limit} employees. Remove one or upgrade to add more.`
                    : "Create many employees from a spreadsheet"
                }
              />
              <ActionButton
                icon={Plus}
                label="Add employee"
                onClick={openCreate}
                disabled={isLimitReached}
                title={
                  isLimitReached
                    ? `Your plan allows ${limit} employees. Remove one or upgrade to add more.`
                    : undefined
                }
              />
            </>
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} employee records your plan allows. Remove one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={employees}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(employee) => (
          <EmployeeMobileCard
            employee={employee}
            onEdit={openEdit}
            onDelete={setPendingDelete}
            canEdit={access.canEdit}
            canDelete={access.canDelete}
          />
        )}
      />

      <EmployeeFormModal open={formOpen} onOpenChange={setFormOpen} employee={editing} />

      <EmployeeImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        departments={departmentOptions}
        designations={designationOptions}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.fullName ?? ""}"?`}
        description="The record is archived, not erased. An employee who leads or supervises a team cannot be removed until that team gets someone else."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
