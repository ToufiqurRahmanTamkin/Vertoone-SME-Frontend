import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { EMPLOYMENT_TYPE_LABELS, toOptions } from "@/constant";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount } from "@/lib/amount";
import { useGetDepartmentOptionsQuery } from "@/redux/apis/departmentApis";
import { useGetEmployeesQuery } from "@/redux/apis/employeeApis";
import { useDeleteEmployeeSalaryMutation } from "@/redux/apis/employeeSalaryApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Employee, EmploymentType } from "@/types/domain/employee";
import type { EmployeeSalaryRecord } from "@/types/domain/employeeSalary";
import type { ColumnDef } from "@tanstack/react-table";
import { Wallet } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { SalaryFormModal } from "./components/SalaryFormModal";
import { SalaryHistory } from "./components/SalaryHistory";

const initialsOf = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

export default function SalariesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/payroll/salaries");

  const { data: departmentOptions = [] } = useGetDepartmentOptionsQuery();

  const { data, isLoading, isFetching } = useGetEmployeesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    employmentType: filters.employmentType as EmploymentType | undefined,
    departmentIds: filters.departmentIds as string | undefined,
  });

  const [editing, setEditing] = React.useState<Employee | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<EmployeeSalaryRecord | null>(null);
  const [deleteSalary, { isLoading: isDeleting }] = useDeleteEmployeeSalaryMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
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
    ],
    [departmentOptions]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteSalary(pendingDelete._id).unwrap();
      toast.success("Salary record removed");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the record");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Employee",
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="size-8 border">
                {employee.photoUrl && (
                  <AvatarImage src={employee.photoUrl} alt="" className="object-cover" />
                )}
                <AvatarFallback className="bg-muted text-[10px] font-semibold uppercase">
                  {initialsOf(employee.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{employee.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{employee.employeeCode}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "designations",
        header: "Designation",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.designations.map((designation) => designation.name).join(", ") || "—"}
          </span>
        ),
      },
      {
        id: "salary",
        header: "Current salary",
        cell: ({ row }) => {
          const { salary } = row.original;
          return salary?.amount ? (
            <span className="font-medium">{formatAmount(salary.amount, salary.currency)}</span>
          ) : (
            <span className="text-muted-foreground">Not set</span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          access.canCreate && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={(event) => {
                event.stopPropagation();
                setEditing(row.original);
              }}
            >
              <Wallet className="size-3.5" />
              {row.original.salary?.amount ? "Revise" : "Set salary"}
            </Button>
          ),
      },
    ],
    [access.canCreate]
  );

  const employees = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Salaries"
        description="What each employee is paid today, and every revision that got them there. Open a row to see the history."
      />

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search name, email, phone or ID..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
      />

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
        expandableContent={(employee) => (
          <SalaryHistory
            employeeId={employee._id}
            canDelete={access.canDelete}
            onDelete={setPendingDelete}
          />
        )}
      />

      <SalaryFormModal
        open={Boolean(editing)}
        onOpenChange={(next) => !next && setEditing(null)}
        employee={editing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this salary record?"
        description="The employee's current salary falls back to the most recent record that remains."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
