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
import { formatAmountValue } from "@/lib/amount";
import { toNumber } from "@/lib/trade";
import { useGetPayableBillsQuery } from "@/redux/apis/billApis";
import { useApplyDebitNoteMutation } from "@/redux/apis/debitNoteApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { DebitNote } from "@/types/domain/debitNote";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface ApplyDebitNoteDialogProps {
  note: DebitNote | null;
  onOpenChange: (open: boolean) => void;
}

export function ApplyDebitNoteDialog({ note, onOpenChange }: ApplyDebitNoteDialogProps) {
  const [applyNote, { isLoading }] = useApplyDebitNoteMutation();
  const [billId, setBillId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const { data: payableBills = [] } = useGetPayableBillsQuery(
    { supplierId: note?.supplierId ?? "" },
    { skip: !note }
  );

  React.useEffect(() => {
    if (!note) return;
    setBillId("");
    setAmount(String(note.balance));
    setError(null);
  }, [note]);

  const bill = payableBills.find((row) => row._id === billId) ?? null;

  const submit = async () => {
    if (!note) return;

    if (!billId) {
      setError("Pick which bill this comes off");
      return;
    }

    const value = toNumber(amount);

    if (value <= 0) {
      setError("Enter an amount greater than zero");
      return;
    }
    if (value > note.balance) {
      setError(`Only ${formatAmountValue(note.balance)} is left on this note`);
      return;
    }
    if (bill && value > bill.amountDue) {
      setError(`Only ${formatAmountValue(bill.amountDue)} is outstanding on ${bill.billNumber}`);
      return;
    }

    setError(null);

    try {
      await applyNote({ id: note._id, body: { billId, amount: value } }).unwrap();
      toast.success(`${note.debitNoteNumber} set against the bill`);
      onOpenChange(false);
    } catch (err: unknown) {
      const apiError = err as ApiErrorResponse;
      toast.error(apiError?.data?.message || "Could not apply the debit note");
    }
  };

  return (
    <Dialog open={Boolean(note)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Set {note?.debitNoteNumber ?? ""} against a bill</DialogTitle>
          <DialogDescription>
            Knock what the supplier owes you off what you owe them, so the bill settles for less.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Bill</Label>
            <Select value={billId} onValueChange={setBillId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Which bill this comes off" />
              </SelectTrigger>
              <SelectContent>
                {payableBills.map((row) => (
                  <SelectItem key={row._id} value={row._id}>
                    {row.billNumber} · {formatAmountValue(row.amountDue)} outstanding
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {payableBills.length === 0 && (
              <p className="text-xs text-muted-foreground">
                This supplier has no open bill to set the note against.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="debit-note-amount">Amount</Label>
            <Input
              id="debit-note-amount"
              type="number"
              min={0}
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {formatAmountValue(note?.balance)} still to claim on this note.
            </p>
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
            Apply to the bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
