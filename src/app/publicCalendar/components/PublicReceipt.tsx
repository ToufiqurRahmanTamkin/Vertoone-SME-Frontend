import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  REGISTRATION_PAYMENT_STATUS_COLORS,
  REGISTRATION_PAYMENT_STATUS_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDateTime } from "@/lib/date";
import type { RegistrationReceipt } from "@/types/domain/publicCalendar";
import { CheckCircle2 } from "lucide-react";

interface PublicReceiptProps {
  receipt: RegistrationReceipt;
  accentColor: string;
  onDone: () => void;
}

export function PublicReceipt({ receipt, accentColor, onDone }: PublicReceiptProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 text-center">
        <CheckCircle2 className="mx-auto size-10" style={{ color: accentColor }} />
        <h1 className="mt-3 text-lg font-semibold">You are on the list</h1>
        <p className="mt-1 text-sm text-muted-foreground">{receipt.message}</p>

        <div className="mt-5 rounded-lg border bg-muted/40 p-4 text-left">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Reference</p>
          <p className="font-mono text-lg font-semibold">{receipt.reference}</p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">What for</dt>
              <dd className="font-medium">{receipt.resourceTitle}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Places</dt>
              <dd className="font-medium">{receipt.seats}</dd>
            </div>
            {receipt.slotStart && (
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Your slot</dt>
                <dd className="font-medium">{formatDateTime(receipt.slotStart)}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">Payment</dt>
              <dd className="mt-1">
                <StatusBadge
                  color={REGISTRATION_PAYMENT_STATUS_COLORS[receipt.paymentStatus]}
                  label={REGISTRATION_PAYMENT_STATUS_LABELS[receipt.paymentStatus]}
                />
              </dd>
            </div>
            {receipt.paymentStatus !== "NOT_REQUIRED" && (
              <div>
                <dt className="text-xs text-muted-foreground">Amount</dt>
                <dd className="font-medium">
                  {formatAmount(receipt.amount, receipt.currency)}
                </dd>
              </div>
            )}
            {receipt.transactionId && (
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Transaction ID</dt>
                <dd className="font-mono break-all text-xs">{receipt.transactionId}</dd>
              </div>
            )}
          </dl>
        </div>

        <Button variant="outline" className="mt-5 w-full" onClick={onDone}>
          Back to the page
        </Button>
      </div>
    </div>
  );
}
