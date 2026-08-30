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
  toItemPayload,
  type DocumentCharges,
  type DocumentLine,
} from "@/lib/trade";
import { useGetProductPricingOptionsQuery } from "@/redux/apis/productApis";
import {
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
} from "@/redux/apis/purchaseOrderApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { PurchaseOrder, PurchaseOrderPayload } from "@/types/domain/purchaseOrder";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const PurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Pick who you are buying from"),
  warehouseId: z.string().min(1, "Pick where the stock will land"),
  orderDate: z.string().min(1, "An order needs a date"),
  expectedDate: z.string(),
  reference: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
  terms: z.string().trim().max(2000),
});

type PurchaseOrderFormValues = z.infer<typeof PurchaseOrderSchema>;

interface PurchaseOrderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: PurchaseOrder | null;
}

const emptyValues = (): PurchaseOrderFormValues => ({
  supplierId: "",
  warehouseId: "",
  orderDate: new Date().toISOString(),
  expectedDate: "",
  reference: "",
  notes: "",
  terms: "",
});

export function PurchaseOrderFormModal({
  open,
  onOpenChange,
  order,
}: PurchaseOrderFormModalProps) {
  const isEdit = Boolean(order);

  const [createOrder, { isLoading: isCreating }] = useCreatePurchaseOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();
  const isSaving = isCreating || isUpdating;

  const { data: supplierOptions = [] } = useGetSupplierOptionsQuery();
  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();
  const { data: products = [] } = useGetProductPricingOptionsQuery();

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

  const [lines, setLines] = React.useState<DocumentLine[]>([emptyLine()]);
  const [charges, setCharges] = React.useState<DocumentCharges>(emptyCharges());
  const [linesError, setLinesError] = React.useState<string | null>(null);

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(PurchaseOrderSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;

    setLinesError(null);

    if (order) {
      form.reset({
        supplierId: order.supplierId,
        warehouseId: order.warehouseId,
        orderDate: order.orderDate,
        expectedDate: order.expectedDate ?? "",
        reference: order.reference,
        notes: order.notes,
        terms: order.terms,
      });
      setLines(
        order.items.length > 0
          ? order.items.map((item) => ({
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
        discountAmount: order.discountAmount ? String(order.discountAmount) : "",
        shippingCost: order.shippingCost ? String(order.shippingCost) : "",
        roundOff: order.roundOff ? String(order.roundOff) : "",
      });
      return;
    }

    form.reset(emptyValues());
    setLines([emptyLine()]);
    setCharges(emptyCharges());
  }, [open, order, form]);

  const onSubmit = async (values: PurchaseOrderFormValues) => {
    const problem = lineError(lines);
    setLinesError(problem);
    if (problem) return;

    const body: PurchaseOrderPayload = {
      supplierId: values.supplierId,
      warehouseId: values.warehouseId,
      orderDate: values.orderDate,
      expectedDate: values.expectedDate || null,
      items: toItemPayload(lines),
      discountAmount: Number(charges.discountAmount) || 0,
      shippingCost: Number(charges.shippingCost) || 0,
      roundOff: Number(charges.roundOff) || 0,
      reference: values.reference,
      notes: values.notes,
      terms: values.terms,
    };

    try {
      if (order) {
        await updateOrder({ id: order._id, body }).unwrap();
        toast.success("Purchase order updated");
      } else {
        await createOrder(body).unwrap();
        toast.success("Purchase order created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the purchase order");
    }
  };

  const linesLocked = Boolean(order && order.receivedQuantity > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit purchase order" : "New purchase order"}</DialogTitle>
          <DialogDescription>
            What you are buying and from whom. Stock only arrives once you receive against this
            order.
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
                  placeholder="Who you are buying from"
                  options={supplierChoices}
                  description={
                    supplierChoices.length === 0
                      ? "No suppliers yet. Add one under Purchases · Suppliers."
                      : undefined
                  }
                />
                <FormSelect
                  control={form.control}
                  name="warehouseId"
                  label="Receive into"
                  placeholder="Where stock will land"
                  options={warehouseChoices}
                  disabled={linesLocked}
                  description={
                    warehouseChoices.length === 0
                      ? "No warehouses yet. Create one under Inventory · Warehouses."
                      : undefined
                  }
                />
                <FormDate control={form.control} name="orderDate" label="Order date" dateOnly />
                <FormDate
                  control={form.control}
                  name="expectedDate"
                  label="Expected delivery"
                  dateOnly
                />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Supplier quotation or PO reference"
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
                lockProducts={linesLocked}
                emptyHint="Prices default to each product's purchase price."
              />

              {linesLocked && (
                <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
                  Stock has already been received against this order, so the lines are locked.
                  Raise a purchase return if something needs to go back.
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormTextarea
                  control={form.control}
                  name="terms"
                  label="Terms"
                  placeholder="Payment and delivery terms agreed with the supplier"
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
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
