import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import { totalAssignments, type Role } from "@/types/domain/role";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

interface RoleColumnActions {
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const roleColumns = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: RoleColumnActions): ColumnDef<Role>[] => [
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
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => onEdit(row.original)}
          disabled={!canEdit}
          aria-label={`Edit ${row.original.name}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
          onClick={() => onDelete(row.original)}
          disabled={!canDelete || totalAssignments(row.original.assignments) > 0}
          aria-label={`Delete ${row.original.name}`}
          title={
            totalAssignments(row.original.assignments) > 0
              ? "Unassign this role everywhere before deleting it"
              : undefined
          }
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
