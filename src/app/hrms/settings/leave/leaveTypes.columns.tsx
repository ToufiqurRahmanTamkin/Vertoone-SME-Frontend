import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LEAVE_ACCRUAL_LABELS, LEAVE_GENDER_LABELS, type LeaveType } from "@/types/domain/leaveType";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export interface LeaveTypeRowActions {
  onEdit: (leaveType: LeaveType) => void;
  onDelete: (leaveType: LeaveType) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function LeaveTypeRowMenu({
  leaveType,
  actions,
}: {
  leaveType: LeaveType;
  actions: LeaveTypeRowActions;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={() => actions.onEdit(leaveType)}
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
            aria-label={`More actions for ${leaveType.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={!actions.canEdit}
            onSelect={() => actions.onEdit(leaveType)}
          >
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={!actions.canDelete}
            onSelect={() => actions.onDelete(leaveType)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const leaveTypeColumns = (actions: LeaveTypeRowActions): ColumnDef<LeaveType>[] => [
  {
    accessorKey: "name",
    header: "Leave type",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: row.original.color }}
        />
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate font-mono text-xs uppercase text-muted-foreground">
            {row.original.code}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "daysPerYear",
    header: "Days a year",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium">{row.original.daysPerYear}</p>
        <p className="truncate text-xs text-muted-foreground">
          {LEAVE_ACCRUAL_LABELS[row.original.accrual]}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "isPaid",
    header: "Pay",
    cell: ({ row }) => (
      <StatusBadge
        color={row.original.isPaid ? "green" : "amber"}
        label={row.original.isPaid ? "Paid" : "Unpaid"}
      />
    ),
  },
  {
    id: "rules",
    header: "Rules",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.carryForward && (
          <Badge variant="secondary" className="text-[10px]">
            Carries {row.original.maxCarryForwardDays}d
          </Badge>
        )}
        {row.original.encashable && (
          <Badge variant="secondary" className="text-[10px]">
            Encashable
          </Badge>
        )}
        {row.original.requiresDocument && (
          <Badge variant="secondary" className="text-[10px]">
            Document after {row.original.documentAfterDays}d
          </Badge>
        )}
        {row.original.applicableGender !== "ALL" && (
          <Badge variant="secondary" className="text-[10px]">
            {LEAVE_GENDER_LABELS[row.original.applicableGender]}
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
        color={row.original.isActive ? "green" : "zinc"}
        label={row.original.isActive ? "Active" : "Inactive"}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <LeaveTypeRowMenu leaveType={row.original} actions={actions} />,
  },
];
