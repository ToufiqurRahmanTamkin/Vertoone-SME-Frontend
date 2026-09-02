import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CalendarEventListItem } from "@/types/domain/calendarEvent";
import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface EventRowActionHandlers {
  onEdit: (event: CalendarEventListItem) => void;
  onTogglePublished: (event: CalendarEventListItem) => void;
  onDuplicate: (event: CalendarEventListItem) => void;
  onShare: (event: CalendarEventListItem) => void;
  onDelete: (event: CalendarEventListItem) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface EventRowActionsProps extends EventRowActionHandlers {
  event: CalendarEventListItem;
}

export function EventRowActions({
  event,
  onEdit,
  onTogglePublished,
  onDuplicate,
  onShare,
  onDelete,
  canCreate,
  canEdit,
  canDelete,
}: EventRowActionsProps) {
  const navigate = useNavigate();
  const isLive = event.status === "PUBLISHED";

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/calendar/events/${event._id}/registrations`)}
      >
        <Users className="size-3.5" />
        Registrations
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`More actions for ${event.title}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem disabled={!canEdit} onClick={() => onEdit(event)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canEdit} onClick={() => onTogglePublished(event)}>
            <Power />
            {isLive ? "Take offline" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onShare(event)}>
            <ExternalLink />
            Copy public link
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canCreate} onClick={() => onDuplicate(event)}>
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={!canDelete}
            onClick={() => onDelete(event)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
