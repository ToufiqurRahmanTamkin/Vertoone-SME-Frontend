import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { USER_STATUS_COLORS, USER_STATUS_LABELS } from "@/constant";
import { grantedMenuCount, type Concern } from "@/types/domain/concern";
import type { ColumnDef } from "@tanstack/react-table";
import { KeyRound, Pencil, Trash2 } from "lucide-react";

interface ConcernColumnActions {
  onEdit: (concern: Concern) => void;
  onManageHead: (concern: Concern) => void;
  onDelete: (concern: Concern) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const concernColumns = ({
  onEdit,
  onManageHead,
  onDelete,
  canEdit,
  canDelete,
}: ConcernColumnActions): ColumnDef<Concern>[] => [
  {
    accessorKey: "name",
    header: "Concern",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.industry || "Industry not set"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-[10px]">
        {row.original.code}
      </Badge>
    ),
  },
  {
    id: "head",
    header: "Concern head",
    cell: ({ row }) => {
      const head = row.original.head;
      if (!head) {
        return (
          <Badge variant="outline" className="text-[10px]">
            No head yet
          </Badge>
        );
      }
      return (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{head.name}</p>
          <p className="truncate text-xs text-muted-foreground">{head.email}</p>
        </div>
      );
    },
  },
  {
    id: "access",
    header: "Menu access",
    cell: ({ row }) => {
      const count = grantedMenuCount(row.original.head);
      return (
        <Badge variant={count === 0 ? "outline" : "secondary"} className="text-[10px]">
          {count === 0 ? "No menus" : `${count} menu${count === 1 ? "" : "s"}`}
        </Badge>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <StatusBadge color="green" label="Active" />
      ) : (
        <StatusBadge color="zinc" label="Inactive" />
      ),
  },
  {
    id: "headStatus",
    header: "Sign-in",
    cell: ({ row }) => {
      const head = row.original.head;
      if (!head) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }
      return (
        <StatusBadge
          color={USER_STATUS_COLORS[head.status]}
          label={USER_STATUS_LABELS[head.status]}
        />
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => onManageHead(row.original)}
          disabled={!canEdit || !row.original.head}
          aria-label={`Manage the head of ${row.original.name}`}
          title="Manage concern head"
        >
          <KeyRound className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => onEdit(row.original)}
          disabled={!canEdit}
          aria-label={`Edit ${row.original.name}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
          onClick={() => onDelete(row.original)}
          disabled={!canDelete}
          aria-label={`Remove ${row.original.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
