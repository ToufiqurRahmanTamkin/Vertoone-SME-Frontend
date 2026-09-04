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
  SHIFT_ASSIGNMENT_TYPE_LABELS,
  WEEKDAY_SHORT_LABELS,
  type EmployeeShift,
} from "@/types/domain/employeeShift";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export interface ShiftAssignmentRowActions {
  onEdit: (assignment: EmployeeShift) => void;
  onDelete: (assignment: EmployeeShift) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function ShiftAssignmentRowMenu({
  assignment,
  actions,
}: {
  assignment: EmployeeShift;
  actions: ShiftAssignmentRowActions;
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            aria-label={`More actions for ${assignment.employee?.name ?? "assignment"}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={!actions.canEdit}
            onSelect={() => actions.onEdit(assignment)}
          >
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={!actions.canDelete}
            onSelect={() => actions.onDelete(assignment)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function AssignmentShape({ assignment }: { assignment: EmployeeShift }) {
  if (assignment.assignmentType === "WEEKLY") {
    return (
      <div className="flex flex-wrap gap-1">
        {assignment.weeklyShifts.map((slot) => (
          <span
            key={slot.day}
            title={slot.shift ? slot.shift.name : "Day off"}
            className="inline-flex size-6 items-center justify-center rounded text-[10px] font-semibold"
            style={
              slot.isWeekOff || !slot.shift
                ? undefined
                : { backgroundColor: `${slot.shift.color}22`, color: slot.shift.color }
            }
          >
            <span className={slot.isWeekOff || !slot.shift ? "text-muted-foreground/50" : ""}>
              {WEEKDAY_SHORT_LABELS[slot.day].slice(0, 1)}
            </span>
          </span>
        ))}
      </div>
    );
  }

  if (assignment.assignmentType === "ROSTER") {
    return (
      <div className="flex flex-wrap gap-1">
        {assignment.rotationShifts.length === 0 ? (
          <span className="text-sm text-muted-foreground">Roster only</span>
        ) : (
          assignment.rotationShifts.map((shift) => (
            <Badge key={shift._id} variant="secondary" className="text-[10px]">
              {shift.name}
            </Badge>
          ))
        )}
      </div>
    );
  }

  if (!assignment.shift) return <span className="text-sm text-muted-foreground">—</span>;

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: assignment.shift.color }}
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{assignment.shift.name}</span>
        <span className="block text-xs text-muted-foreground tabular-nums">
          {assignment.shift.startTime}–{assignment.shift.endTime}
        </span>
      </span>
    </span>
  );
}

export const shiftAssignmentColumns = (
  actions: ShiftAssignmentRowActions
): ColumnDef<EmployeeShift>[] => [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.employee?.name ?? "—"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.employee?.designation || row.original.employee?.employeeCode || ""}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "assignmentType",
    header: "Arrangement",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {SHIFT_ASSIGNMENT_TYPE_LABELS[row.original.assignmentType]}
      </Badge>
    ),
  },
  {
    id: "shape",
    header: "Shift",
    cell: ({ row }) => <AssignmentShape assignment={row.original} />,
  },
  {
    accessorKey: "effectiveFrom",
    header: "In force",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium">{formatDate(row.original.effectiveFrom)}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.effectiveTo
            ? `Until ${formatDate(row.original.effectiveTo)}`
            : "Open ended"}
        </p>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={!row.original.isActive ? "zinc" : row.original.isCurrent ? "green" : "muted"}
        label={
          !row.original.isActive ? "Inactive" : row.original.isCurrent ? "Current" : "Scheduled"
        }
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <ShiftAssignmentRowMenu assignment={row.original} actions={actions} />,
  },
];
