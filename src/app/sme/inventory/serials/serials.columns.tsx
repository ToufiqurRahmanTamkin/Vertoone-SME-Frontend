import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/date";
import {
  SERIAL_STATUS_COLORS,
  SERIAL_STATUS_LABELS,
  type SerialNumber,
} from "@/types/domain/serialNumber";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface SerialColumnActions {
  onEdit: (serial: SerialNumber) => void;
  onDelete: (serial: SerialNumber) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function SerialRowActions({
  serial,
  ...actions
}: SerialColumnActions & { serial: SerialNumber }) {
  return (
    <RowActions
      label={`Actions for ${serial.serialNumber}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(serial),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(serial),
        },
      ]}
    />
  );
}

export const warrantyLabel = (serial: SerialNumber): string => {
  if (!serial.warrantyExpiresAt) return "No warranty";
  if (serial.isUnderWarranty) return `Covered to ${formatDate(serial.warrantyExpiresAt)}`;
  return `Lapsed ${formatDate(serial.warrantyExpiresAt)}`;
};

export const serialColumns = (rowActions: SerialColumnActions): ColumnDef<SerialNumber>[] => [
  {
    accessorKey: "serialNumber",
    header: "Serial",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono font-medium uppercase">{row.original.serialNumber}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.product?.name ?? "—"}
        </p>
      </div>
    ),
  },
  {
    id: "location",
    header: "Where",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{row.original.warehouse?.name ?? "—"}</p>
        {row.original.batch && (
          <p className="truncate font-mono text-xs uppercase text-muted-foreground">
            {row.original.batch.batchNumber}
          </p>
        )}
      </div>
    ),
  },
  {
    id: "references",
    header: "References",
    cell: ({ row }) => (
      <div className="min-w-0 text-xs text-muted-foreground">
        <p className="truncate">In: {row.original.purchaseReference || "—"}</p>
        <p className="truncate">Out: {row.original.salesReference || "—"}</p>
      </div>
    ),
  },
  {
    id: "warranty",
    header: "Warranty",
    cell: ({ row }) => (
      <StatusBadge
        color={
          !row.original.warrantyExpiresAt
            ? "zinc"
            : row.original.isUnderWarranty
              ? "green"
              : "red"
        }
        label={warrantyLabel(row.original)}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={SERIAL_STATUS_COLORS[row.original.status]}
        label={SERIAL_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <SerialRowActions serial={row.original} {...rowActions} />,
  },
];
