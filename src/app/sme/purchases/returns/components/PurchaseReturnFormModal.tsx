import { DocumentItems } from "@/components/shared/document-items";
import { FormDate, FormInput, FormSelect, FormTextarea } from "@/components/shared/form-fields";
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
import { Form } from "@/components/ui/form";
import {
  emptyCharges,
  emptyLine,
  lineError,
  toNumber,
  type DocumentCharges,
  type DocumentLine,
} from "@/lib/trade";
import { useGetProductPricingOptionsQuery } from "@/redux/apis/productApis";
import {
  useGetPurchaseOrderQuery,
  useGetPurchaseOrdersQuery,
} from "@/redux/apis/purchaseOrderApis";
import {
  useCreatePurchaseReturnMutation,
  useUpdatePurchaseReturnMutation,
} from "@/redux/apis/purchaseReturnApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PURCHASE_RETURN_REASONS,
  PURCHASE_RETURN_REASON_LABELS,
  PURCHASE_RETURN_SETTLEMENTS,
  PURCHASE_RETURN_SETTLEMENT_LABELS,
  type PurchaseReturn,
  type PurchaseReturnPayload,
} from "@/types/domain/purchaseReturn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ReturnSchema = z.object({
  supplierId: z.string().min(1, "Pick who the stock goes back to"),
  warehouseId: z.string().min(1, "Pick where the stock is leaving from"),
  purchaseOrderId: z.string(),
  returnDate: z.string().min(1, "A return needs a date"),
  reason: z.enum(PURCHASE_RETURN_REASONS),
  settlement: z.enum(PURCHASE_RETURN_SETTLEMENTS),
  reference: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
});

type ReturnFormValues = z.infer<typeof ReturnSchema>;

interface PurchaseReturnFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseReturn?: PurchaseReturn | null;
}

const REASON_OPTIONS = PURCHASE_RETURN_REASONS.map((reason) => ({
  label: PURCHASE_RETURN_REASON_LABELS[reason],
  value: reason,
}));

const SETTLEMENT_OPTIONS = PURCHASE_RETURN_SETTLEMENTS.map((settlement) => ({
  label: PURCHASE_RETURN_SETTLEMENT_LABELS[settlement],
  value: settlement,
}));

const emptyValues = (): ReturnFormValues => ({
  supplierId: "",
  warehouseId: "",
  purchaseOrderId: "",
  returnDate: new Date().toISOString(),
  reason: "DAMAGED",
  settlement: "CREDIT_NOTE",
  reference: "",
  notes: "",
});

export function PurchaseReturnFormModal({
  open,
  onOpenChange,
  purchaseReturn,
}: PurchaseReturnFormModalProps) {
  const isEdit = Boolean(purchaseReturn);

  const [createReturn, { isLoading: isCreating }] = useCreatePurchaseReturnMutation();
  const [updateReturn, { isLoading: isUpdating }] = useUpdatePurchaseReturnMutation();
  const isSaving = isCreating || isUpdating;

  const { data: supplierOptions = [] } = useGetSupplierOptionsQuery();
  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();
  const { data: products = [] } = useGetProductPricingOptionsQuery();

  const [lines, setLines] = React.useState<DocumentLine[]>([emptyLine()]);
  const [charges, setCharges] = React.useState<DocumentCharges>(emptyCharges());
  const [linesError, setLinesError] = React.useState<string | null>(null);
  const [loadedOrderId, setLoadedOrderId] = React.useState<string>("");

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(ReturnSchema),
    defaultValues: emptyValues(),
  });

  const supplierId = useWatch({ control: form.control, name: "supplierId" });
  const purchaseOrderId = useWatch({ control: form.control, name: "purchaseOrderId" });

  const { data: orderList } = useGetPurchaseOrdersQuery(
    { supplierId, limit: 100 },
    { skip: !supplierId }
  );

  const { data: sourceOrder } = useGetPurchaseOrderQuery(purchaseOrderId, {
    skip: !purchaseOrderId,
  });

  const supplierChoices = React.useMemo(
    () =>
      supplierOptions.map((supplier) => ({
        label: `${supplier.name} (${supplier.code})`,
        value: supplier._id,
      })),
    [supplierOptions]
  );

  const warehouseChoices = React.useMemo(
    () =>
      warehouseOptions.map((warehouse) => ({
        label: `${warehouse.name} (${warehouse.code})`,
        value: warehouse._id,
      })),
    [warehouseOptions]
  );

  const orderChoices = React.useMemo(
    () => [
      { label: "Not linked to an order", value: "" },
      ...(orderList?.data ?? [])
        .filter((order) => order.receivedQuantity > 0)
        .map((order) => ({
          label: `${order.orderNumber} · ${order.warehouse?.name ?? ""}`,
          value: order._id,
        })),
    ],
    [orderList]
  );

  React.useEffect(() => {
    if (!open) return;

    setLinesError(null);

    if (purchaseReturn) {
      form.reset({
        supplierId: purchaseReturn.supplierId,
        warehouseId: purchaseReturn.warehouseId,
        purchaseOrderId: purchaseReturn.purchaseOrderId ?? "",
        returnDate: purchaseReturn.returnDate,
        reason: purchaseReturn.reason,
        settlement: purchaseReturn.settlement,
        reference: purchaseReturn.reference,
        notes: purchaseReturn.notes,
      });
      setLines(
        purchaseReturn.items.map((item) => ({
          key: item._id,
          productId: item.productId,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
          discount: item.discount ? String(item.discount) : "",
          taxRate: item.taxRate ? String(item.taxRate) : "",
          sourceItemId: item.orderItemId,
        }))
      );
      setCharges({
        discountAmount: purchaseReturn.discountAmount
          ? String(purchaseReturn.discountAmount)
          : "",
        shippingCost: purchaseReturn.shippingCost ? String(purchaseReturn.shippingCost) : "",
        roundOff: purchaseReturn.roundOff ? String(purchaseReturn.roundOff) : "",
      });
      setLoadedOrderId(purchaseReturn.purchaseOrderId ?? "");
      return;
    }

    form.reset(emptyValues());
    setLines([emptyLine()]);
    setCharges(emptyCharges());
    setLoadedOrderId("");
  }, [open, purchaseReturn, form]);

  React.useEffect(() => {
    if (!open) return;
    if (purchaseOrderId === loadedOrderId) return;

    setLoadedOrderId(purchaseOrderId);

    if (!purchaseOrderId) {
      setLines([emptyLine()]);
      return;
    }
    if (!sourceOrder || sourceOrder._id !== purchaseOrderId) return;

    form.setValue("warehouseId", sourceOrder.warehouseId, { shouldDirty: true });

    const returnable = sourceOrder.items
      .map((item) => ({
        item,
        available: Math.max(0, item.receivedQuantity - item.returnedQuantity),
      }))
      .filter((row) => row.available > 0);

    setLines(
      returnable.length > 0
        ? returnable.map(({ item, available }) => ({
            key: item._id,
            productId: item.productId,
            quantity: String(available),
            unitPrice: String(item.unitPrice),
            discount: "",
            taxRate: item.taxRate ? String(item.taxRate) : "",
            sourceItemId: item._id,
            maxQuantity: available,
          }))
        : [emptyLine()]
    );
  }, [open, purchaseOrderId, sourceOrder, loadedOrderId, form]);

  const onSubmit = async (values: ReturnFormValues) => {
    const problem = lineError(lines);
    setLinesError(problem);
    if (problem) return;

    const body: PurchaseReturnPayload = {
      supplierId: values.supplierId,
      warehouseId: values.warehouseId,
      purchaseOrderId: values.purchaseOrderId || null,
      returnDate: values.returnDate,
      reason: values.reason,
      settlement: values.settlement,
      items: lines
        .filter((line) => line.productId)
        .map((line) => ({
          productId: line.productId,
          orderItemId: line.sourceItemId ?? null,
          quantity: toNumber(line.quantity),
          unitPrice: toNumber(line.unitPrice),
          discount: toNumber(line.discount),
          taxRate: toNumber(line.taxRate),
        })),
      discountAmount: toNumber(charges.discountAmount),
      shippingCost: toNumber(charges.shippingCost),
      roundOff: toNumber(charges.roundOff),
      reference: values.reference,
      notes: values.notes,
    };

    try {
      if (purchaseReturn) {
        await updateReturn({ id: purchaseReturn._id, body }).unwrap();
        toast.success("Purchase return updated");
      } else {
        await createReturn(body).unwrap();
        toast.success("Purchase return created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the return");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit purchase return" : "New purchase return"}</DialogTitle>
          <DialogDescription>
            Goods heading back to a supplier. Link the order it came in on and the quantities are
            checked for you.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="supplierId"
                  label="Supplier"
                  placeholder="Who the stock goes back to"
                  options={supplierChoices}
                  onValueChange={() => {
                    form.setValue("purchaseOrderId", "", { shouldDirty: true });
                  }}
                />
                <FormSelect
                  control={form.control}
                  name="purchaseOrderId"
                  label="Against purchase order"
                  placeholder={supplierId ? "Not linked to an order" : "Pick a supplier first"}
                  options={orderChoices}
                  disabled={!supplierId}
                  description="Linking the order caps each line at what was actually received."
                />
                <FormSelect
                  control={form.control}
                  name="warehouseId"
                  label="Return from"
                  placeholder="Where the stock is leaving"
                  options={warehouseChoices}
                />
                <FormDate control={form.control} name="returnDate" label="Return date" dateOnly />
                <FormSelect
                  control={form.control}
                  name="reason"
                  label="Reason"
                  options={REASON_OPTIONS}
                />
                <FormSelect
                  control={form.control}
                  name="settlement"
                  label="Settlement"
                  options={SETTLEMENT_OPTIONS}
                />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Debit note or gate pass number"
                  className="sm:col-span-2"
                />
              </div>

              <DocumentItems
                lines={lines}
                onLinesChange={setLines}
                products={products}
                priceField="purchasePrice"
                charges={charges}
                onChargesChange={setCharges}
                error={linesError}
                lockProducts={Boolean(purchaseOrderId)}
                emptyHint={
                  purchaseOrderId
                    ? "Lines come from the linked purchase order. Trim the quantities to what is going back."
                    : "Prices default to each product's purchase price."
                }
              />

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="What went wrong, and what the supplier agreed to"
              />
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
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create return"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
