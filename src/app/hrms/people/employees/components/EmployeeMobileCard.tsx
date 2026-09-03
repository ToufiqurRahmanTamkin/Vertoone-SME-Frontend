import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import {
  EMPLOYEE_STATUS_COLORS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from "@/constant";
import { formatDate } from "@/lib/date";
import type { Employee } from "@/types/domain/employee";
import { EmployeeRowActions, type EmployeeColumnActions } from "../employees.columns";

export function EmployeeMobileCard({
  employee,
  ...actions
}: EmployeeColumnActions & { employee: Employee }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{employee.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {employee.employeeCode}
            {employee.designations.length > 0
              ? ` · ${employee.designations.map((designation) => designation.name).join(", ")}`
              : ""}
          </p>
        </div>
        <StatusBadge
          color={EMPLOYEE_STATUS_COLORS[employee.status]}
          label={EMPLOYEE_STATUS_LABELS[employee.status]}
        />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="max-w-[60%] truncate font-medium">{employee.email}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Phone</dt>
          <dd className="font-medium">{employee.phone}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Departments</dt>
          <dd className="max-w-[60%] truncate font-medium">
            {employee.departments.map((department) => department.name).join(", ") || "—"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Type</dt>
          <dd className="font-medium">{EMPLOYMENT_TYPE_LABELS[employee.employmentType]}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Joined</dt>
          <dd className="font-medium">{formatDate(employee.joiningDate)}</dd>
        </div>
      </dl>

      {employee.tags.length > 0 && (
        <div className="mt-3">
          <TagList tags={employee.tags} max={4} />
        </div>
      )}

      <div className="mt-3 border-t pt-3">
        <EmployeeRowActions employee={employee} {...actions} />
      </div>
    </div>
  );
}
