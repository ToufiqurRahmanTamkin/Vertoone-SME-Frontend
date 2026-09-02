import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  CALENDAR_LOCATION_MODE_LABELS,
  CALENDAR_STATUS_COLORS,
  CALENDAR_STATUS_LABELS,
  MEETING_TYPE_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDateTime } from "@/lib/date";
import type { CalendarMeetingListItem } from "@/types/domain/calendarMeeting";
import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  MeetingRowActions,
  type MeetingRowActionHandlers,
} from "./components/MeetingRowActions";

export const meetingSeatsLabel = (meeting: CalendarMeetingListItem): string =>
  meeting.capacity === null
    ? `${meeting.seatsTaken} taken`
    : `${meeting.seatsTaken} of ${meeting.capacity}`;

export const meetingColumns = (
  handlers: MeetingRowActionHandlers
): ColumnDef<CalendarMeetingListItem>[] => [
  {
    accessorKey: "title",
    header: "Meeting",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-md border text-white"
          style={{ backgroundColor: row.original.accentColor }}
        >
          <Users className="size-4" />
        </span>
        <div className="min-w-0">
          <Link
            to={`/calendar/meetings/${row.original._id}/registrations`}
            className="block truncate text-sm font-semibold hover:underline"
          >
            {row.original.title}
          </Link>
          <span className="block truncate font-mono text-[11px] text-muted-foreground">
            {row.original.publicPath}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "startAt",
    header: "When",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="whitespace-nowrap text-sm">{formatDateTime(row.original.startAt)}</span>
        <span className="text-[11px] text-muted-foreground">
          {row.original.room?.name ||
            CALENDAR_LOCATION_MODE_LABELS[row.original.locationMode]}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "hostName",
    header: "Host",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="truncate text-sm">{row.original.hostName || "—"}</span>
        <Badge variant="secondary" className="mt-1 w-fit text-[10px]">
          {MEETING_TYPE_LABELS[row.original.meetingType]}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "registrationCount",
    header: "Attendees",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Link
          to={`/calendar/meetings/${row.original._id}/registrations`}
          className="text-sm font-semibold tabular-nums hover:underline"
        >
          {row.original.registrationCount}
        </Link>
        <span className="text-[11px] text-muted-foreground">
          {meetingSeatsLabel(row.original)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) =>
      row.original.isPaid ? (
        <span className="text-sm font-medium tabular-nums">
          {formatAmount(row.original.price, row.original.currency)}
        </span>
      ) : (
        <Badge variant="outline" className="text-[10px]">
          Free
        </Badge>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge
          color={CALENDAR_STATUS_COLORS[row.original.status]}
          label={CALENDAR_STATUS_LABELS[row.original.status]}
        />
        {row.original.status === "PUBLISHED" && !row.original.isRegistrationOpen && (
          <Badge variant="outline" className="text-[10px]">
            Closed
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <MeetingRowActions meeting={row.original} {...handlers} />,
  },
];
