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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { roundMoney, toNumber } from "@/lib/trade";
import { useRecordSupplierQuoteMutation } from "@/redux/apis/requestForQuoteApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { RequestForQuote } from "@/types/domain/requestForQuote";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface QuoteRow {
  unitPrice: string;
  discount: string;
  taxRate: string;
}

const emptyRow = (): QuoteRow => ({ unitPrice: "", discount: "", taxRate: "" });

const rowTotal = (quantity: number, row: QuoteRow): number => {
  const gross = roundMoney(quantity * Math.max(0, toNumber(row.unitPrice)));
  const discount = Math.min(Math.max(0, toNumber(row.discount)), gross);
  const taxable = gross - discount;
  return roundMoney(taxable + (taxable * Math.max(0, toNumber(row.taxRate))) / 100);
};

interface RecordQuoteDialogProps {
  rfq: RequestForQuote | null;
  onOpenChange: (open: boolean) => void;
}

export function RecordQuoteDialog({ rfq, onOpenChange }: RecordQuoteDialogProps) {
  const [recordQuote, { isLoading }] = useRecordSupplierQuoteMutation();

  const [supplierId, setSupplierId] = React.useState("");
  const [declined, setDeclined] = React.useState(false);
  const [leadTimeDays, setLeadTimeDays] = React.useState("");
  const [note, setNote] = React.useState("");
  const [rows, setRows] = React.useState<Record<string, QuoteRow>>({});
  const [error, setError] = React.useState<string | null>(null);

  const supplier = rfq?.suppliers.find((entry) => entry.supplierId === supplierId) ?? null;

  React.useEffect(() => {
    if (!rfq) return;

    const first =
      rfq.suppliers.find((entry) => entry.status === "INVITED") ?? rfq.suppliers[0] ?? null;

    setSupplierId(first?.supplierId ?? "");
    setDeclined(false);
    setLeadTimeDays("");
    setNote("");
    setError(null);
  }, [rfq]);

  React.useEffect(() => {
    if (!rfq) return;

    const quoted = new Map(
      (supplier?.lines ?? []).map((line) => [
        line.itemId,
        {
          unitPrice: line.unitPrice ? String(line.unitPrice) : "",
          discount: line.discount ? String(line.discount) : "",
          taxRate: line.taxRate ? String(line.taxRate) : "",
        },
      ])
    );

    setRows(
      Object.fromEntries(
        rfq.items.map((item) => [item._id, quoted.get(item._id) ?? emptyRow()])
      )
    );
    setLeadTimeDays(supplier?.leadTimeDays ? String(supplier.leadTimeDays) : "");
    setNote(supplier?.note ?? "");
    setDeclined(supplier?.status === "DECLINED");
  }, [rfq, supplier]);

  const patchRow = (itemId: string, patch: Partial<QuoteRow>) =>
    setRows((previous) => ({
      ...previous,
      [itemId]: { ...(previous[itemId] ?? emptyRow()), ...patch },
    }));

  const total = (rfq?.items ?? []).reduce(
    (sum, item) => sum + rowTotal(item.quantity, rows[item._id] ?? emptyRow()),
    0
  );

  const submit = async () => {
    if (!rfq) return;

    if (!supplierId) {
      setError("Pick which supplier came back to you");
      return;
    }

    const lines = rfq.items
      .filter((item) => toNumber(rows[item._id]?.unitPrice) > 0)
      .map((item) => ({
        itemId: item._id,
        unitPrice: toNumber(rows[item._id]?.unitPrice),
        discount: toNumber(rows[item._id]?.discount),
        taxRate: toNumber(rows[item._id]?.taxRate),
      }));

    if (!declined && lines.length === 0) {
      setError("Enter a price against at least one line");
      return;
    }

    setError(null);

    try {
      await recordQuote({
        id: rfq._id,
        body: {
          supplierId,
          declined,
          leadTimeDays: toNumber(leadTimeDays),
          note,
          ...(declined ? {} : { lines }),
        },
      }).unwrap();
      toast.success("Supplier response recorded");
      onOpenChange(false);
    } catch (err: unknown) {
      const apiError = err as ApiErrorResponse;
      toast.error(apiError?.data?.message || "Could not record the quote");
    }
  };

  return (
    <Dialog open={Boolean(rfq)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Record a quote on {rfq?.rfqNumber ?? ""}</DialogTitle>
          <DialogDescription>
            Put in what one supplier came back with. Award the request once you have the prices you
            need.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Who came back to you" />
                </SelectTrigger>
                <SelectContent>
                  {(rfq?.suppliers ?? []).map((entry) => (
                    <SelectItem key={entry.supplierId} value={entry.supplierId}>
                      {entry.supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rfq-lead-time">Lead time in days</Label>
              <Input
                id="rfq-lead-time"
                type="number"
                min={0}
                value={leadTimeDays}
                onChange={(event) => setLeadTimeDays(event.target.value)}
                placeholder="7"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">They turned it down</p>
              <p className="text-xs text-muted-foreground">
                Record a no-bid so you know not to wait on them.
              </p>
            </div>
            <Switch checked={declined} onCheckedChange={setDeclined} />
          </div>

          {!declined && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Product</th>
                    <th className="w-20 px-2 py-2 text-right font-medium">Qty</th>
                    <th className="w-28 px-2 py-2 text-right font-medium">Unit price</th>
                    <th className="w-24 px-2 py-2 text-right font-medium">Discount</th>
                    <th className="w-20 px-2 py-2 text-right font-medium">Tax %</th>
                    <th className="w-28 px-3 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(rfq?.items ?? []).map((item) => {
                    const row = rows[item._id] ?? emptyRow();
                    return (
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
                        <td className="px-2 py-2">
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            className="h-9 text-right"
                            value={row.unitPrice}
                            onChange={(event) =>
                              patchRow(item._id, { unitPrice: event.target.value })
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            className="h-9 text-right"
                            value={row.discount}
                            onChange={(event) =>
                              patchRow(item._id, { discount: event.target.value })
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step="any"
                            className="h-9 text-right"
                            value={row.taxRate}
                            onChange={(event) =>
                              patchRow(item._id, { taxRate: event.target.value })
                            }
                          />
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatAmountValue(rowTotal(item.quantity, row))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!declined && (
            <div className="flex justify-end">
              <dl className="rounded-lg border bg-muted/30 px-4 py-2 text-sm">
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-muted-foreground">Quoted total</dt>
                  <dd className="font-semibold tabular-nums">{formatAmountValue(total)}</dd>
                </div>
              </dl>
            </div>
          )}

          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Anything the supplier said worth keeping"
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
            Save response
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
