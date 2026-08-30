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
  type RecordPaymentPayload,
  type TradePaymentMethod,
} from "@/types/domain/trade";
import { Loader2 } from "lucide-react";
import * as React from "react";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  outstanding: number;
  isLoading?: boolean;
  confirmText?: string;
  showMethod?: boolean;
  amountLabel?: string;
  referenceLabel?: string;
  onSubmit: (payload: RecordPaymentPayload) => void;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  title,
  description,
  outstanding,
  isLoading = false,
  confirmText = "Record payment",
  showMethod = true,
  amountLabel = "Amount",
  referenceLabel = "Reference",
  onSubmit,
}: RecordPaymentDialogProps) {
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState<TradePaymentMethod>("CASH");
  const [reference, setReference] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setAmount(outstanding > 0 ? String(outstanding) : "");
    setMethod("CASH");
    setReference("");
    setError(null);
  }, [open, outstanding]);

  const handleSubmit = () => {
    const value = toNumber(amount);

    if (value <= 0) {
      setError("Enter an amount greater than zero");
      return;
    }
    if (value > outstanding) {
      setError(`Only ${formatAmount(outstanding)} is still outstanding`);
      return;
    }

    setError(null);
    onSubmit({ amount: value, method, reference });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Outstanding</span>
            <span className="float-right font-semibold tabular-nums">
              {formatAmount(outstanding)}
            </span>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            {amountLabel}
            <Input
              type="number"
              min={0}
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>

          {showMethod && (
            <label className="flex flex-col gap-1.5 text-sm">
              Method
              <Select
                value={method}
                onValueChange={(value) => setMethod(value as TradePaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRADE_PAYMENT_METHODS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {TRADE_PAYMENT_METHOD_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          )}

          <label className="flex flex-col gap-1.5 text-sm">
            {referenceLabel}
            <Input
              placeholder="Transaction or cheque number"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </label>

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
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
