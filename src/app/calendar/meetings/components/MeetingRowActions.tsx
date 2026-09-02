import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CalendarMeetingListItem } from "@/types/domain/calendarMeeting";
import { Copy, ExternalLink, MoreHorizontal, Pencil, Power, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface MeetingRowActionHandlers {
  onEdit: (meeting: CalendarMeetingListItem) => void;
  onTogglePublished: (meeting: CalendarMeetingListItem) => void;
  onDuplicate: (meeting: CalendarMeetingListItem) => void;
  onShare: (meeting: CalendarMeetingListItem) => void;
  onDelete: (meeting: CalendarMeetingListItem) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface MeetingRowActionsProps extends MeetingRowActionHandlers {
  meeting: CalendarMeetingListItem;
}

export function MeetingRowActions({
  meeting,
  onEdit,
  onTogglePublished,
  onDuplicate,
  onShare,
  onDelete,
  canCreate,
  canEdit,
  canDelete,
}: MeetingRowActionsProps) {
  const navigate = useNavigate();
  const isLive = meeting.status === "PUBLISHED";

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/calendar/meetings/${meeting._id}/registrations`)}
      >
        <Users className="size-3.5" />
        Attendees
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`More actions for ${meeting.title}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem disabled={!canEdit} onClick={() => onEdit(meeting)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canEdit} onClick={() => onTogglePublished(meeting)}>
            <Power />
            {isLive ? "Take offline" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onShare(meeting)}>
            <ExternalLink />
            Copy public link
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canCreate} onClick={() => onDuplicate(meeting)}>
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={!canDelete}
            onClick={() => onDelete(meeting)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
