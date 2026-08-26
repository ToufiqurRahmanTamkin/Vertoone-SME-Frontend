import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  INVOICE_ORIGIN_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_COLORS,
  INVOICE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { categoryRefName, type Expense, type Income } from "@/types/domain/finance";
import { invoiceEntry, type Invoice } from "@/types/domain/invoice";
import type { PaymentMethod } from "@/types/domain/soldSubscription";
import * as React from "react";

interface InvoiceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

interface RowProps {
  label: string;
  children: React.ReactNode;
}

function Row({ label, children }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium">{children}</span>
    </div>
  );
}

export function InvoiceDetailDialog({ open, onOpenChange, invoice }: InvoiceDetailDialogProps) {
  if (!invoice) return null;

  const entry = invoiceEntry(invoice);
  const linkedEntry = typeof entry === "object" && entry !== null ? entry : null;
  const isIncome = invoice.type === "INCOME";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono">{invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>{invoice.title}</DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              color={INVOICE_TYPE_COLORS[invoice.type]}
              label={INVOICE_TYPE_LABELS[invoice.type]}
            />
            <StatusBadge
              color={INVOICE_STATUS_COLORS[invoice.status]}
              label={INVOICE_STATUS_LABELS[invoice.status]}
            />
            <span className="text-xs text-muted-foreground">
              {INVOICE_ORIGIN_LABELS[invoice.origin]}
            </span>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums">
              {formatAmount(invoice.amount, invoice.currency)}
            </p>
          </div>

          <div className="space-y-2">
            <Row label={isIncome ? "Billed to" : "Billed from"}>{invoice.party || "—"}</Row>
            <Row label="Issue date">{formatDate(invoice.issueDate)}</Row>
            <Row label="Due date">{formatDate(invoice.dueDate)}</Row>
            <Row label="Reference">
              <span className="font-mono">{invoice.reference || "—"}</span>
            </Row>
          </div>

          <div className="space-y-2 border-t pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ledger entry
            </p>
            {linkedEntry ? (
              <>
                <Row label="Entry">{linkedEntry.title}</Row>
                <Row label="Category">{categoryRefName(linkedEntry.categoryId)}</Row>
                <Row label="Recorded on">{formatDate(linkedEntry.date)}</Row>
                <Row label={isIncome ? "Received from" : "Paid to"}>
                  {(isIncome
                    ? (linkedEntry as Income).receivedFrom
                    : (linkedEntry as Expense).paidTo) || "—"}
                </Row>
                <Row label="Method">
                  {PAYMENT_METHOD_LABELS[linkedEntry.paymentMethod as PaymentMethod] ?? "—"}
                </Row>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                This invoice is not attached to an {isIncome ? "income" : "expense"} entry yet. Edit
                it to link one.
              </p>
            )}
          </div>

          {invoice.notes && (
            <div className="border-t pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notes
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm">{invoice.notes}</p>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
