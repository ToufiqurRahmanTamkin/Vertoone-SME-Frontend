import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Designation } from "@/types/domain/designation";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

interface DesignationColumnActions {
  onEdit: (designation: Designation) => void;
  onDelete: (designation: Designation) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const designationColumns = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: DesignationColumnActions): ColumnDef<Designation>[] => [
  {
    accessorKey: "name",
    header: "Designation",
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
      <span className="font-mono text-xs uppercase text-muted-foreground">
        {row.original.code}
      </span>
    ),
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original.level || "—"}</span>
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
          disabled={!canDelete}
          aria-label={`Delete ${row.original.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
