import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/date";
import {
  ATTENDANCE_STATUS_COLORS,
  formatClock,
  formatMinutes,
  type Attendance,
} from "@/types/domain/attendance";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export interface AttendanceRowActions {
  onEdit: (attendance: Attendance) => void;
  onDelete: (attendance: Attendance) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function AttendanceRowMenu({
  attendance,
  actions,
}: {
  attendance: Attendance;
  actions: AttendanceRowActions;
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            aria-label={`More actions for ${attendance.employee?.name ?? "record"}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={!actions.canEdit}
            onSelect={() => actions.onEdit(attendance)}
          >
            <Pencil className="size-4" />
            Edit punches
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={!actions.canDelete}
            onSelect={() => actions.onDelete(attendance)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const attendanceColumns = (actions: AttendanceRowActions): ColumnDef<Attendance>[] => [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.employee?.name ?? "—"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.employee?.employeeCode ?? ""}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium">{formatDate(row.original.date)}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.scheduleKind === "SHIFT"
            ? `${row.original.shiftName} · ${row.original.shiftStartTime}–${row.original.shiftEndTime}`
            : row.original.holidayName || "Day off"}
        </p>
      </div>
    ),
  },
  {
    id: "punches",
    header: "In / out",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium tabular-nums">
          {formatClock(row.original.firstClockInAt)} → {formatClock(row.original.lastClockOutAt)}
        </p>
        <p className="text-xs text-muted-foreground">
          {row.original.sessions.length} punch
          {row.original.sessions.length === 1 ? "" : "es"}
          {row.original.isOpen && " · still in"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "workedMinutes",
    header: "Worked",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium tabular-nums">{formatMinutes(row.original.workedMinutes)}</p>
        {row.original.overtimeMinutes > 0 && (
          <p className="text-xs text-muted-foreground">
            +{formatMinutes(row.original.overtimeMinutes)} overtime
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "lateMinutes",
    header: "Late",
    cell: ({ row }) =>
      row.original.lateMinutes > 0 ? (
        <span className="font-medium tabular-nums text-amber-600 dark:text-amber-400">
          {formatMinutes(row.original.lateMinutes)}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <StatusBadge
          color={ATTENDANCE_STATUS_COLORS[row.original.status] ?? "muted"}
          label={row.original.statusLabel}
        />
        {row.original.isCorrected && (
          <Badge variant="outline" className="text-[10px]">
            Corrected
          </Badge>
        )}
        {row.original.isManual && !row.original.isCorrected && (
          <Badge variant="outline" className="text-[10px]">
            Manual
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <AttendanceRowMenu attendance={row.original} actions={actions} />,
  },
];
