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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatAmount } from "@/lib/amount";
import { toNumber } from "@/lib/trade";
import {
  TRADE_PAYMENT_METHODS,
  TRADE_PAYMENT_METHOD_LABELS,
  type TradePaymentMethod,
} from "@/types/domain/trade";
import { Loader2 } from "lucide-react";
import * as React from "react";

interface PosPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  isLoading?: boolean;
  onConfirm: (payload: {
    paymentMethod: TradePaymentMethod;
    amountTendered: number;
    customerName: string;
    customerPhone: string;
  }) => void;
}

const QUICK_CASH = [100, 200, 500, 1000];

export function PosPaymentDialog({
  open,
  onOpenChange,
  total,
  isLoading = false,
  onConfirm,
}: PosPaymentDialogProps) {
  const [method, setMethod] = React.useState<TradePaymentMethod>("CASH");
  const [tendered, setTendered] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setMethod("CASH");
    setTendered("");
    setCustomerName("");
    setCustomerPhone("");
    setError(null);
  }, [open]);

  const isCash = method === "CASH";
  const tenderedValue = tendered === "" ? total : toNumber(tendered);
  const changeDue = Math.max(0, tenderedValue - total);
  const isShort = isCash && tenderedValue < total;

  const submit = () => {
    if (isShort) {
      setError(`That is less than the ${formatAmount(total)} due`);
      return;
    }

    setError(null);
    onConfirm({
      paymentMethod: method,
      amountTendered: isCash ? tenderedValue : total,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Take payment</DialogTitle>
          <DialogDescription>
            Completing the sale issues the invoice and takes the stock off the shelf straight away.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="rounded-lg border bg-muted/40 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Amount due</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{formatAmount(total)}</p>
          </div>

          <div className="grid gap-2">
            <Label>Payment method</Label>
            <Select
              value={method}
              onValueChange={(value) => setMethod(value as TradePaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRADE_PAYMENT_METHODS.filter((option) => option !== "CREDIT").map((option) => (
                  <SelectItem key={option} value={option}>
                    {TRADE_PAYMENT_METHOD_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCash && (
            <div className="grid gap-2">
              <Label htmlFor="pos-tendered">Cash received</Label>
              <Input
                id="pos-tendered"
                value={tendered}
                onChange={(event) => setTendered(event.target.value)}
                placeholder={String(total)}
                inputMode="decimal"
                className="text-right tabular-nums"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTendered(String(total))}
                >
                  Exact
                </Button>
                {QUICK_CASH.filter((note) => note >= total).map((note) => (
                  <Button
                    key={note}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTendered(String(note))}
                  >
                    {note}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Change due</span>
                <span className="font-semibold tabular-nums">{formatAmount(changeDue)}</span>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="pos-customer">Customer (optional)</Label>
              <Input
                id="pos-customer"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Walk-in customer"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pos-phone">Phone (optional)</Label>
              <Input
                id="pos-phone"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="For the receipt"
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
          <Button type="button" onClick={submit} disabled={isLoading || isShort}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
