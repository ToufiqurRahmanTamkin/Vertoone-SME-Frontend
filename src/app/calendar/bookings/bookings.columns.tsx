import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  CALENDAR_LOCATION_MODE_LABELS,
  CALENDAR_STATUS_COLORS,
  CALENDAR_STATUS_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import type { CalendarBookingListItem } from "@/types/domain/calendarBooking";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";
import {
  BookingRowActions,
  type BookingRowActionHandlers,
} from "./components/BookingRowActions";

export const openingsLabel = (booking: CalendarBookingListItem): string =>
  booking.availableDays === 0
    ? "No openings yet"
    : `${booking.availableDays} ${booking.availableDays === 1 ? "day" : "days"} · ${booking.weeklyHours}h a week`;

export const bookingColumns = (
  handlers: BookingRowActionHandlers
): ColumnDef<CalendarBookingListItem>[] => [
  {
    accessorKey: "title",
    header: "Booking page",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-md border text-white"
          style={{ backgroundColor: row.original.accentColor }}
        >
          <CalendarCheck className="size-4" />
        </span>
        <div className="min-w-0">
          <Link
            to={`/calendar/bookings/${row.original._id}/requests`}
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
    accessorKey: "durationMinutes",
    header: "Slot",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="whitespace-nowrap text-sm">{row.original.durationMinutes} min</span>
        <span className="text-[11px] text-muted-foreground">
          {row.original.capacityPerSlot === 1
            ? "One at a time"
            : `${row.original.capacityPerSlot} per slot`}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "weeklyHours",
    header: "Openings",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm">{openingsLabel(row.original)}</span>
        <span className="text-[11px] text-muted-foreground">
          {CALENDAR_LOCATION_MODE_LABELS[row.original.locationMode]}
          {row.original.venue ? ` · ${row.original.venue}` : ""}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "registrationCount",
    header: "Requests",
    cell: ({ row }) => (
      <Link
        to={`/calendar/bookings/${row.original._id}/requests`}
        className="text-sm font-semibold tabular-nums hover:underline"
      >
        {row.original.registrationCount}
      </Link>
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
    cell: ({ row }) => <BookingRowActions booking={row.original} {...handlers} />,
  },
];
