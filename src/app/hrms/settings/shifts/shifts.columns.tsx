import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WEEK_DAYS } from "@/types/domain/hrmsSettings";
import type { Shift } from "@/types/domain/shift";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";

export interface ShiftRowActions {
  onEdit: (shift: Shift) => void;
  onDelete: (shift: Shift) => void;
  onMakeDefault: (shift: Shift) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const formatHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
};

export const workingDayLabel = (days: number[]): string => {
  if (days.length === 0) return "No days";
  if (days.length === 7) return "Every day";
  return WEEK_DAYS.filter((day) => days.includes(day.value))
    .map((day) => day.short)
    .join(", ");
};

export function ShiftRowMenu({ shift, actions }: { shift: Shift; actions: ShiftRowActions }) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={() => actions.onEdit(shift)}
        disabled={!actions.canEdit}
      >
        <Pencil className="size-3.5" />
        Edit
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            aria-label={`More actions for ${shift.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={!actions.canEdit} onSelect={() => actions.onEdit(shift)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!actions.canEdit || shift.isDefault}
            onSelect={() => actions.onMakeDefault(shift)}
          >
            <Star className="size-4" />
            Make default
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={!actions.canDelete}
            onSelect={() => actions.onDelete(shift)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const shiftColumns = (actions: ShiftRowActions): ColumnDef<Shift>[] => [
  {
    accessorKey: "name",
    header: "Shift",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: row.original.color }}
        />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate font-medium">
            {row.original.name}
            {row.original.isDefault && (
              <Badge variant="secondary" className="text-[10px]">
                Default
              </Badge>
            )}
          </p>
          <p className="truncate font-mono text-xs uppercase text-muted-foreground">
            {row.original.code}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "hours",
    header: "Hours",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium">
          {row.original.startTime} – {row.original.endTime}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatHours(row.original.paidMinutes)} paid
          {row.original.breakMinutes > 0 && `, ${row.original.breakMinutes}m break`}
          {row.original.crossesMidnight && " · overnight"}
        </p>
      </div>
    ),
  },
  {
    id: "workingDays",
    header: "Working days",
    cell: ({ row }) => (
      <span className="text-sm">{workingDayLabel(row.original.workingDays)}</span>
    ),
  },
  {
    accessorKey: "graceMinutes",
    header: "Grace",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {row.original.graceMinutes} min
      </Badge>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={row.original.isActive ? "green" : "zinc"}
        label={row.original.isActive ? "Active" : "Inactive"}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <ShiftRowMenu shift={row.original} actions={actions} />,
  },
];
