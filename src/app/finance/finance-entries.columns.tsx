import { StatusBadge } from "@/components/shared/status-badge";
import {
  INCOME_SOURCE_TYPE_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/constant";
import { formatAmountValue } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { categoryRefName, type Expense, type Income } from "@/types/domain/finance";
import type { ColumnDef } from "@tanstack/react-table";
import {
  FinanceEntryRowActions,
  type FinanceEntryRowActionHandlers,
} from "./components/FinanceEntryRowActions";
import { FINANCE_ENTRY_COPY, type FinanceEntryKind } from "./finance-entry-copy";

type FinanceEntryColumnActions<T> = FinanceEntryRowActionHandlers<T> & {
  kind: FinanceEntryKind;
};

const entryParty = (entry: Income | Expense, kind: FinanceEntryKind): string =>
  (kind === "INCOME" ? (entry as Income).receivedFrom : (entry as Expense).paidTo) || "—";

export const financeEntryColumns = <T extends Income | Expense>({
  kind,
  ...rowActions
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
        {formatAmountValue(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="text-sm">{formatDate(row.original.date)}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={INVOICE_STATUS_COLORS[row.original.status]}
        label={INVOICE_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "invoice",
    header: "Invoice",
    cell: ({ row }) => {
      const invoice = row.original.invoice;
      if (!invoice) {
        return <span className="text-xs text-muted-foreground">Not billed</span>;
      }
      return <span className="font-mono text-xs">{invoice.invoiceNumber}</span>;
    },
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
    cell: ({ row }) => <FinanceEntryRowActions entry={row.original} {...rowActions} />,
  },
];
