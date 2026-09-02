import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { CALENDAR_STATUS_COLORS, CALENDAR_STATUS_LABELS, toOptions } from "@/constant";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount } from "@/lib/amount";
import {
  useDeleteCalendarBookingMutation,
  useDuplicateCalendarBookingMutation,
  useGetCalendarBookingQuery,
  useGetCalendarBookingsQuery,
  useGetCalendarBookingSummaryQuery,
  useUpdateCalendarBookingMutation,
} from "@/redux/apis/calendarBookingApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { CalendarStatus } from "@/types/domain/calendar";
import type { CalendarBookingListItem } from "@/types/domain/calendarBooking";
import { CalendarCheck, Clock, Plus } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { bookingColumns, openingsLabel } from "./bookings.columns";
import { BookingFormModal } from "./components/BookingFormModal";
import {
  BookingRowActions,
  type BookingRowActionHandlers,
} from "./components/BookingRowActions";

const MODULE_PATH = "/company/calendar/bookings";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: toOptions(CALENDAR_STATUS_LABELS),
  },
  {
    name: "isPaid",
    label: "Price",
    type: "select",
    options: [
      { label: "Paid", value: "true" },
      { label: "Free", value: "false" },
    ],
  },
];

export default function BookingsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission(MODULE_PATH);

  const { data, isLoading, isFetching } = useGetCalendarBookingsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as CalendarStatus | undefined,
    isPaid: filters.isPaid === undefined ? undefined : filters.isPaid === "true",
  });

  const { data: summary } = useGetCalendarBookingSummaryQuery();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<CalendarBookingListItem | null>(null);

  const { data: editing } = useGetCalendarBookingQuery(editingId ?? "", { skip: !editingId });

  const [updateBooking] = useUpdateCalendarBookingMutation();
  const [duplicateBooking] = useDuplicateCalendarBookingMutation();
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteCalendarBookingMutation();

  const run = async (action: Promise<unknown>, success: string, fallback: string) => {
    try {
      await action;
      toast.success(success);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || fallback);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await run(
      deleteBooking(pendingDelete._id).unwrap(),
      "Booking page deleted",
      "Could not delete the booking page"
    );
    setPendingDelete(null);
  };

  const handlers = React.useMemo<BookingRowActionHandlers>(
    () => ({
      onEdit: (booking) => {
        setEditingId(booking._id);
        setFormOpen(true);
      },
      onTogglePublished: (booking) =>
        void run(
          updateBooking({
            id: booking._id,
            body: { status: booking.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
          }).unwrap(),
          booking.status === "PUBLISHED" ? "Booking page taken offline" : "Booking page is live",
          "Could not change the booking page status"
        ),
      onDuplicate: (booking) =>
        void run(
          duplicateBooking(booking._id).unwrap(),
          "Booking page duplicated",
          "Could not duplicate the booking page"
        ),
      onShare: (booking) => {
        const url = booking.publicUrl || `${window.location.origin}${booking.publicPath}`;
        navigator.clipboard
          .writeText(url)
          .then(() => toast.success("Public link copied"))
          .catch(() => toast.error("Could not copy the link"));
      },
      onDelete: setPendingDelete,
      canCreate: access.canCreate,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [updateBooking, duplicateBooking, access.canCreate, access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => bookingColumns(handlers), [handlers]);

  const bookings = data?.data ?? [];
  const meta = data?.meta;
  const limitReached = access.isLimitReached(summary?.used ?? 0);

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Slots people book with you, and the requests waiting on you to confirm."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Booking pages</StatLabel>
          <StatValue>{summary?.used ?? 0}</StatValue>
          <StatDescription>{summary?.published ?? 0} live right now</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Requests</StatLabel>
          <StatValue>{summary?.requests ?? 0}</StatValue>
          <StatDescription>{summary?.upcoming ?? 0} still to happen</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Awaiting a payment check</StatLabel>
          <StatValue>{summary?.awaitingVerification ?? 0}</StatValue>
          <StatDescription>Bookings waiting on you to confirm the money</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Verified payments</StatLabel>
          <StatValue>{formatAmount(summary?.collected ?? 0)}</StatValue>
          <StatDescription>{summary?.paid ?? 0} pages charge for a slot</StatDescription>
        </Stat>
      </StatGrid>

      <SectionCard
        icon={CalendarCheck}
        title="All booking pages"
        description="Each page turns your weekly openings into slots anyone can book. Paid slots ask for a transaction ID you verify yourself."
      >
        <DataTableToolbar
          searchValue={filters.search}
          onSearchChange={(value) => setFilter("search", value)}
          searchPlaceholder="Search booking pages by title, address or host..."
          filters={FILTERS}
          currentFilters={filters}
          onFilterChange={setFilter}
          onClear={clearFilters}
          isLoading={isFetching}
          actions={
            access.canCreate && (
              <ActionButton
                icon={Plus}
                label="New booking page"
                onClick={() => {
                  setEditingId(null);
                  setFormOpen(true);
                }}
                disabled={limitReached}
                title={
                  limitReached
                    ? "You have reached the number of booking pages your plan allows"
                    : undefined
                }
              />
            )
          }
        />

        <DataTable
          columns={columns}
          data={bookings}
          isLoading={isLoading}
          pagination={
            meta
              ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
              : undefined
          }
          onPageChange={(page) => setFilter("page", page)}
          onLimitChange={(limit) => setFilter("limit", limit)}
          getRowId={(row) => row._id}
          mobileCard={(booking) => (
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-md border text-white"
                    style={{ backgroundColor: booking.accentColor }}
                  >
                    <CalendarCheck className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <Link
                      to={`/company/calendar/bookings/${booking._id}/requests`}
                      className="block truncate text-sm font-semibold hover:underline"
                    >
                      {booking.title}
                    </Link>
                    <span className="block truncate font-mono text-[11px] text-muted-foreground">
                      {booking.publicPath}
                    </span>
                  </div>
                </div>
                <StatusBadge
                  color={CALENDAR_STATUS_COLORS[booking.status]}
                  label={CALENDAR_STATUS_LABELS[booking.status]}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {booking.durationMinutes} min
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {booking.isPaid ? formatAmount(booking.price, booking.currency) : "Free"}
                </Badge>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {openingsLabel(booking)}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {booking.registrationCount}{" "}
                {booking.registrationCount === 1 ? "request" : "requests"} so far
              </p>

              <div className="mt-3 border-t pt-3">
                <BookingRowActions booking={booking} {...handlers} />
              </div>
            </div>
          )}
        />
      </SectionCard>

      <BookingFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingId(null);
        }}
        booking={editingId ? editing ?? null : null}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="The public page stops working and every booking on it is removed too."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
