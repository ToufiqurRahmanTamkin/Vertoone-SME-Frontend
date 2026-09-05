import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  GOODS_RECEIPT_QUALITY_COLORS,
  GOODS_RECEIPT_QUALITY_LABELS,
  GOODS_RECEIPT_STATUS_COLORS,
  GOODS_RECEIPT_STATUS_LABELS,
  type GoodsReceipt,
} from "@/types/domain/goodsReceipt";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, PackageCheck, Pencil, ReceiptText, Trash2 } from "lucide-react";

export interface GoodsReceiptColumnActions {
  onEdit: (receipt: GoodsReceipt) => void;
  onPost: (receipt: GoodsReceipt) => void;
  onBill: (receipt: GoodsReceipt) => void;
  onCancel: (receipt: GoodsReceipt) => void;
  onDelete: (receipt: GoodsReceipt) => void;
  canEdit: boolean;
  canDelete: boolean;
  canRaiseBill: boolean;
}

export function GoodsReceiptRowActions({
  receipt,
  ...actions
}: GoodsReceiptColumnActions & { receipt: GoodsReceipt }) {
  const isDraft = receipt.status === "DRAFT";
  const isReceived = receipt.status === "RECEIVED";

  return (
    <RowActions
      label={`Actions for ${receipt.receiptNumber}`}
      actions={[
        isDraft && {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(receipt),
        },
        isDraft && {
          key: "post",
          label: "Book into stock",
          icon: PackageCheck,
          disabled: !actions.canEdit,
          onSelect: () => actions.onPost(receipt),
        },
        isReceived &&
          !receipt.isBilled && {
            key: "bill",
            label: "Raise a bill",
            icon: ReceiptText,
            disabled: !actions.canRaiseBill,
            title: actions.canRaiseBill ? undefined : "You need permission to create bills",
            onSelect: () => actions.onBill(receipt),
          },
        receipt.status !== "CANCELLED" && {
          key: "cancel",
          label: "Cancel",
          icon: Ban,
          separated: true,
          disabled: !actions.canEdit || receipt.isBilled,
          title: receipt.isBilled ? `Void bill ${receipt.billNumber} first` : undefined,
          onSelect: () => actions.onCancel(receipt),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canDelete || isReceived,
          onSelect: () => actions.onDelete(receipt),
        },
      ]}
    />
  );
}

export const goodsReceiptColumns = (
  rowActions: GoodsReceiptColumnActions
): ColumnDef<GoodsReceipt>[] => [
  {
    accessorKey: "receiptNumber",
    header: "Receipt",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">
          {row.original.receiptNumber}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.receiptDate)}
        </p>
      </div>
    ),
  },
  {
    id: "supplier",
    header: "Against",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.supplier?.name ?? row.original.supplierName}</p>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.purchaseOrderNumber}
        </p>
      </div>
    ),
  },
  {
    id: "warehouse",
    header: "Into",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.warehouse?.name ?? "—"}</span>
    ),
  },
  {
    id: "quantity",
    header: "Units",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="tabular-nums">{formatNumber(row.original.totalQuantity)}</p>
        {row.original.rejectedQuantity > 0 && (
          <p className="text-xs tabular-nums text-destructive">
            {formatNumber(row.original.rejectedQuantity)} rejected
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "totalValue",
    header: "Value",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm tabular-nums">
        <p>{formatAmountValue(row.original.totalValue)}</p>
        {row.original.landedCostTotal > 0 && (
          <p className="text-xs text-muted-foreground">
            {formatAmountValue(row.original.landedCostTotal)} landed
          </p>
        )}
      </div>
    ),
  },
  {
    id: "billing",
    header: "Billed",
    cell: ({ row }) =>
      row.original.isBilled ? (
        <span className="font-mono text-xs uppercase">{row.original.billNumber}</span>
      ) : (
        <StatusBadge color="amber" label="Not billed" />
      ),
  },
  {
    accessorKey: "qualityResult",
    header: "Quality",
    cell: ({ row }) => (
      <StatusBadge
        color={GOODS_RECEIPT_QUALITY_COLORS[row.original.qualityResult] as StatusColor}
        label={GOODS_RECEIPT_QUALITY_LABELS[row.original.qualityResult]}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={GOODS_RECEIPT_STATUS_COLORS[row.original.status] as StatusColor}
        label={GOODS_RECEIPT_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <GoodsReceiptRowActions receipt={row.original} {...rowActions} />,
  },
];
