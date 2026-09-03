import { AccessBadge } from "@/app/maintainers/components/AccessBadge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_STATUS_COLORS, USER_STATUS_LABELS } from "@/constant";
import { formatDate } from "@/lib/date";
import type { Maintainer } from "@/types/domain/maintainer";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface MaintainerColumnActions {
  onEdit: (maintainer: Maintainer) => void;
  onDelete: (maintainer: Maintainer) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const maintainerColumns = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: MaintainerColumnActions): ColumnDef<Maintainer>[] => [
  {
    accessorKey: "name",
    header: "Maintainer",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.phone || "—"}</span>
    ),
  },
  {
    id: "access",
    header: "Platform access",
    cell: ({ row }) => <AccessBadge maintainer={row.original} />,
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last sign-in",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.lastLoginAt ? formatDate(row.original.lastLoginAt) : "Never"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={USER_STATUS_COLORS[row.original.status]}
        label={USER_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => onEdit(row.original)}
          disabled={!canEdit}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              aria-label={`More actions for ${row.original.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => onDelete(row.original)}
              disabled={!canDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
