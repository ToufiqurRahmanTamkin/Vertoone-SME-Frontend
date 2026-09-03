import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  EMPLOYEE_STATUS_COLORS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import type { Employee } from "@/types/domain/employee";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

const namesOf = (items: { name: string }[]): string =>
  items.map((item) => item.name).join(", ");

const initialsOf = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

export interface EmployeeColumnActions {
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function EmployeeRowActions({
  employee,
  ...actions
}: EmployeeColumnActions & { employee: Employee }) {
  return (
    <RowActions
      label={`Actions for ${employee.fullName}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(employee),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(employee),
        },
      ]}
    />
  );
}

export const employeeColumns = (
  rowActions: EmployeeColumnActions
): ColumnDef<Employee>[] => [
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
            <p className="truncate text-xs text-muted-foreground">
              {employee.employeeCode}
              {employee.designations.length > 0 ? ` · ${namesOf(employee.designations)}` : ""}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Contact",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{row.original.email}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.phone}</p>
      </div>
    ),
  },
  {
    id: "departments",
    header: "Departments",
    cell: ({ row }) => {
      const departments = row.original.departments ?? [];
      return departments.length === 0 ? (
        <span className="text-xs text-muted-foreground">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {departments.slice(0, 2).map((department) => (
            <Badge key={department._id} variant="secondary" className="text-[10px]">
              {department.name}
            </Badge>
          ))}
          {departments.length > 2 && (
            <span
              className="text-xs text-muted-foreground"
              title={namesOf(departments)}
            >
              +{departments.length - 2}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "employmentType",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-sm">{EMPLOYMENT_TYPE_LABELS[row.original.employmentType]}</span>
    ),
  },
  {
    accessorKey: "joiningDate",
    header: "Joined",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.original.joiningDate)}</span>
    ),
  },
  {
    id: "salary",
    header: "Salary",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.salary?.amount
          ? formatAmount(row.original.salary.amount, row.original.salary.currency)
          : "—"}
      </span>
    ),
  },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) => <TagList tags={row.original.tags ?? []} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={EMPLOYEE_STATUS_COLORS[row.original.status]}
        label={EMPLOYEE_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <EmployeeRowActions employee={row.original} {...rowActions} />,
  },
];
