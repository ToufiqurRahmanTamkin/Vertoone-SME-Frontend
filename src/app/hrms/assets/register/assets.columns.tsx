import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAmountValue } from "@/lib/amount";
import {
  ASSET_CONDITION_LABELS,
  ASSET_STATUS_COLORS,
  ASSET_STATUS_LABELS,
  type Asset,
} from "@/types/domain/asset";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, ShieldCheck, Trash2, UserMinus, UserPlus } from "lucide-react";

export interface AssetRowActions {
  onEdit: (asset: Asset) => void;
  onAssign: (asset: Asset) => void;
  onReturn: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
}

export const formatDay = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export function AssetRowMenu({
  asset,
  actions,
}: {
  asset: Asset;
  actions: AssetRowActions;
}) {
  const isHeld = Boolean(asset.holderType);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            aria-label={`More actions for ${asset.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={!actions.canEdit} onSelect={() => actions.onEdit(asset)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          {isHeld ? (
            <DropdownMenuItem
              disabled={!actions.canAssign}
              onSelect={() => actions.onReturn(asset)}
            >
              <UserMinus className="size-4" />
              Take it back
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={!actions.canAssign}
              onSelect={() => actions.onAssign(asset)}
            >
              <UserPlus className="size-4" />
              Hand it over
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={!actions.canDelete || isHeld}
            onSelect={() => actions.onDelete(asset)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const assetColumns = (actions: AssetRowActions): ColumnDef<Asset>[] => [
  {
    accessorKey: "name",
    header: "Asset",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-2">
        {row.original.category && (
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: row.original.category.color }}
          />
        )}
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            <span className="font-mono">{row.original.assetCode}</span>
            {row.original.serialNumber && ` · ${row.original.serialNumber}`}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.category?.name ?? "Uncategorised"}
      </span>
    ),
  },
  {
    accessorKey: "holder",
    header: "Held by",
    cell: ({ row }) =>
      row.original.holder ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{row.original.holder.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.holder.type === "USER" ? "User" : "Employee"}
            {row.original.assignedAt && ` · since ${formatDay(row.original.assignedAt)}`}
          </p>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Nobody</span>
      ),
  },
  {
    accessorKey: "condition",
    header: "Condition",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px]">
        {ASSET_CONDITION_LABELS[row.original.condition]}
      </Badge>
    ),
  },
  {
    accessorKey: "currentValue",
    header: () => <div className="text-right">Value now</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <p className="text-sm font-medium">{formatAmountValue(row.original.currentValue)}</p>
        <p className="text-xs text-muted-foreground">
          of {formatAmountValue(row.original.purchaseCost)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "warrantyExpiresAt",
    header: "Warranty",
    cell: ({ row }) =>
      row.original.warrantyExpiresAt ? (
        <div className="flex items-center gap-1.5">
          {row.original.isUnderWarranty && (
            <ShieldCheck
              className={
                row.original.isWarrantyExpiringSoon
                  ? "size-3.5 text-amber-500"
                  : "size-3.5 text-emerald-500"
              }
            />
          )}
          <span className="text-xs text-muted-foreground">
            {formatDay(row.original.warrantyExpiresAt)}
          </span>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={ASSET_STATUS_COLORS[row.original.status]}
        label={ASSET_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <AssetRowMenu asset={row.original} actions={actions} />,
  },
];
