import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { EMPLOYEE_RANGE_LABELS } from "@/constant";
import { formatDate } from "@/lib/date";
import { sisterConcernModules, type SisterConcern } from "@/types/domain/organization";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

interface SisterConcernColumnActions {
  onEdit: (concern: SisterConcern) => void;
  onDelete: (concern: SisterConcern) => void;
}

export const sisterConcernColumns = ({
  onEdit,
  onDelete,
}: SisterConcernColumnActions): ColumnDef<SisterConcern>[] => [
  {
    accessorKey: "name",
    header: "Company",
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
    accessorKey: "email",
    header: "Contact",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{row.original.email}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.phone || "—"}</p>
      </div>
    ),
  },
  {
    accessorKey: "employeeRange",
    header: "Size",
    cell: ({ row }) => (
      <span className="text-sm">
        {EMPLOYEE_RANGE_LABELS[row.original.employeeRange] ?? row.original.employeeRange}
      </span>
    ),
  },
  {
    id: "modules",
    header: "Modules",
    cell: ({ row }) => {
      const modules = sisterConcernModules(row.original);
      if (modules.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {modules.map((module) => (
            <span key={module} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              {module}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Added",
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
          aria-label={`Remove ${row.original.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
