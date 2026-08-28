import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Team } from "@/types/domain/team";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

interface TeamColumnActions {
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const teamColumns = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: TeamColumnActions): ColumnDef<Team>[] => [
  {
    accessorKey: "name",
    header: "Team",
    cell: ({ row }) => {
      const team = row.original;
      return (
        <div className="min-w-0">
          <ColorChip color={team.color} label={team.name} />
          {team.description && (
            <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
              {team.description}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => <span className="text-sm">{row.original.department || "—"}</span>,
  },
  {
    id: "teamLead",
    header: "Team lead",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{row.original.teamLead?.name ?? "—"}</p>
        {row.original.teamLead?.designation && (
          <p className="truncate text-xs text-muted-foreground">
            {row.original.teamLead.designation}
          </p>
        )}
      </div>
    ),
  },
  {
    id: "supervisor",
    header: "Supervisor",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{row.original.supervisor?.name ?? "—"}</p>
        {row.original.supervisor?.designation && (
          <p className="truncate text-xs text-muted-foreground">
            {row.original.supervisor.designation}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "memberCount",
    header: "Members",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {row.original.memberCount} member{row.original.memberCount === 1 ? "" : "s"}
      </Badge>
    ),
  },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) => <TagList tags={row.original.tags ?? []} />,
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
