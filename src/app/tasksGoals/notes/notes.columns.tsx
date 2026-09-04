import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { formatDateTime } from "@/lib/date";
import {
  NOTE_VISIBILITY_COLORS,
  NOTE_VISIBILITY_SHORT_LABELS,
  type Note,
} from "@/types/domain/note";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Pin, PinOff, Share2, Trash2 } from "lucide-react";

export interface NoteColumnActions {
  onOpen: (note: Note) => void;
  onEdit: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onShare: (note: Note) => void;
  onDelete: (note: Note) => void;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
}

export function NoteRowActions({
  note,
  ...actions
}: NoteColumnActions & { note: Note }) {
  return (
    <RowActions
      label={`Actions for ${note.title}`}
      actions={[
        {
          key: "pin",
          label: note.isPinned ? "Unpin" : "Pin",
          icon: note.isPinned ? PinOff : Pin,
          disabled: !actions.canEdit,
          onSelect: () => actions.onTogglePin(note),
        },
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(note),
        },
        {
          key: "share",
          label: "Share with someone",
          icon: Share2,
          disabled: !actions.canShare,
          onSelect: () => actions.onShare(note),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(note),
        },
      ]}
    />
  );
}

export const noteColumns = (
  rowActions: NoteColumnActions
): ColumnDef<Note>[] => [
  {
    accessorKey: "title",
    header: "Note",
    cell: ({ row }) => (
      <button
        type="button"
        className="min-w-0 cursor-pointer text-left"
        onClick={() => rowActions.onOpen(row.original)}
      >
        <span className="flex items-center gap-1.5">
          {row.original.isPinned && (
            <Pin className="size-3 shrink-0 text-amber-500" aria-label="Pinned" />
          )}
          <ColorChip color={row.original.color} label={row.original.title} />
        </span>
        <p className="mt-1 line-clamp-2 max-w-md text-xs text-muted-foreground">
          {row.original.excerpt || "Empty note"}
        </p>
      </button>
    ),
  },
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.owner?.name || "Unassigned"}</span>
    ),
  },
  {
    id: "board",
    header: "Board",
    cell: ({ row }) =>
      row.original.board ? (
        <ColorChip color={row.original.board.color} label={row.original.board.name} />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) => <TagList tags={row.original.tags} />,
  },
  {
    id: "visibility",
    header: "Visible to",
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <StatusBadge
          color={NOTE_VISIBILITY_COLORS[row.original.visibility]}
          label={NOTE_VISIBILITY_SHORT_LABELS[row.original.visibility]}
        />
        {row.original.visibility === "SHARED" && (
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {row.original.sharedWith.length} people
          </span>
        )}
      </div>
    ),
  },
  {
    id: "reminder",
    header: "Reminder",
    cell: ({ row }) => {
      if (!row.original.reminderAt) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }

      return (
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs">{formatDateTime(row.original.reminderAt)}</span>
          {row.original.isReminderDue && <StatusBadge color="red" label="Due" />}
          {row.original.isReminderSoon && <StatusBadge color="amber" label="Soon" />}
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last edited",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDateTime(row.original.updatedAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <NoteRowActions note={row.original} {...rowActions} />,
  },
];
