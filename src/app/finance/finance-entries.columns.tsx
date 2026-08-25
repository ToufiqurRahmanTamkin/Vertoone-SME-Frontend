import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { INCOME_SOURCE_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { categoryRefName, type Expense, type Income } from "@/types/domain/finance";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { FINANCE_ENTRY_COPY, type FinanceEntryKind } from "./finance-entry-copy";

interface FinanceEntryColumnActions<T> {
  kind: FinanceEntryKind;
  onEdit: (entry: T) => void;
  onDelete: (entry: T) => void;
}

const entryParty = (entry: Income | Expense, kind: FinanceEntryKind): string =>
  (kind === "INCOME" ? (entry as Income).receivedFrom : (entry as Expense).paidTo) || "—";

const isSystemGenerated = (entry: Income | Expense): boolean =>
  "sourceType" in entry && entry.sourceType !== "MANUAL";

export const financeEntryColumns = <T extends Income | Expense>({
  kind,
  onEdit,
  onDelete,
}: FinanceEntryColumnActions<T>): ColumnDef<T>[] => [
  {
    accessorKey: "title",
    header: "Entry",
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="min-w-0">
          <p className="truncate font-medium">{entry.title}</p>
          <p className="max-w-xs truncate text-xs text-muted-foreground">
            {categoryRefName(entry.categoryId)}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {formatAmount(row.original.amount, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="text-sm">{formatDate(row.original.date)}</span>,
  },
  {
    id: "party",
    header: FINANCE_ENTRY_COPY[kind].partyColumnHeader,
    cell: ({ row }) => (
      <span className="max-w-[12rem] truncate text-sm">{entryParty(row.original, kind)}</span>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => (
      <span className="text-sm">{PAYMENT_METHOD_LABELS[row.original.paymentMethod]}</span>
    ),
  },
  ...(kind === "INCOME"
    ? [
        {
          id: "source",
          header: "Source",
          cell: ({ row }) => {
            const income = row.original as Income;
            return income.sourceType === "SOLD_SUBSCRIPTION" ? (
              <StatusBadge
                color="violet"
                label={INCOME_SOURCE_TYPE_LABELS.SOLD_SUBSCRIPTION}
              />
            ) : (
              <span className="text-xs text-muted-foreground">
                {INCOME_SOURCE_TYPE_LABELS.MANUAL}
              </span>
            );
          },
        } satisfies ColumnDef<T>,
      ]
    : []),
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const locked = isSystemGenerated(row.original);
      return (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => onEdit(row.original)}
            disabled={locked}
            aria-label={`Edit ${row.original.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original)}
            disabled={locked}
            aria-label={`Delete ${row.original.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
