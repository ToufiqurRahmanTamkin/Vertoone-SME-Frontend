import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatAmount } from "@/lib/amount";
import type { PublicOrderReceipt as Receipt } from "@/types/domain/publicShop";
import { CheckCircle2, Mail, Phone } from "lucide-react";

interface PublicOrderReceiptProps {
  receipt: Receipt;
  onContinue: () => void;
}

export function PublicOrderReceipt({ receipt, onContinue }: PublicOrderReceiptProps) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
        <h1 className="mt-3 text-xl font-semibold">Thank you, {receipt.customerName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your order is with {receipt.shopName}. We will call you to confirm before delivery.
        </p>

        <p className="mt-4 inline-flex rounded-full border px-3 py-1 font-mono text-sm uppercase">
          {receipt.orderNumber}
        </p>

        <Separator className="my-5" />

        <ul className="space-y-1 text-left text-sm">
          {receipt.items.map((item, index) => (
            <li key={`${item.name}-${index}`} className="flex justify-between gap-2">
              <span className="min-w-0 truncate">
                {item.quantity} × {item.name}
              </span>
              <span className="tabular-nums">{formatAmount(item.total, receipt.currency)}</span>
            </li>
          ))}
        </ul>

        <Separator className="my-3" />

        <div className="space-y-1 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatAmount(receipt.subTotal, receipt.currency)}</span>
          </div>
          {receipt.taxTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="tabular-nums">
                {formatAmount(receipt.taxTotal, receipt.currency)}
              </span>
            </div>
          )}
          {receipt.deliveryCharge > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="tabular-nums">
                {formatAmount(receipt.deliveryCharge, receipt.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>Total to pay</span>
            <span className="tabular-nums">
              {formatAmount(receipt.grandTotal, receipt.currency)}
            </span>
          </div>
        </div>

        <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-left text-sm text-muted-foreground">
          {receipt.paymentNote}
        </p>

        {(receipt.contactPhone || receipt.contactEmail) && (
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            {receipt.contactPhone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {receipt.contactPhone}
              </span>
            )}
            {receipt.contactEmail && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {receipt.contactEmail}
              </span>
            )}
          </div>
        )}

        <Button className="mt-6 w-full" onClick={onContinue}>
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
