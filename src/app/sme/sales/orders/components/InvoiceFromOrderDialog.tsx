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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber } from "@/lib/amount";
import type { InvoiceFromOrderPayload } from "@/types/domain/salesInvoice";
import type { SalesOrder } from "@/types/domain/salesOrder";
import { Loader2 } from "lucide-react";
import * as React from "react";

interface InvoiceFromOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: SalesOrder | null;
  isLoading?: boolean;
  onSubmit: (payload: InvoiceFromOrderPayload) => void;
}

const today = (): string => new Date().toISOString().slice(0, 10);

const inDays = (days: number): string =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export function InvoiceFromOrderDialog({
  open,
  onOpenChange,
  order,
  isLoading = false,
  onSubmit,
}: InvoiceFromOrderDialogProps) {
  const [invoiceDate, setInvoiceDate] = React.useState(today());
  const [dueDate, setDueDate] = React.useState(inDays(14));
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setInvoiceDate(today());
    setDueDate(inDays(14));
    setError(null);
  }, [open]);

  const submit = () => {
    if (new Date(dueDate) < new Date(invoiceDate)) {
      setError("The due date cannot be before the invoice date");
      return;
    }

    setError(null);
    onSubmit({
      invoiceDate: new Date(invoiceDate).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
    });
  };

  const uninvoiced = order ? order.totalQuantity - order.invoicedQuantity : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invoice {order?.orderNumber ?? ""}</DialogTitle>
          <DialogDescription>
            Everything not yet invoiced on this order is billed. The invoice starts as a draft, so
            you can still adjust it before issuing.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{order?.customerName ?? "—"}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Still to invoice</span>
              <span className="font-medium tabular-nums">{formatNumber(uninvoiced)} units</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="invoice-date">Invoice date</Label>
              <Input
                id="invoice-date"
                type="date"
                value={invoiceDate}
                onChange={(event) => setInvoiceDate(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invoice-due-date">Due date</Label>
              <Input
                id="invoice-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
