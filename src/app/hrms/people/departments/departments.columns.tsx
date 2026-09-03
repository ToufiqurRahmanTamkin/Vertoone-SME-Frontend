import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { Department } from "@/types/domain/department";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface DepartmentColumnActions {
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function DepartmentRowActions({
  department,
  ...actions
}: DepartmentColumnActions & { department: Department }) {
  return (
    <RowActions
      label={`Actions for ${department.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(department),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(department),
        },
      ]}
    />
  );
}

export const departmentColumns = (
  rowActions: DepartmentColumnActions
): ColumnDef<Department>[] => [
  {
    accessorKey: "name",
    header: "Department",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        {row.original.description && (
          <p className="max-w-xs truncate text-xs text-muted-foreground">
            {row.original.description}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-xs uppercase text-muted-foreground">{row.original.code}</span>
    ),
  },
  {
    id: "head",
    header: "Head",
    cell: ({ row }) =>
      row.original.head ? (
        <span className="text-sm">{row.original.head.name}</span>
      ) : (
        <span className="text-sm text-muted-foreground">Unassigned</span>
      ),
  },
  {
    accessorKey: "employeeCount",
    header: "Employees",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {row.original.employeeCount}
      </Badge>
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
    cell: ({ row }) => <DepartmentRowActions department={row.original} {...rowActions} />,
  },
];
