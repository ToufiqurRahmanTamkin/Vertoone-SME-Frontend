import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HOLIDAY_TYPE_LABELS, type Holiday } from "@/types/domain/holiday";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export interface HolidayRowActions {
  onEdit: (holiday: Holiday) => void;
  onDelete: (holiday: Holiday) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const formatDay = (value: string): string =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export const formatRange = (holiday: Holiday): string =>
  holiday.days > 1 ? `${formatDay(holiday.date)} – ${formatDay(holiday.endDate)}` : formatDay(holiday.date);

export function HolidayRowMenu({
  holiday,
  actions,
}: {
  holiday: Holiday;
  actions: HolidayRowActions;
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            aria-label={`More actions for ${holiday.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={!actions.canEdit} onSelect={() => actions.onEdit(holiday)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={!actions.canDelete}
            onSelect={() => actions.onDelete(holiday)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const holidayColumns = (actions: HolidayRowActions): ColumnDef<Holiday>[] => [
  {
    accessorKey: "name",
    header: "Holiday",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: row.original.color }}
        />
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          {row.original.description && (
            <p className="max-w-xs truncate text-xs text-muted-foreground">
              {row.original.description}
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "When",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{formatRange(row.original)}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.days} day{row.original.days === 1 ? "" : "s"}
          {row.original.isRecurringYearly && " · repeats yearly"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {HOLIDAY_TYPE_LABELS[row.original.type]}
      </Badge>
    ),
  },
  {
    id: "pay",
    header: "Pay",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <StatusBadge
          color={row.original.isPaid ? "green" : "amber"}
          label={row.original.isPaid ? "Paid" : "Unpaid"}
        />
        {row.original.isOptional && (
          <Badge variant="outline" className="text-[10px]">
            Optional
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={!row.original.isActive ? "zinc" : row.original.isPast ? "muted" : "green"}
        label={!row.original.isActive ? "Inactive" : row.original.isPast ? "Past" : "Upcoming"}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <HolidayRowMenu holiday={row.original} actions={actions} />,
  },
];
