import { AccessBadge } from "@/app/maintainers/components/AccessBadge";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { USER_STATUS_COLORS, USER_STATUS_LABELS } from "@/constant";
import { formatDate } from "@/lib/date";
import type { Maintainer } from "@/types/domain/maintainer";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface MaintainerColumnActions {
  onEdit: (maintainer: Maintainer) => void;
  onDelete: (maintainer: Maintainer) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function MaintainerRowActions({
  maintainer,
  ...actions
}: MaintainerColumnActions & { maintainer: Maintainer }) {
  return (
    <RowActions
      label={`Actions for ${maintainer.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(maintainer),
        },
        {
          key: "delete",
          label: "Remove",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(maintainer),
        },
      ]}
    />
  );
}

export const maintainerColumns = (
  rowActions: MaintainerColumnActions
): ColumnDef<Maintainer>[] => [
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
    cell: ({ row }) => <MaintainerRowActions maintainer={row.original} {...rowActions} />,
  },
];
