import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { MeetingRoom } from "@/types/domain/meetingRoom";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Users } from "lucide-react";

export interface MeetingRoomRowActionHandlers {
  onEdit: (room: MeetingRoom) => void;
  onDelete: (room: MeetingRoom) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function MeetingRoomRowActions({
  room,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: MeetingRoomRowActionHandlers & { room: MeetingRoom }) {
  return (
    <RowActions
      label={`Actions for ${room.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !canEdit,
          onSelect: () => onEdit(room),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !canDelete,
          onSelect: () => onDelete(room),
        },
      ]}
    />
  );
}

export const meetingRoomColumns = (
  rowActions: MeetingRoomRowActionHandlers
): ColumnDef<MeetingRoom>[] => [
  {
    accessorKey: "name",
    header: "Room",
    cell: ({ row }) => <ColorChip color={row.original.color} label={row.original.name} />,
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-xs uppercase">{row.original.code}</span>
    ),
  },
  {
    accessorKey: "floor",
    header: "Floor",
    cell: ({ row }) =>
      row.original.floor ? (
        <Badge variant="secondary" className="text-[10px]">
          {row.original.floor}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        {row.original.capacity} {row.original.capacity === 1 ? "person" : "people"}
      </span>
    ),
  },
  {
    accessorKey: "color",
    header: "Colour",
    cell: ({ row }) => (
      <span className="font-mono text-xs uppercase text-muted-foreground">
        {row.original.color}
      </span>
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
    cell: ({ row }) => <MeetingRoomRowActions room={row.original} {...rowActions} />,
  },
];
