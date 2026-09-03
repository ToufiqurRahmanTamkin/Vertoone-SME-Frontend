import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { Designation } from "@/types/domain/designation";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface DesignationColumnActions {
  onEdit: (designation: Designation) => void;
  onDelete: (designation: Designation) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function DesignationRowActions({
  designation,
  ...actions
}: DesignationColumnActions & { designation: Designation }) {
  return (
    <RowActions
      label={`Actions for ${designation.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(designation),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(designation),
        },
      ]}
    />
  );
}

export const designationColumns = (
  rowActions: DesignationColumnActions
): ColumnDef<Designation>[] => [
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
    cell: ({ row }) => <DesignationRowActions designation={row.original} {...rowActions} />,
  },
];
