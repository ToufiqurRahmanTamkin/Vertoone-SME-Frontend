import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  CALENDAR_LOCATION_MODE_LABELS,
  CALENDAR_STATUS_COLORS,
  CALENDAR_STATUS_LABELS,
  EVENT_CATEGORY_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDateTime } from "@/lib/date";
import type { CalendarEventListItem } from "@/types/domain/calendarEvent";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import { EventRowActions, type EventRowActionHandlers } from "./components/EventRowActions";

export const seatsLabel = (event: CalendarEventListItem): string =>
  event.capacity === null
    ? `${event.seatsTaken} taken`
    : `${event.seatsTaken} of ${event.capacity}`;

export const eventColumns = (
  handlers: EventRowActionHandlers
): ColumnDef<CalendarEventListItem>[] => [
  {
    accessorKey: "title",
    header: "Event",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-md border text-white"
          style={{ backgroundColor: row.original.accentColor }}
        >
          <CalendarClock className="size-4" />
        </span>
        <div className="min-w-0">
          <Link
            to={`/company/calendar/events/${row.original._id}/registrations`}
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
          {CALENDAR_LOCATION_MODE_LABELS[row.original.locationMode]}
          {row.original.venue ? ` · ${row.original.venue}` : ""}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {EVENT_CATEGORY_LABELS[row.original.category]}
      </Badge>
    ),
  },
  {
    accessorKey: "registrationCount",
    header: "Registrations",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Link
          to={`/company/calendar/events/${row.original._id}/registrations`}
          className="text-sm font-semibold tabular-nums hover:underline"
        >
          {row.original.registrationCount}
        </Link>
        <span className="text-[11px] text-muted-foreground">{seatsLabel(row.original)}</span>
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
    cell: ({ row }) => <EventRowActions event={row.original} {...handlers} />,
  },
];
