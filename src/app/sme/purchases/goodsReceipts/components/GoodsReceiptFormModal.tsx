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
import { Textarea } from "@/components/ui/textarea";
import { formatNumber } from "@/lib/amount";
import { toNumber } from "@/lib/trade";
import {
  useCreateGoodsReceiptMutation,
  useUpdateGoodsReceiptMutation,
} from "@/redux/apis/goodsReceiptApis";
import {
  useGetPurchaseOrderQuery,
  useGetPurchaseOrdersQuery,
} from "@/redux/apis/purchaseOrderApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  GOODS_RECEIPT_QUALITY_LABELS,
  GOODS_RECEIPT_QUALITY_RESULTS,
  type GoodsReceipt,
  type GoodsReceiptQualityResult,
} from "@/types/domain/goodsReceipt";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface LineState {
  quantity: string;
  rejectedQuantity: string;
}

interface GoodsReceiptFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt?: GoodsReceipt | null;
  presetOrderId?: string | null;
}

export function GoodsReceiptFormModal({
  open,
  onOpenChange,
  receipt,
  presetOrderId,
}: GoodsReceiptFormModalProps) {
  const isEdit = Boolean(receipt);

  const [createReceipt, { isLoading: isCreating }] = useCreateGoodsReceiptMutation();
  const [updateReceipt, { isLoading: isUpdating }] = useUpdateGoodsReceiptMutation();
  const isSaving = isCreating || isUpdating;

  const [orderId, setOrderId] = React.useState("");
  const [receiptDate, setReceiptDate] = React.useState(new Date().toISOString());
  const [qualityResult, setQualityResult] = React.useState<GoodsReceiptQualityResult>("PENDING");
  const [deliveryNote, setDeliveryNote] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [lines, setLines] = React.useState<Record<string, LineState>>({});
  const [error, setError] = React.useState<string | null>(null);

  const { data: openOrders } = useGetPurchaseOrdersQuery({ limit: 100, status: "ORDERED" });
  const { data: partialOrders } = useGetPurchaseOrdersQuery({
    limit: 100,
    status: "PARTIALLY_RECEIVED",
  });

  const selectableOrders = React.useMemo(
    () => [...(openOrders?.data ?? []), ...(partialOrders?.data ?? [])],
    [openOrders, partialOrders]
  );

  const { data: order, isFetching: isLoadingOrder } = useGetPurchaseOrderQuery(orderId, {
    skip: !orderId,
  });

  React.useEffect(() => {
    if (!open) return;

    setError(null);

    if (receipt) {
      setOrderId(receipt.purchaseOrderId);
      setReceiptDate(receipt.receiptDate);
      setQualityResult(receipt.qualityResult);
      setDeliveryNote(receipt.supplierDeliveryNote);
      setReference(receipt.reference);
      setNotes(receipt.notes);
      return;
    }

    setOrderId(presetOrderId ?? "");
    setReceiptDate(new Date().toISOString());
    setQualityResult("PENDING");
    setDeliveryNote("");
    setReference("");
    setNotes("");
    setLines({});
  }, [open, receipt, presetOrderId]);

  React.useEffect(() => {
    if (!open || !order) return;

    const booked = new Map(
      (receipt?.items ?? []).map((item) => [
        item.orderItemId ?? "",
        {
          quantity: String(item.quantity),
          rejectedQuantity: item.rejectedQuantity ? String(item.rejectedQuantity) : "",
        },
      ])
    );

    setLines(
      Object.fromEntries(
        order.items.map((item) => [
          item._id,
          booked.get(item._id) ?? {
            quantity: item.pendingQuantity > 0 ? String(item.pendingQuantity) : "",
            rejectedQuantity: "",
          },
        ])
      )
    );
  }, [open, order, receipt]);

  const patchLine = (itemId: string, patch: Partial<LineState>) =>
    setLines((previous) => ({
      ...previous,
      [itemId]: { ...(previous[itemId] ?? { quantity: "", rejectedQuantity: "" }), ...patch },
    }));

  const submit = async (post: boolean) => {
    if (!orderId) {
      setError("Pick the purchase order this delivery is against");
      return;
    }

    const items = (order?.items ?? [])
      .filter((item) => toNumber(lines[item._id]?.quantity) > 0)
      .map((item) => ({
        orderItemId: item._id,
        quantity: toNumber(lines[item._id]?.quantity),
        rejectedQuantity: toNumber(lines[item._id]?.rejectedQuantity),
      }));

    if (items.length === 0) {
      setError("Enter what actually arrived on at least one line");
      return;
    }

    const overshoot = (order?.items ?? []).find((item) => {
      const asked = toNumber(lines[item._id]?.quantity);
      const allowance = receipt
        ? item.pendingQuantity +
          (receipt.items.find((line) => line.orderItemId === item._id)?.quantity ?? 0)
        : item.pendingQuantity;
      return asked > allowance;
    });

    if (overshoot) {
      setError(`Only ${formatNumber(overshoot.pendingQuantity)} of ${overshoot.name} is still due`);
      return;
    }

    setError(null);

    try {
      if (receipt) {
        await updateReceipt({
          id: receipt._id,
          body: {
            receiptDate,
            items,
            qualityResult,
            supplierDeliveryNote: deliveryNote,
            reference,
            notes,
          },
        }).unwrap();
        toast.success("Receipt updated");
      } else {
        await createReceipt({
          purchaseOrderId: orderId,
          receiptDate,
          items,
          qualityResult,
          supplierDeliveryNote: deliveryNote,
          reference,
          notes,
          post,
        }).unwrap();
        toast.success(post ? "Stock booked in" : "Draft receipt saved");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const apiError = err as ApiErrorResponse;
      toast.error(apiError?.data?.message || "Could not save the receipt");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goods receipt" : "Book in a delivery"}</DialogTitle>
          <DialogDescription>
            Record exactly what turned up against a purchase order. Stock only moves once you book
            it in.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Purchase order</Label>
              <Select value={orderId} onValueChange={setOrderId} disabled={isEdit}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Which order this is against" />
                </SelectTrigger>
                <SelectContent>
                  {selectableOrders.map((candidate) => (
                    <SelectItem key={candidate._id} value={candidate._id}>
                      {candidate.orderNumber} · {candidate.supplier?.name ?? candidate.supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectableOrders.length === 0 && !isEdit && (
                <p className="text-xs text-muted-foreground">
                  No orders are waiting on a delivery. Place one under Purchases · Purchase Orders.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Arrived on</Label>
              <DatePicker
                value={receiptDate}
                onValueChange={(value) => setReceiptDate(value ?? new Date().toISOString())}
                dateOnly
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grn-delivery-note">Supplier delivery note</Label>
              <Input
                id="grn-delivery-note"
                value={deliveryNote}
                onChange={(event) => setDeliveryNote(event.target.value)}
                placeholder="DN-40192"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Quality check</Label>
              <Select
                value={qualityResult}
                onValueChange={(value) => setQualityResult(value as GoodsReceiptQualityResult)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOODS_RECEIPT_QUALITY_RESULTS.map((result) => (
                    <SelectItem key={result} value={result}>
                      {GOODS_RECEIPT_QUALITY_LABELS[result]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="grn-reference">Reference</Label>
              <Input
                id="grn-reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Container or consignment number"
              />
            </div>
          </div>

          {isLoadingOrder ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading the order…</p>
          ) : order ? (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Product</th>
                    <th className="w-24 px-2 py-2 text-right font-medium">Ordered</th>
                    <th className="w-24 px-2 py-2 text-right font-medium">Still due</th>
                    <th className="w-28 px-2 py-2 text-right font-medium">Arrived</th>
                    <th className="w-28 px-3 py-2 text-right font-medium">Rejected</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item._id} className="border-t align-middle">
                      <td className="px-3 py-2">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="truncate font-mono text-[10px] uppercase text-muted-foreground">
                          {item.sku}
                        </p>
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {formatNumber(item.quantity)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                        {formatNumber(item.pendingQuantity)}
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          className="h-9 text-right"
                          value={lines[item._id]?.quantity ?? ""}
                          onChange={(event) =>
                            patchLine(item._id, { quantity: event.target.value })
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          className="h-9 text-right"
                          value={lines[item._id]?.rejectedQuantity ?? ""}
                          onChange={(event) =>
                            patchLine(item._id, { rejectedQuantity: event.target.value })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              Pick a purchase order and its outstanding lines appear here.
            </p>
          )}

          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anything about the delivery worth remembering"
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
            {isEdit ? "Save changes" : "Book into stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
