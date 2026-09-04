import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatDate } from "@/lib/date";
import {
  useDeleteAttendanceMutation,
  useGetAttendanceQuery,
  useGetAttendanceSummaryQuery,
  useGetAttendanceTodayQuery,
} from "@/redux/apis/attendanceApis";
import { useGetDepartmentOptionsQuery } from "@/redux/apis/departmentApis";
import { useGetShiftOptionsQuery } from "@/redux/apis/shiftApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
  formatClock,
  formatMinutes,
  type Attendance,
  type AttendanceStatus,
} from "@/types/domain/attendance";
import { CalendarCheck, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AttendanceRowMenu, attendanceColumns } from "./attendance.columns";
import { ManualAttendanceModal } from "./components/ManualAttendanceModal";

const isoDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export default function DailyAttendancePage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/attendance/daily-attendance");

  const { data: departments = [] } = useGetDepartmentOptionsQuery();
  const { data: shifts = [] } = useGetShiftOptionsQuery();

  const from = (filters.from as string | undefined) ?? isoDaysAgo(29);
  const to = (filters.to as string | undefined) ?? new Date().toISOString();

  const listFilters: FilterConfig[] = React.useMemo(
    () => [
      { name: "from", label: "From", type: "date" },
      { name: "to", label: "To", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ATTENDANCE_STATUSES.map((value) => ({
          label: ATTENDANCE_STATUS_LABELS[value],
          value,
        })),
      },
      {
        name: "departmentId",
        label: "Department",
        type: "select",
        options: departments.map((option) => ({ label: option.name, value: option._id })),
      },
      {
        name: "shiftId",
        label: "Shift",
        type: "select",
        options: shifts.map((shift) => ({ label: shift.name, value: shift._id })),
      },
    ],
    [departments, shifts]
  );

  const scope = {
    from,
    to,
    departmentId: filters.departmentId as string | undefined,
    search: filters.search,
  };

  const { data, isLoading, isFetching } = useGetAttendanceQuery({
    ...scope,
    page: filters.page,
    limit: filters.limit,
    status: filters.status as AttendanceStatus | undefined,
    shiftId: filters.shiftId as string | undefined,
  });

  const { data: summary } = useGetAttendanceSummaryQuery({
    from,
    to,
    departmentId: scope.departmentId,
  });

  const { data: todayRows = [], isLoading: isTodayLoading } = useGetAttendanceTodayQuery({
    departmentId: scope.departmentId,
    search: filters.search,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Attendance | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Attendance | null>(null);
  const [deleteAttendance, { isLoading: isDeleting }] = useDeleteAttendanceMutation();

  const rowActions = React.useMemo(
    () => ({
      onEdit: (attendance: Attendance) => {
        setEditing(attendance);
        setFormOpen(true);
      },
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => attendanceColumns(rowActions), [rowActions]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteAttendance(pendingDelete._id).unwrap();
      toast.success("Attendance record removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the record");
    }
  };

  const records = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Daily attendance"
        description="Check-in and check-out records day by day, and who is in right now."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>In right now</StatLabel>
          <StatValue>{summary?.clockedInToday ?? 0}</StatValue>
          <StatDescription>Out of {summary?.headcount ?? 0} active people</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Attendance rate</StatLabel>
          <StatValue>{summary?.attendanceRate ?? 0}%</StatValue>
          <StatDescription>Across the selected range</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Late arrivals</StatLabel>
          <StatValue>{summary?.lateCount ?? 0}</StatValue>
          <StatDescription>{formatMinutes(summary?.totalLateMinutes ?? 0)} in total</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Hours worked</StatLabel>
          <StatValue>{summary?.totalWorkedHours ?? 0}</StatValue>
          <StatDescription>
            {summary?.averageWorkedHours ?? 0} average per day worked
          </StatDescription>
        </Stat>
      </StatGrid>

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records" className="cursor-pointer">
            Records
          </TabsTrigger>
          <TabsTrigger value="today" className="cursor-pointer">
            Today
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="mt-4 flex flex-col gap-4">
          <DataTableToolbar
            searchValue={filters.search}
            onSearchChange={(value) => setFilter("search", value)}
            searchPlaceholder="Search people..."
            filters={listFilters}
            currentFilters={{ ...filters, from, to }}
            onFilterChange={setFilter}
            onClear={clearFilters}
            isLoading={isFetching}
            actions={
              access.canCreate && (
                <ActionButton
                  icon={Plus}
                  label="Record attendance"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                />
              )
            }
          />

          <DataTable
            columns={columns}
            data={records}
            isLoading={isLoading}
            pagination={
              meta
                ? {
                    page: meta.page,
                    limit: meta.limit,
                    total: meta.total,
                    pages: meta.totalPages,
                  }
                : undefined
            }
            onPageChange={(page) => setFilter("page", page)}
            onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
            getRowId={(row) => row._id}
            mobileCard={(attendance) => (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {attendance.employee?.name ?? "—"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(attendance.date)} · {attendance.shiftName || "No shift"}
                    </p>
                  </div>
                  <StatusBadge
                    color={ATTENDANCE_STATUS_COLORS[attendance.status] ?? "muted"}
                    label={attendance.statusLabel}
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px] tabular-nums">
                    {formatClock(attendance.firstClockInAt)} →{" "}
                    {formatClock(attendance.lastClockOutAt)}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {formatMinutes(attendance.workedMinutes)}
                  </Badge>
                  {attendance.lateMinutes > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      Late {formatMinutes(attendance.lateMinutes)}
                    </Badge>
                  )}
                </div>

                <div className="mt-3 border-t pt-3">
                  <AttendanceRowMenu attendance={attendance} actions={rowActions} />
                </div>
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="today" className="mt-4">
          <SectionCard
            icon={CalendarCheck}
            title="Who is in today"
            description="Live view of every active employee and where they stand today."
          >
            {isTodayLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : todayRows.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No active employees match this filter.
              </p>
            ) : (
              <div className="divide-y">
                {todayRows.map((row) => (
                  <div
                    key={row.employeeId}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{row.employee?.name ?? "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {row.shiftName || "No shift"}
                        {row.shiftStartTime && ` · from ${row.shiftStartTime}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {formatClock(row.firstClockInAt)} → {formatClock(row.lastClockOutAt)}
                      </span>
                      <Badge variant="secondary" className="text-[10px] tabular-nums">
                        {row.workedHours}h
                      </Badge>
                      {row.isClockedIn && (
                        <Badge variant="outline" className="text-[10px]">
                          In now
                        </Badge>
                      )}
                      <StatusBadge
                        color={ATTENDANCE_STATUS_COLORS[row.status] ?? "muted"}
                        label={row.statusLabel}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      <ManualAttendanceModal open={formOpen} onOpenChange={setFormOpen} attendance={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this attendance record?"
        description="The day goes back to having nothing recorded against it."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
