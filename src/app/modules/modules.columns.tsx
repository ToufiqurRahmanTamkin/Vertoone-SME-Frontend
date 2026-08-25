import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import type { AppModule } from "@/types/domain/appModule";
import type { ColumnDef } from "@tanstack/react-table";
import { Boxes, Pencil, Trash2 } from "lucide-react";

interface AppModuleColumnActions {
  onEdit: (entry: AppModule) => void;
  onDelete: (entry: AppModule) => void;
}

export const appModuleColumns = ({
  onEdit,
  onDelete,
}: AppModuleColumnActions): ColumnDef<AppModule>[] => [
  {
    accessorKey: "name",
    header: "Module",
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="flex min-w-0 items-center gap-3">
          {entry.icon ? (
            <img
              src={entry.icon}
              alt=""
              className="h-8 w-8 shrink-0 rounded-md border bg-background object-contain p-1"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted">
              <Boxes className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{entry.name}</p>
            {entry.description && (
              <p className="max-w-sm truncate text-xs text-muted-foreground">
                {entry.description}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "key",
    header: "Key",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">{row.original.key}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <StatusBadge color="green" label="Active" />
      ) : (
        <StatusBadge color="zinc" label="Inactive" />
      ),
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
          onClick={() => onEdit(row.original)}
          aria-label={`Edit ${row.original.name}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
          onClick={() => onDelete(row.original)}
          aria-label={`Delete ${row.original.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
