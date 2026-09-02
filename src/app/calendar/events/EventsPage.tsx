import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import {
  CALENDAR_STATUS_COLORS,
  CALENDAR_STATUS_LABELS,
  EVENT_CATEGORY_LABELS,
  toOptions,
} from "@/constant";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount } from "@/lib/amount";
import { formatDateTime } from "@/lib/date";
import {
  useDeleteCalendarEventMutation,
  useDuplicateCalendarEventMutation,
  useGetCalendarEventQuery,
  useGetCalendarEventsQuery,
  useGetCalendarEventSummaryQuery,
  useUpdateCalendarEventMutation,
} from "@/redux/apis/calendarEventApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { CalendarStatus } from "@/types/domain/calendar";
import type { CalendarEventListItem, EventCategory } from "@/types/domain/calendarEvent";
import { CalendarClock, Plus, Users } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { EventFormModal } from "./components/EventFormModal";
import type { EventRowActionHandlers } from "./components/EventRowActions";
import { EventRowActions } from "./components/EventRowActions";
import { eventColumns, seatsLabel } from "./events.columns";

const MODULE_PATH = "/calendar/events";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: toOptions(CALENDAR_STATUS_LABELS),
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: toOptions(EVENT_CATEGORY_LABELS),
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

export default function EventsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission(MODULE_PATH);

  const { data, isLoading, isFetching } = useGetCalendarEventsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as CalendarStatus | undefined,
    category: filters.category as EventCategory | undefined,
    isPaid: filters.isPaid === undefined ? undefined : filters.isPaid === "true",
  });

  const { data: summary } = useGetCalendarEventSummaryQuery();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<CalendarEventListItem | null>(null);

  const { data: editing } = useGetCalendarEventQuery(editingId ?? "", { skip: !editingId });

  const [updateEvent] = useUpdateCalendarEventMutation();
  const [duplicateEvent] = useDuplicateCalendarEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteCalendarEventMutation();

  const run = async (action: Promise<unknown>, success: string, fallback: string) => {
    try {
      await action;
      toast.success(success);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || fallback);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await run(
      deleteEvent(pendingDelete._id).unwrap(),
      "Event deleted",
      "Could not delete the event"
    );
    setPendingDelete(null);
  };

  const handlers = React.useMemo<EventRowActionHandlers>(
    () => ({
      onEdit: (event) => {
        setEditingId(event._id);
        setFormOpen(true);
      },
      onTogglePublished: (event) =>
        void run(
          updateEvent({
            id: event._id,
            body: { status: event.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
          }).unwrap(),
          event.status === "PUBLISHED" ? "Event taken offline" : "Event is live",
          "Could not change the event status"
        ),
      onDuplicate: (event) =>
        void run(
          duplicateEvent(event._id).unwrap(),
          "Event duplicated",
          "Could not duplicate the event"
        ),
      onShare: (event) => {
        const url = event.publicUrl || `${window.location.origin}${event.publicPath}`;
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
    [updateEvent, duplicateEvent, access.canCreate, access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => eventColumns(handlers), [handlers]);

  const events = data?.data ?? [];
  const meta = data?.meta;
  const limitReached = access.isLimitReached(summary?.used ?? 0);

  return (
    <>
      <PageHeader
        title="Events"
        description="One-off and recurring events your company organises, each with a public page anyone can register on."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Events</StatLabel>
          <StatValue>{summary?.used ?? 0}</StatValue>
          <StatDescription>
            {summary?.published ?? 0} live · {summary?.upcoming ?? 0} still to come
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Registrations</StatLabel>
          <StatValue>{summary?.registrations ?? 0}</StatValue>
          <StatDescription>People who signed up through a public page</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Awaiting a payment check</StatLabel>
          <StatValue>{summary?.awaitingVerification ?? 0}</StatValue>
          <StatDescription>Registrations waiting on you to confirm the money</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Verified payments</StatLabel>
          <StatValue>{formatAmount(summary?.collected ?? 0)}</StatValue>
          <StatDescription>{summary?.paid ?? 0} events charge for a place</StatDescription>
        </Stat>
      </StatGrid>

      <SectionCard
        icon={CalendarClock}
        title="All events"
        description="Publish an event to make its page reachable. Paid events ask for a transaction ID you verify yourself."
      >
        <DataTableToolbar
          searchValue={filters.search}
          onSearchChange={(value) => setFilter("search", value)}
          searchPlaceholder="Search events by title, address or summary..."
          filters={FILTERS}
          currentFilters={filters}
          onFilterChange={setFilter}
          onClear={clearFilters}
          isLoading={isFetching}
          actions={
            access.canCreate && (
              <ActionButton
                icon={Plus}
                label="New event"
                onClick={openCreate}
                disabled={limitReached}
                title={
                  limitReached
                    ? "You have reached the number of events your plan allows"
                    : undefined
                }
              />
            )
          }
        />

        <DataTable
          columns={columns}
          data={events}
          isLoading={isLoading}
          pagination={
            meta
              ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
              : undefined
          }
          onPageChange={(page) => setFilter("page", page)}
          onLimitChange={(limit) => setFilter("limit", limit)}
          getRowId={(row) => row._id}
          mobileCard={(event) => (
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-md border text-white"
                    style={{ backgroundColor: event.accentColor }}
                  >
                    <CalendarClock className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <Link
                      to={`/calendar/events/${event._id}/registrations`}
                      className="block truncate text-sm font-semibold hover:underline"
                    >
                      {event.title}
                    </Link>
                    <span className="block truncate font-mono text-[11px] text-muted-foreground">
                      {event.publicPath}
                    </span>
                  </div>
                </div>
                <StatusBadge
                  color={CALENDAR_STATUS_COLORS[event.status]}
                  label={CALENDAR_STATUS_LABELS[event.status]}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {EVENT_CATEGORY_LABELS[event.category]}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {event.isPaid ? formatAmount(event.price, event.currency) : "Free"}
                </Badge>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  {seatsLabel(event)}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {formatDateTime(event.startAt)}
              </p>

              <div className="mt-3 border-t pt-3">
                <EventRowActions event={event} {...handlers} />
              </div>
            </div>
          )}
        />
      </SectionCard>

      <EventFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingId(null);
        }}
        event={editingId ? editing ?? null : null}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="The public page stops working and every registration on it is removed too."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
