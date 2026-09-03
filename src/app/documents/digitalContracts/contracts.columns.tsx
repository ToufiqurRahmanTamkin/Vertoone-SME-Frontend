import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  CONTRACT_STATUS_COLORS,
  CONTRACT_STATUS_LABELS,
  type Contract,
} from "@/types/domain/contract";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Download, PanelRightOpen, Pencil, Send, Trash2 } from "lucide-react";

export interface ContractColumnActions {
  onOpen: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onSend: (contract: Contract) => void;
  onCancel: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function ContractRowActions({
  contract,
  ...actions
}: ContractColumnActions & { contract: Contract }) {
  const isDraft = contract.status === "DRAFT";
  const isClosed =
    contract.status === "SIGNED" ||
    contract.status === "CANCELLED" ||
    contract.status === "DECLINED";

  return (
    <RowActions
      label={`Actions for ${contract.contractNumber}`}
      actions={[
        {
          key: "open",
          label: "Open",
          icon: PanelRightOpen,
          onSelect: () => actions.onOpen(contract),
        },
        {
          key: "send",
          label: "Send for signature",
          icon: Send,
          disabled: !actions.canEdit || !isDraft,
          title: isDraft ? undefined : "Only a draft can be sent",
          onSelect: () => actions.onSend(contract),
        },
        {
          key: "edit",
          label: "Edit draft",
          icon: Pencil,
          disabled: !actions.canEdit || !isDraft,
          title: isDraft ? undefined : "A sent contract cannot be edited",
          onSelect: () => actions.onEdit(contract),
        },
        {
          key: "file",
          label: "Download the file",
          icon: Download,
          onSelect: () => window.open(contract.file.url, "_blank", "noopener,noreferrer"),
        },
        {
          key: "cancel",
          label: "Cancel",
          icon: Ban,
          separated: true,
          disabled: !actions.canEdit || isClosed,
          onSelect: () => actions.onCancel(contract),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          disabled: !actions.canDelete || contract.status === "SIGNED",
          title:
            contract.status === "SIGNED"
              ? "A signed contract is a record and cannot be deleted"
              : undefined,
          onSelect: () => actions.onDelete(contract),
        },
      ]}
    />
  );
}

export const contractColumns = (
  rowActions: ContractColumnActions
): ColumnDef<Contract>[] => [
  {
    accessorKey: "title",
    header: "Contract",
    cell: ({ row }) => (
      <button
        type="button"
        className="min-w-0 cursor-pointer text-left"
        onClick={() => rowActions.onOpen(row.original)}
      >
        <span className="block truncate font-medium hover:underline">{row.original.title}</span>
        <span className="block truncate text-xs text-muted-foreground">
          <span className="font-mono uppercase">{row.original.contractNumber}</span>
          {row.original.counterpartyName ? ` · ${row.original.counterpartyName}` : ""}
        </span>
      </button>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={CONTRACT_STATUS_COLORS[row.original.status]}
        label={CONTRACT_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "signatures",
    header: "Signatures",
    cell: ({ row }) => (
      <div className="min-w-28">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="tabular-nums">
            {row.original.signedCount}/{row.original.signerCount}
          </span>
          <span className="text-muted-foreground">{row.original.progress}%</span>
        </div>
        <Progress value={row.original.progress} className="mt-1 h-1.5" />
      </div>
    ),
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) =>
      row.original.value > 0 ? (
        <span className="font-medium tabular-nums">
          {formatAmount(row.original.value, row.original.currency)}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) => (
      <span className="truncate text-sm">{row.original.owner?.name ?? "Unassigned"}</span>
    ),
  },
  {
    accessorKey: "sentAt",
    header: "Sent",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.sentAt ? formatDate(row.original.sentAt) : "Not sent"}
      </span>
    ),
  },
  {
    accessorKey: "expiresAt",
    header: "Deadline",
    cell: ({ row }) => {
      if (!row.original.expiresAt) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }
      return (
        <StatusBadge
          color={row.original.isExpired ? "red" : row.original.isExpiringSoon ? "amber" : "zinc"}
          label={formatDate(row.original.expiresAt)}
        />
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <ContractRowActions contract={row.original} {...rowActions} />,
  },
];
