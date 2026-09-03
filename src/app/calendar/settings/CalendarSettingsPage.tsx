import { ActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteMeetingRoomMutation,
  useGetMeetingRoomFloorsQuery,
  useGetMeetingRoomsQuery,
  useGetMeetingRoomSummaryQuery,
} from "@/redux/apis/meetingRoomApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { MeetingRoom } from "@/types/domain/meetingRoom";
import { DoorOpen, Plus, Users } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { MeetingRoomFormModal } from "./components/MeetingRoomFormModal";
import { MeetingRoomRowActions, meetingRoomColumns } from "./meetingRooms.columns";

const STATUS_FILTER: FilterConfig = {
  name: "isActive",
  label: "Status",
  type: "select",
  options: [
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ],
};

export default function CalendarSettingsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/company/calendar/settings");

  const { data, isLoading, isFetching } = useGetMeetingRoomsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    floor: typeof filters.floor === "string" ? filters.floor : undefined,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetMeetingRoomSummaryQuery();
  const { data: floors } = useGetMeetingRoomFloorsQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MeetingRoom | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<MeetingRoom | null>(null);
  const [deleteMeetingRoom, { isLoading: isDeleting }] = useDeleteMeetingRoomMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (room: MeetingRoom) => {
    setEditing(room);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMeetingRoom(pendingDelete._id).unwrap();
      toast.success("Meeting room deleted");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the meeting room");
    } finally {
      setPendingDelete(null);
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: openEdit,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => meetingRoomColumns(rowActions), [rowActions]);

  const tableFilters = React.useMemo<FilterConfig[]>(() => {
    const available = floors ?? [];
    if (available.length === 0) return [STATUS_FILTER];

    return [
      {
        name: "floor",
        label: "Floor",
        type: "select",
        options: available.map((floor) => ({ label: floor, value: floor })),
      },
      STATUS_FILTER,
    ];
  }, [floors]);

  const rooms = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Calendar settings"
        description="Configure the rooms and resources people can book when they schedule something."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Meeting rooms</StatLabel>
          <StatValue>{summary?.used ?? 0}</StatValue>
          <StatDescription>
            {summary?.floorCount
              ? `Spread across ${summary.floorCount} ${summary.floorCount === 1 ? "floor" : "floors"}`
              : "No floors recorded yet"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Bookable</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Offered when scheduling a meeting</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Total seats</StatLabel>
          <StatValue>{summary?.totalCapacity ?? 0}</StatValue>
          <StatDescription>People your bookable rooms hold together</StatDescription>
        </Stat>
      </StatGrid>

      <SectionCard
        icon={DoorOpen}
        title="Meeting rooms"
        description="Each room has a name, a code, the floor it is on, a colour and how many people it seats."
      >
        <DataTableToolbar
          searchValue={filters.search}
          onSearchChange={(value) => setFilter("search", value)}
          searchPlaceholder="Search rooms by name, code or floor..."
          filters={tableFilters}
          currentFilters={filters}
          onFilterChange={setFilter}
          onClear={clearFilters}
          isLoading={isFetching}
          actions={
            access.canCreate && (
              <ActionButton icon={Plus} label="Add room" onClick={openCreate} />
            )
          }
        />

        <DataTable
          columns={columns}
          data={rooms}
          isLoading={isLoading}
          pagination={
            meta
              ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
              : undefined
          }
          onPageChange={(page) => setFilter("page", page)}
          onLimitChange={(limit) => setFilter("limit", limit)}
          getRowId={(row) => row._id}
          mobileCard={(room) => (
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <ColorChip color={room.color} label={room.name} />
                <StatusBadge
                  color={room.isActive ? "green" : "zinc"}
                  label={room.isActive ? "Active" : "Inactive"}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                  {room.code}
                </Badge>
                {room.floor && (
                  <Badge variant="secondary" className="text-[10px]">
                    {room.floor}
                  </Badge>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {room.capacity} {room.capacity === 1 ? "person" : "people"}
                </span>
              </div>
              <div className="mt-3 border-t pt-3">
                <MeetingRoomRowActions room={room} {...rowActions} />
              </div>
            </div>
          )}
        />
      </SectionCard>

      <MeetingRoomFormModal open={formOpen} onOpenChange={setFormOpen} room={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The room stops being offered when scheduling. Existing bookings keep it."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
