import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatAmountValue } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { roundMoney, toNumber } from "@/lib/trade";
import { useGetPayableBillsQuery } from "@/redux/apis/billApis";
import { useCreatePaymentMadeMutation } from "@/redux/apis/paymentMadeApis";
import { useGetPurchaseOrdersQuery } from "@/redux/apis/purchaseOrderApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  TRADE_PAYMENT_METHODS,
  TRADE_PAYMENT_METHOD_LABELS,
  type TradePaymentMethod,
} from "@/types/domain/trade";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface PaymentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetSupplierId?: string | null;
  presetBillId?: string | null;
}

export function PaymentFormModal({
  open,
  onOpenChange,
  presetSupplierId,
  presetBillId,
}: PaymentFormModalProps) {
  const [createPayment, { isLoading }] = useCreatePaymentMadeMutation();

  const [supplierId, setSupplierId] = React.useState("");
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString());
  const [method, setMethod] = React.useState<TradePaymentMethod>("BANK_TRANSFER");
  const [amount, setAmount] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [chequeNumber, setChequeNumber] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isAdvance, setIsAdvance] = React.useState(false);
  const [purchaseOrderId, setPurchaseOrderId] = React.useState("");
  const [allocations, setAllocations] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);

  const { data: supplierOptions = [] } = useGetSupplierOptionsQuery();
  const { data: payableBills = [] } = useGetPayableBillsQuery(
    { supplierId },
    { skip: !supplierId }
  );
  const { data: orderResult } = useGetPurchaseOrdersQuery(
    { supplierId, paymentStatus: "UNPAID", limit: 100 },
    { skip: !supplierId || !isAdvance }
  );

  const orders = (orderResult?.data ?? []).filter(
    (order) => order.status !== "DRAFT" && order.status !== "CANCELLED" && order.balanceDue > 0
  );

  React.useEffect(() => {
    if (!open) return;

    setSupplierId(presetSupplierId ?? "");
    setPaymentDate(new Date().toISOString());
    setMethod("BANK_TRANSFER");
    setAmount("");
    setReference("");
    setChequeNumber("");
    setNotes("");
    setIsAdvance(false);
    setPurchaseOrderId("");
    setAllocations({});
    setError(null);
  }, [open, presetSupplierId]);

  React.useEffect(() => {
    if (!open || !presetBillId) return;
    const bill = payableBills.find((row) => row._id === presetBillId);
    if (!bill) return;
    setAllocations({ [bill._id]: String(bill.amountDue) });
    setAmount(String(bill.amountDue));
  }, [open, presetBillId, payableBills]);

  const allocated = roundMoney(
    payableBills.reduce((sum, bill) => sum + toNumber(allocations[bill._id]), 0)
  );
  const unapplied = roundMoney(Math.max(0, toNumber(amount) - allocated));

  const autoAllocate = () => {
    let left = toNumber(amount);
    const next: Record<string, string> = {};

    for (const bill of payableBills) {
      if (left <= 0) break;
      const take = Math.min(left, bill.amountDue);
      if (take > 0) next[bill._id] = String(roundMoney(take));
      left = roundMoney(left - take);
    }

    setAllocations(next);
  };

  const submit = async () => {
    if (!supplierId) {
      setError("Pick who you are paying");
      return;
    }

    const value = toNumber(amount);

    if (value <= 0) {
      setError("A payment has to be greater than zero");
      return;
    }

    if (isAdvance && !purchaseOrderId) {
      setError("Pick the order this advance is against");
      return;
    }

    if (!isAdvance && allocated > value) {
      setError("You have spread more across bills than the payment is worth");
      return;
    }

    setError(null);

    try {
      await createPayment({
        supplierId,
        paymentDate,
        method,
        amount: value,
        reference,
        chequeNumber,
        notes,
        ...(isAdvance
          ? { purchaseOrderId }
          : {
              allocations: payableBills
                .filter((bill) => toNumber(allocations[bill._id]) > 0)
                .map((bill) => ({
                  billId: bill._id,
                  amount: toNumber(allocations[bill._id]),
                })),
            }),
      }).unwrap();
      toast.success("Payment recorded");
      onOpenChange(false);
    } catch (err: unknown) {
      const apiError = err as ApiErrorResponse;
      toast.error(apiError?.data?.message || "Could not record the payment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>
            Money going out to a supplier. Spread it across the bills it settles, or park it as an
            advance on an order.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Who you are paying" />
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
              <Label>Paid on</Label>
              <DatePicker
                value={paymentDate}
                onValueChange={(value) => setPaymentDate(value ?? new Date().toISOString())}
                dateOnly
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>How you paid</Label>
              <Select
                value={method}
                onValueChange={(value) => setMethod(value as TradePaymentMethod)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRADE_PAYMENT_METHODS.map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {TRADE_PAYMENT_METHOD_LABELS[entry]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payment-amount">Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                min={0}
                step="any"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payment-reference">Reference</Label>
              <Input
                id="payment-reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Transfer or receipt reference"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payment-cheque">Cheque number</Label>
              <Input
                id="payment-cheque"
                value={chequeNumber}
                onChange={(event) => setChequeNumber(event.target.value)}
                placeholder="Only if you paid by cheque"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">This is an advance on an order</p>
              <p className="text-xs text-muted-foreground">
                Money paid before the supplier has billed you.
              </p>
            </div>
            <Switch checked={isAdvance} onCheckedChange={setIsAdvance} />
          </div>

          {isAdvance ? (
            <div className="flex flex-col gap-1.5">
              <Label>Purchase order</Label>
              <Select value={purchaseOrderId} onValueChange={setPurchaseOrderId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Which order the advance is against" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order._id} value={order._id}>
                      {order.orderNumber} · {formatAmountValue(order.balanceDue)} outstanding
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {supplierId && orders.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  This supplier has no open order with anything left to pay.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label>Bills this settles</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={autoAllocate}
                  disabled={payableBills.length === 0 || toNumber(amount) <= 0}
                >
                  Spread it for me
                </Button>
              </div>

              {!supplierId ? (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  Pick a supplier and their open bills appear here.
                </p>
              ) : payableBills.length === 0 ? (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  Nothing is outstanding with this supplier.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Bill</th>
                        <th className="w-28 px-2 py-2 text-right font-medium">Due</th>
                        <th className="w-28 px-2 py-2 text-right font-medium">Outstanding</th>
                        <th className="w-32 px-3 py-2 text-right font-medium">Paying now</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payableBills.map((bill) => (
                        <tr key={bill._id} className="border-t align-middle">
                          <td className="px-3 py-2">
                            <p className="truncate font-mono text-xs font-medium uppercase">
                              {bill.billNumber}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {bill.supplierInvoiceNumber || formatDate(bill.billDate)}
                            </p>
                          </td>
                          <td className="px-2 py-2 text-right text-xs">
                            {bill.dueDate ? formatDate(bill.dueDate) : "—"}
                            {bill.isOverdue && (
                              <span className="block text-destructive">Overdue</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-right tabular-nums">
                            {formatAmountValue(bill.amountDue)}
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={0}
                              max={bill.amountDue}
                              step="any"
                              className="h-9 text-right"
                              value={allocations[bill._id] ?? ""}
                              onChange={(event) =>
                                setAllocations((previous) => ({
                                  ...previous,
                                  [bill._id]: event.target.value,
                                }))
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end">
                <dl className="rounded-lg border bg-muted/30 px-4 py-2 text-sm">
                  <div className="flex items-center justify-between gap-6">
                    <dt className="text-muted-foreground">Spread across bills</dt>
                    <dd className="tabular-nums">{formatAmountValue(allocated)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <dt className="text-muted-foreground">Left unapplied</dt>
                    <dd className="font-semibold tabular-nums">{formatAmountValue(unapplied)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anything worth remembering about this payment"
            rows={2}
          />

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
            Record payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
