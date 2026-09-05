import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/amount";
import {
  BARCODE_SYMBOLOGY_LABELS,
  LABEL_PRESET_LABELS,
  type LabelTemplate,
  type ProductBarcode,
} from "@/types/domain/productBarcode";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface BarcodeColumnActions {
  onEdit: (barcode: ProductBarcode) => void;
  onDelete: (barcode: ProductBarcode) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export interface LabelColumnActions {
  onEdit: (template: LabelTemplate) => void;
  onDelete: (template: LabelTemplate) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function BarcodeRowActions({
  barcode,
  ...actions
}: BarcodeColumnActions & { barcode: ProductBarcode }) {
  return (
    <RowActions
      label={`Actions for ${barcode.code}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(barcode),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(barcode),
        },
      ]}
    />
  );
}

export function LabelRowActions({
  template,
  ...actions
}: LabelColumnActions & { template: LabelTemplate }) {
  return (
    <RowActions
      label={`Actions for ${template.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(template),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(template),
        },
      ]}
    />
  );
}

export const fieldSummary = (template: LabelTemplate): string =>
  [
    template.fields.showName ? "Name" : null,
    template.fields.showSku ? "SKU" : null,
    template.fields.showPrice ? "Price" : null,
    template.fields.showBarcode ? "Barcode" : null,
    template.fields.showCompany ? "Company" : null,
  ]
    .filter(Boolean)
    .join(" · ") || "Nothing printed";

export const barcodeColumns = (
  rowActions: BarcodeColumnActions
): ColumnDef<ProductBarcode>[] => [
  {
    accessorKey: "code",
    header: "Barcode",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono font-medium tracking-wide">{row.original.code}</p>
        <p className="truncate text-xs text-muted-foreground">
          {BARCODE_SYMBOLOGY_LABELS[row.original.symbology]}
        </p>
      </div>
    ),
  },
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{row.original.product?.name ?? "—"}</p>
        {row.original.variant && (
          <p className="truncate text-xs text-muted-foreground">{row.original.variant.name}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "packSize",
    header: "Pack size",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatNumber(row.original.packSize)}</span>
    ),
  },
  {
    accessorKey: "isPrimary",
    header: "Role",
    cell: ({ row }) =>
      row.original.isPrimary ? (
        <StatusBadge color="blue" label="Primary" />
      ) : (
        <Badge variant="secondary" className="text-[10px]">
          Extra
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
    cell: ({ row }) => <BarcodeRowActions barcode={row.original} {...rowActions} />,
  },
];

export const labelColumns = (rowActions: LabelColumnActions): ColumnDef<LabelTemplate>[] => [
  {
    accessorKey: "name",
    header: "Label",
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate font-medium">{row.original.name}</p>
          {row.original.isDefault && <StatusBadge color="blue" label="Default" />}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {LABEL_PRESET_LABELS[row.original.preset]}
        </p>
      </div>
    ),
  },
  {
    id: "size",
    header: "Size",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-muted-foreground">
        {row.original.widthMm} × {row.original.heightMm} mm
      </span>
    ),
  },
  {
    accessorKey: "columns",
    header: "Per sheet",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatNumber(row.original.labelsPerSheet)} · {row.original.columns} across
      </span>
    ),
  },
  {
    id: "fields",
    header: "Prints",
    cell: ({ row }) => (
      <span className="truncate text-xs text-muted-foreground">{fieldSummary(row.original)}</span>
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
    cell: ({ row }) => <LabelRowActions template={row.original} {...rowActions} />,
  },
];
