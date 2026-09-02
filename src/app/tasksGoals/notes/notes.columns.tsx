import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/date";
import {
  NOTE_VISIBILITY_COLORS,
  NOTE_VISIBILITY_SHORT_LABELS,
  type Note,
} from "@/types/domain/note";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Pin, PinOff, Trash2 } from "lucide-react";

interface NoteColumnActions {
  onOpen: (note: Note) => void;
  onEdit: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onDelete: (note: Note) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const noteColumns = ({
  onOpen,
  onEdit,
  onTogglePin,
  onDelete,
  canEdit,
  canDelete,
}: NoteColumnActions): ColumnDef<Note>[] => [
  {
    accessorKey: "title",
    header: "Note",
    cell: ({ row }) => (
      <button
        type="button"
        className="min-w-0 cursor-pointer text-left"
        onClick={() => onOpen(row.original)}
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
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => onTogglePin(row.original)}
          disabled={!canEdit}
          aria-label={row.original.isPinned ? `Unpin ${row.original.title}` : `Pin ${row.original.title}`}
        >
          {row.original.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => onEdit(row.original)}
          disabled={!canEdit}
          aria-label={`Edit ${row.original.title}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
          onClick={() => onDelete(row.original)}
          disabled={!canDelete}
          aria-label={`Delete ${row.original.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
