import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CalendarBookingListItem } from "@/types/domain/calendarBooking";
import {
  CalendarCheck,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface BookingRowActionHandlers {
  onEdit: (booking: CalendarBookingListItem) => void;
  onTogglePublished: (booking: CalendarBookingListItem) => void;
  onDuplicate: (booking: CalendarBookingListItem) => void;
  onShare: (booking: CalendarBookingListItem) => void;
  onDelete: (booking: CalendarBookingListItem) => void;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface BookingRowActionsProps extends BookingRowActionHandlers {
  booking: CalendarBookingListItem;
}

export function BookingRowActions({
  booking,
  onEdit,
  onTogglePublished,
  onDuplicate,
  onShare,
  onDelete,
  canCreate,
  canEdit,
  canDelete,
}: BookingRowActionsProps) {
  const navigate = useNavigate();
  const isLive = booking.status === "PUBLISHED";

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/company/calendar/bookings/${booking._id}/requests`)}
      >
        <CalendarCheck className="size-3.5" />
        Requests
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`More actions for ${booking.title}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem disabled={!canEdit} onClick={() => onEdit(booking)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canEdit} onClick={() => onTogglePublished(booking)}>
            <Power />
            {isLive ? "Take offline" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onShare(booking)}>
            <ExternalLink />
            Copy public link
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canCreate} onClick={() => onDuplicate(booking)}>
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={!canDelete}
            onClick={() => onDelete(booking)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
