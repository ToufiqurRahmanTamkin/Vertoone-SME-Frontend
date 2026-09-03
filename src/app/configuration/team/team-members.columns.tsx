import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { USER_STATUS_COLORS, USER_STATUS_LABELS } from "@/constant";
import { formatDate } from "@/lib/date";
import type { TeamMember } from "@/types/domain/teamMember";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface TeamMemberColumnActions {
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const grantedCount = (member: TeamMember): number =>
  Object.values(member.effectivePermissions).filter((permission) => permission.canView).length;

export function TeamMemberRowActions({
  member,
  ...actions
}: TeamMemberColumnActions & { member: TeamMember }) {
  return (
    <RowActions
      label={`Actions for ${member.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(member),
        },
        {
          key: "delete",
          label: "Remove",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(member),
        },
      ]}
    />
  );
}

export const teamMemberColumns = (
  rowActions: TeamMemberColumnActions
): ColumnDef<TeamMember>[] => [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.phone || "—"}</span>
    ),
  },
  {
    id: "access",
    header: "Menu access",
    cell: ({ row }) => {
      const count = grantedCount(row.original);
      return count === 0 ? (
        <Badge variant="outline" className="text-[10px]">
          No menus
        </Badge>
      ) : (
        <Badge variant="secondary" className="text-[10px]">
          {count} menu{count === 1 ? "" : "s"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last sign-in",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.lastLoginAt ? formatDate(row.original.lastLoginAt) : "Never"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={USER_STATUS_COLORS[row.original.status]}
        label={USER_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <TeamMemberRowActions member={row.original} {...rowActions} />,
  },
];
