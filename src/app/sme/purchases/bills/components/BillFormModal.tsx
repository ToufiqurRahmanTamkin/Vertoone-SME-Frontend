import { DocumentItems } from "@/components/shared/document-items";
import { FormDate, FormInput, FormSelect, FormTextarea } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import {
  emptyCharges,
  emptyLine,
  lineError,
  toItemPayload,
  type DocumentCharges,
  type DocumentLine,
} from "@/lib/trade";
import { useCreateBillMutation, useUpdateBillMutation } from "@/redux/apis/billApis";
import { useGetGoodsReceiptsQuery } from "@/redux/apis/goodsReceiptApis";
import { useGetProductPricingOptionsQuery } from "@/redux/apis/productApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Bill, BillPayload } from "@/types/domain/bill";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const BillSchema = z.object({
  supplierId: z.string().min(1, "Pick who billed you"),
  supplierInvoiceNumber: z.string().trim().max(80),
  billDate: z.string().min(1, "A bill needs a date"),
  dueDate: z.string(),
  reference: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
  terms: z.string().trim().max(2000),
});

type BillFormValues = z.infer<typeof BillSchema>;

interface BillFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: Bill | null;
  presetSupplierId?: string | null;
  presetReceiptIds?: readonly string[] | null;
}

const emptyValues = (): BillFormValues => ({
  supplierId: "",
  supplierInvoiceNumber: "",
  billDate: new Date().toISOString(),
  dueDate: "",
  reference: "",
  notes: "",
  terms: "",
});

export function BillFormModal({
  open,
  onOpenChange,
  bill,
  presetSupplierId,
  presetReceiptIds,
}: BillFormModalProps) {
  const isEdit = Boolean(bill);

  const [createBill, { isLoading: isCreating }] = useCreateBillMutation();
  const [updateBill, { isLoading: isUpdating }] = useUpdateBillMutation();
  const isSaving = isCreating || isUpdating;

  const { data: supplierOptions = [] } = useGetSupplierOptionsQuery();
  const { data: products = [] } = useGetProductPricingOptionsQuery();

  const [fromReceipts, setFromReceipts] = React.useState(true);
  const [receiptIds, setReceiptIds] = React.useState<string[]>([]);
  const [lines, setLines] = React.useState<DocumentLine[]>([emptyLine()]);
  const [charges, setCharges] = React.useState<DocumentCharges>(emptyCharges());
  const [linesError, setLinesError] = React.useState<string | null>(null);

  const form = useForm<BillFormValues>({
    resolver: zodResolver(BillSchema),
    defaultValues: emptyValues(),
  });

  const supplierId = form.watch("supplierId");

  const { data: receiptResult } = useGetGoodsReceiptsQuery(
    { supplierId, status: "RECEIVED", billed: "no", limit: 100 },
    { skip: !supplierId || isEdit }
  );

  const receipts = receiptResult?.data ?? [];

  React.useEffect(() => {
    if (!open) return;

    setLinesError(null);

    if (bill) {
      form.reset({
        supplierId: bill.supplierId,
        supplierInvoiceNumber: bill.supplierInvoiceNumber,
        billDate: bill.billDate,
        dueDate: bill.dueDate ?? "",
        reference: bill.reference,
        notes: bill.notes,
        terms: bill.terms,
      });
      setFromReceipts(bill.goodsReceiptIds.length > 0);
      setReceiptIds(bill.goodsReceiptIds);
      setLines(
        bill.items.length > 0
          ? bill.items.map((item) => ({
              key: item._id,
              productId: item.productId,
              quantity: String(item.quantity),
              unitPrice: String(item.unitPrice),
              discount: item.discount ? String(item.discount) : "",
              taxRate: item.taxRate ? String(item.taxRate) : "",
            }))
          : [emptyLine()]
      );
      setCharges({
        discountAmount: bill.discountAmount ? String(bill.discountAmount) : "",
        shippingCost: bill.shippingCost ? String(bill.shippingCost) : "",
        roundOff: bill.roundOff ? String(bill.roundOff) : "",
      });
      return;
    }

    form.reset({ ...emptyValues(), supplierId: presetSupplierId ?? "" });
    setFromReceipts(true);
    setReceiptIds(presetReceiptIds ? [...presetReceiptIds] : []);
    setLines([emptyLine()]);
    setCharges(emptyCharges());
  }, [open, bill, presetSupplierId, presetReceiptIds, form]);

  const toggleReceipt = (receiptId: string) =>
    setReceiptIds((previous) =>
      previous.includes(receiptId)
        ? previous.filter((id) => id !== receiptId)
        : [...previous, receiptId]
    );

  const onSubmit = async (values: BillFormValues, post: boolean) => {
    const useReceipts = fromReceipts && !isEdit;

    if (useReceipts && receiptIds.length === 0) {
      setLinesError("Pick at least one goods receipt this bill covers");
      return;
    }

    if (!useReceipts) {
      const problem = lineError(lines);
      setLinesError(problem);
      if (problem) return;
    } else {
      setLinesError(null);
    }

    const body: BillPayload = {
      supplierId: values.supplierId,
      supplierInvoiceNumber: values.supplierInvoiceNumber,
      billDate: values.billDate,
      dueDate: values.dueDate || null,
      reference: values.reference,
      notes: values.notes,
      terms: values.terms,
      discountAmount: Number(charges.discountAmount) || 0,
      shippingCost: Number(charges.shippingCost) || 0,
      roundOff: Number(charges.roundOff) || 0,
      ...(useReceipts
        ? { goodsReceiptIds: receiptIds }
        : { items: toItemPayload(lines), goodsReceiptIds: [] }),
      post,
    };

    try {
      if (bill) {
        await updateBill({ id: bill._id, body }).unwrap();
        toast.success("Bill updated");
      } else {
        await createBill(body).unwrap();
        toast.success(post ? "Bill posted to your payables" : "Draft bill saved");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the bill");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit bill" : "New supplier bill"}</DialogTitle>
          <DialogDescription>
            The invoice your supplier sent. Match it to what you actually received so nothing gets
            paid twice.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit((values) => onSubmit(values, true))}
          >
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="supplierId"
                  label="Supplier"
                  placeholder="Who sent you this invoice"
                  disabled={isEdit}
                  options={supplierOptions.map((supplier) => ({
                    label: `${supplier.name} (${supplier.code})`,
                    value: supplier._id,
                  }))}
                />
                <FormInput
                  control={form.control}
                  name="supplierInvoiceNumber"
                  label="Their invoice number"
                  placeholder="INV-99213"
                />
                <FormDate control={form.control} name="billDate" label="Bill date" dateOnly />
                <FormDate control={form.control} name="dueDate" label="Due date" dateOnly />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Anything that ties this back to the order"
                  className="sm:col-span-2"
                />
              </div>

              {!isEdit && (
                <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Bill against goods receipts</p>
                    <p className="text-xs text-muted-foreground">
                      Lines and costs come straight from what you booked in.
                    </p>
                  </div>
                  <Checkbox
                    checked={fromReceipts}
                    onCheckedChange={(checked) => setFromReceipts(checked === true)}
                  />
                </div>
              )}

              {fromReceipts && !isEdit ? (
                <div className="flex flex-col gap-2">
                  <Label>Goods receipts to bill</Label>
                  {!supplierId ? (
                    <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                      Pick a supplier and their unbilled receipts appear here.
                    </p>
                  ) : receipts.length === 0 ? (
                    <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                      Nothing from this supplier is waiting to be billed.
                    </p>
                  ) : (
                    <ul className="divide-y rounded-lg border">
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
                                {receipt.purchaseOrderNumber} ·{" "}
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
              ) : (
                <DocumentItems
                  lines={lines}
                  onLinesChange={setLines}
                  products={products}
                  priceField="purchasePrice"
                  charges={charges}
                  onChargesChange={setCharges}
                  error={linesError}
                  lockProducts={isEdit && bill ? bill.goodsReceiptIds.length > 0 : false}
                  emptyHint="Prices default to each product's purchase price."
                />
              )}

              {fromReceipts && !isEdit && linesError && (
                <p className="text-sm text-destructive">{linesError}</p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormTextarea
                  control={form.control}
                  name="terms"
                  label="Terms"
                  placeholder="Payment terms on the invoice"
                />
                <FormTextarea
                  control={form.control}
                  name="notes"
                  label="Notes"
                  placeholder="Anything internal worth remembering"
                />
              </div>
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
                  disabled={isSaving}
                  onClick={form.handleSubmit((values) => onSubmit(values, false))}
                >
                  Save as draft
                </Button>
              )}
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Post to payables"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
