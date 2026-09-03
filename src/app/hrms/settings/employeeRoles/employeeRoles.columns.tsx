import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import type { EmployeeRole } from "@/types/domain/employeeRole";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, UsersRound } from "lucide-react";

export interface EmployeeRoleColumnActions {
  onEdit: (role: EmployeeRole) => void;
  onAssign: (role: EmployeeRole) => void;
  onDelete: (role: EmployeeRole) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function EmployeeRoleRowActions({
  role,
  ...actions
}: EmployeeRoleColumnActions & { role: EmployeeRole }) {
  return (
    <RowActions
      label={`Actions for ${role.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(role),
        },
        {
          key: "assign",
          label: "Assign to employees",
          icon: UsersRound,
          disabled: !actions.canEdit,
          onSelect: () => actions.onAssign(role),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          title:
            role.employeeCount > 0
              ? `${role.employeeCount} employee${
                  role.employeeCount === 1 ? "" : "s"
                } will lose the access this role grants`
              : undefined,
          onSelect: () => actions.onDelete(role),
        },
      ]}
    />
  );
}

export const employeeRoleColumns = (
  rowActions: EmployeeRoleColumnActions
): ColumnDef<EmployeeRole>[] => [
  {
    accessorKey: "name",
    header: "Employee role",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.description || "—"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "moduleCount",
    header: "Menus",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {row.original.moduleCount} granted
      </Badge>
    ),
  },
  {
    accessorKey: "employeeCount",
    header: "Employees",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.employeeCount > 0
          ? `${row.original.employeeCount} assigned`
          : "Not assigned yet"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={row.original.isActive ? "green" : "zinc"}
        label={row.original.isActive ? "Active" : "Inactive"}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <EmployeeRoleRowActions role={row.original} {...rowActions} />,
  },
];
