import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Textarea } from "@/components/ui/textarea";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { roundMoney, toNumber } from "@/lib/trade";
import { useGetGoodsReceiptsQuery } from "@/redux/apis/goodsReceiptApis";
import {
  useCreateLandedCostMutation,
  useUpdateLandedCostMutation,
} from "@/redux/apis/landedCostApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  LANDED_COST_BASES,
  LANDED_COST_BASIS_LABELS,
  LANDED_COST_CATEGORIES,
  LANDED_COST_CATEGORY_LABELS,
  type LandedCost,
  type LandedCostBasis,
  type LandedCostCategory,
} from "@/types/domain/landedCost";
import { Loader2, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface ChargeRow {
  key: string;
  label: string;
  category: LandedCostCategory;
  amount: string;
}

const emptyCharge = (): ChargeRow => ({
  key: `charge-${Math.random().toString(36).slice(2, 10)}`,
  label: "",
  category: "FREIGHT",
  amount: "",
});

interface LandedCostFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cost?: LandedCost | null;
}

export function LandedCostFormModal({ open, onOpenChange, cost }: LandedCostFormModalProps) {
  const isEdit = Boolean(cost);

  const [createCost, { isLoading: isCreating }] = useCreateLandedCostMutation();
  const [updateCost, { isLoading: isUpdating }] = useUpdateLandedCostMutation();
  const isSaving = isCreating || isUpdating;

  const { data: supplierOptions = [] } = useGetSupplierOptionsQuery();
  const { data: receiptResult } = useGetGoodsReceiptsQuery({ status: "RECEIVED", limit: 100 });

  const receipts = receiptResult?.data ?? [];

  const [costDate, setCostDate] = React.useState(new Date().toISOString());
  const [basis, setBasis] = React.useState<LandedCostBasis>("VALUE");
  const [vendorId, setVendorId] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [receiptIds, setReceiptIds] = React.useState<string[]>([]);
  const [charges, setCharges] = React.useState<ChargeRow[]>([emptyCharge()]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;

    setError(null);

    if (cost) {
      setCostDate(cost.costDate);
      setBasis(cost.basis);
      setVendorId(cost.vendorId ?? "");
      setReference(cost.reference);
      setNotes(cost.notes);
      setReceiptIds(cost.goodsReceiptIds);
      setCharges(
        cost.charges.length > 0
          ? cost.charges.map((charge) => ({
              key: charge._id,
              label: charge.label,
              category: charge.category,
              amount: String(charge.amount),
            }))
          : [emptyCharge()]
      );
      return;
    }

    setCostDate(new Date().toISOString());
    setBasis("VALUE");
    setVendorId("");
    setReference("");
    setNotes("");
    setReceiptIds([]);
    setCharges([emptyCharge()]);
  }, [open, cost]);

  const total = roundMoney(charges.reduce((sum, charge) => sum + toNumber(charge.amount), 0));

  const patchCharge = (key: string, patch: Partial<ChargeRow>) =>
    setCharges((previous) =>
      previous.map((charge) => (charge.key === key ? { ...charge, ...patch } : charge))
    );

  const removeCharge = (key: string) =>
    setCharges((previous) => {
      const next = previous.filter((charge) => charge.key !== key);
      return next.length > 0 ? next : [emptyCharge()];
    });

  const toggleReceipt = (receiptId: string) =>
    setReceiptIds((previous) =>
      previous.includes(receiptId)
        ? previous.filter((id) => id !== receiptId)
        : [...previous, receiptId]
    );

  const submit = async (allocate: boolean) => {
    if (receiptIds.length === 0) {
      setError("Pick the goods receipts these costs should be spread over");
      return;
    }

    const rows = charges.filter((charge) => toNumber(charge.amount) > 0);

    if (rows.length === 0) {
      setError("Add at least one charge worth more than zero");
      return;
    }

    setError(null);

    const body = {
      costDate,
      basis,
      vendorId: vendorId || null,
      goodsReceiptIds: receiptIds,
      charges: rows.map((charge) => ({
        label: charge.label,
        category: charge.category,
        amount: toNumber(charge.amount),
      })),
      reference,
      notes,
    };

    try {
      if (cost) {
        await updateCost({ id: cost._id, body }).unwrap();
        toast.success("Landed cost updated");
      } else {
        await createCost({ ...body, allocate }).unwrap();
        toast.success(allocate ? "Landed cost spread across the receipts" : "Draft saved");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const apiError = err as ApiErrorResponse;
      toast.error(apiError?.data?.message || "Could not save the landed cost");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit landed cost" : "New landed cost"}</DialogTitle>
          <DialogDescription>
            Freight, duty and handling folded into what your stock actually cost you. Spreading it
            lifts the average cost of the units you received.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Charged by</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Freight forwarder or agent" />
                </SelectTrigger>
                <SelectContent>
                  {supplierOptions.map((supplier) => (
                    <SelectItem key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Cost date</Label>
              <DatePicker
                value={costDate}
                onValueChange={(value) => setCostDate(value ?? new Date().toISOString())}
                dateOnly
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Spread by</Label>
              <Select value={basis} onValueChange={(value) => setBasis(value as LandedCostBasis)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANDED_COST_BASES.map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {LANDED_COST_BASIS_LABELS[entry]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="landed-reference">Reference</Label>
              <Input
                id="landed-reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Freight invoice or airway bill"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Goods receipts to spread over</Label>
            {receipts.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                Nothing has been booked into stock yet.
              </p>
            ) : (
              <ul className="max-h-60 divide-y overflow-y-auto rounded-lg border">
                {receipts.map((receipt) => (
                  <li key={receipt._id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm">
                      <Checkbox
                        checked={receiptIds.includes(receipt._id)}
                        onCheckedChange={() => toggleReceipt(receipt._id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-xs font-medium uppercase">
                          {receipt.receiptNumber}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {receipt.supplier?.name ?? receipt.supplierName} ·{" "}
                          {formatNumber(receipt.totalQuantity)} units
                        </p>
                      </div>
                      <span className="shrink-0 tabular-nums">
                        {formatAmountValue(receipt.goodsValue)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label>Charges</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCharges((previous) => [...previous, emptyCharge()])}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add charge
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">What it is</th>
                    <th className="w-40 px-2 py-2 text-left font-medium">Category</th>
                    <th className="w-32 px-2 py-2 text-right font-medium">Amount</th>
                    <th className="w-10 px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {charges.map((charge) => (
                    <tr key={charge.key} className="border-t align-middle">
                      <td className="px-3 py-2">
                        <Input
                          className="h-9"
                          value={charge.label}
                          placeholder="Sea freight from Chattogram"
                          onChange={(event) =>
                            patchCharge(charge.key, { label: event.target.value })
                          }
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Select
                          value={charge.category}
                          onValueChange={(value) =>
                            patchCharge(charge.key, { category: value as LandedCostCategory })
                          }
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANDED_COST_CATEGORIES.map((entry) => (
                              <SelectItem key={entry} value={entry}>
                                {LANDED_COST_CATEGORY_LABELS[entry]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          className="h-9 text-right"
                          value={charge.amount}
                          onChange={(event) =>
                            patchCharge(charge.key, { amount: event.target.value })
                          }
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeCharge(charge.key)}
                          aria-label="Remove charge"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <dl className="rounded-lg border bg-muted/30 px-4 py-2 text-sm">
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-muted-foreground">Total to spread</dt>
                  <dd className="font-semibold tabular-nums">{formatAmountValue(total)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anything worth remembering about these costs"
            rows={2}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          {!isEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void submit(false)}
              disabled={isSaving}
            >
              Save as draft
            </Button>
          )}
          <Button type="button" onClick={() => void submit(true)} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Spread across receipts"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
