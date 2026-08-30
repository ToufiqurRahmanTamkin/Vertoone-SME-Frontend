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
import { Separator } from "@/components/ui/separator";
import { formatAmount, formatNumber } from "@/lib/amount";
import type { PosSaleResult } from "@/types/domain/pos";
import { CheckCircle2 } from "lucide-react";

interface PosReceiptDialogProps {
  sale: PosSaleResult | null;
  onClose: () => void;
}

export function PosReceiptDialog({ sale, onClose }: PosReceiptDialogProps) {
  const invoice = sale?.invoice;

  return (
    <Dialog open={Boolean(sale)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            Sale complete
          </DialogTitle>
          <DialogDescription>
            {invoice?.invoiceNumber} has been issued and the stock is off the shelf.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="rounded-lg border p-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Change due</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {formatAmount(sale?.changeDue ?? 0)}
              </p>
            </div>

            <Separator className="my-3" />

            <ul className="space-y-1 text-sm">
              {(invoice?.items ?? []).map((item) => (
                <li key={item._id} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate">
                    {formatNumber(item.quantity)} × {item.name}
                  </span>
                  <span className="tabular-nums">{formatAmount(item.total)}</span>
                </li>
              ))}
            </ul>

            <Separator className="my-3" />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold tabular-nums">
                  {formatAmount(invoice?.grandTotal ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tendered</span>
                <span className="tabular-nums">{formatAmount(sale?.amountTendered ?? 0)}</span>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => window.print()}>
            Print receipt
          </Button>
          <Button onClick={onClose}>New sale</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
