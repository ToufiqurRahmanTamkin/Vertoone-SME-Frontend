import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import { totalAssignments, type Role } from "@/types/domain/role";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface RoleColumnActions {
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function RoleRowActions({
  role,
  ...actions
}: RoleColumnActions & { role: Role }) {
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
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete || totalAssignments(role.assignments) > 0,
          title: totalAssignments(role.assignments) > 0
            ? "Unassign this role everywhere before deleting it"
            : undefined,
          onSelect: () => actions.onDelete(role),
        },
      ]}
    />
  );
}

export const roleColumns = (
  rowActions: RoleColumnActions
): ColumnDef<Role>[] => [
  {
    accessorKey: "name",
    header: "Role",
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
    id: "assignments",
    header: "Assigned to",
    cell: ({ row }) => {
      const { users, departments, designations, teams } = row.original.assignments;
      const parts = [
        users && `${users} user${users === 1 ? "" : "s"}`,
        departments && `${departments} dept${departments === 1 ? "" : "s"}`,
        designations && `${designations} designation${designations === 1 ? "" : "s"}`,
        teams && `${teams} team${teams === 1 ? "" : "s"}`,
      ].filter(Boolean);

      return (
        <span className="text-xs text-muted-foreground">
          {parts.length > 0 ? parts.join(" · ") : "Not assigned yet"}
        </span>
      );
    },
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
    cell: ({ row }) => <RoleRowActions role={row.original} {...rowActions} />,
  },
];
