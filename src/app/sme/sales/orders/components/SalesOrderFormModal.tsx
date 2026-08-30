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
  toNumber,
  type DocumentCharges,
  type DocumentLine,
} from "@/lib/trade";
import { useGetContactOptionsQuery } from "@/redux/apis/contactApis";
import { useGetProductPricingOptionsQuery } from "@/redux/apis/productApis";
import {
  useCreateSalesOrderMutation,
  useUpdateSalesOrderMutation,
} from "@/redux/apis/salesOrderApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { SalesOrder, SalesOrderPayload } from "@/types/domain/salesOrder";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const SalesOrderSchema = z.object({
  customerId: z.string(),
  customerName: z.string().trim().min(1, "An order needs a customer name").max(160),
  customerEmail: z.union([z.literal(""), z.string().trim().email("A valid email is required")]),
  customerPhone: z.string().trim().max(30),
  warehouseId: z.string().min(1, "Pick the warehouse the stock ships from"),
  orderDate: z.string().min(1, "An order needs a date"),
  expectedDate: z.string(),
  shippingAddress: z.string().trim().max(500),
  reference: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
  terms: z.string().trim().max(2000),
});

type SalesOrderFormValues = z.infer<typeof SalesOrderSchema>;

interface SalesOrderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: SalesOrder | null;
}

const emptyValues = (): SalesOrderFormValues => ({
  customerId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  warehouseId: "",
  orderDate: new Date().toISOString(),
  expectedDate: "",
  shippingAddress: "",
  reference: "",
  notes: "",
  terms: "",
});

export function SalesOrderFormModal({ open, onOpenChange, order }: SalesOrderFormModalProps) {
  const isEdit = Boolean(order);

  const [createOrder, { isLoading: isCreating }] = useCreateSalesOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateSalesOrderMutation();
  const isSaving = isCreating || isUpdating;

  const { data: contactOptions = [] } = useGetContactOptionsQuery();
  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();
  const { data: products = [] } = useGetProductPricingOptionsQuery();

  const customerChoices = React.useMemo(
    () => [
      { label: "Walk-in customer", value: "" },
      ...contactOptions.map((contact) => ({
        label: contact.name || contact.email || contact.phone,
        value: contact._id,
      })),
    ],
    [contactOptions]
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

  const form = useForm<SalesOrderFormValues>({
    resolver: zodResolver(SalesOrderSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;

    setLinesError(null);

    if (order) {
      form.reset({
        customerId: order.customerId ?? "",
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        warehouseId: order.warehouseId,
        orderDate: order.orderDate,
        expectedDate: order.expectedDate ?? "",
        shippingAddress: order.shippingAddress,
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

    form.reset({
      ...emptyValues(),
      warehouseId: warehouseOptions.length === 1 ? warehouseOptions[0]._id : "",
    });
    setLines([emptyLine()]);
    setCharges(emptyCharges());
  }, [open, order, form, warehouseOptions]);

  const applyContact = (contactId: string) => {
    const contact = contactOptions.find((option) => option._id === contactId);
    if (!contact) return;
    form.setValue("customerName", contact.name, { shouldDirty: true });
    form.setValue("customerEmail", contact.email ?? "", { shouldDirty: true });
    form.setValue("customerPhone", contact.phone ?? "", { shouldDirty: true });
  };

  const onSubmit = async (values: SalesOrderFormValues) => {
    const problem = lineError(lines);
    setLinesError(problem);
    if (problem) return;

    const body: SalesOrderPayload = {
      customerId: values.customerId || null,
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      warehouseId: values.warehouseId,
      orderDate: values.orderDate,
      expectedDate: values.expectedDate || null,
      items: toItemPayload(lines),
      shippingAddress: values.shippingAddress,
      discountAmount: toNumber(charges.discountAmount),
      shippingCost: toNumber(charges.shippingCost),
      roundOff: toNumber(charges.roundOff),
      reference: values.reference,
      notes: values.notes,
      terms: values.terms,
    };

    try {
      if (order) {
        await updateOrder({ id: order._id, body }).unwrap();
        toast.success("Sales order updated");
      } else {
        await createOrder(body).unwrap();
        toast.success("Sales order created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the sales order");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit sales order" : "New sales order"}</DialogTitle>
          <DialogDescription>
            What a customer has agreed to buy. Stock is reserved when you confirm the order, and
            leaves the shelf when you deliver it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="customerId"
                  label="Customer"
                  placeholder="Walk-in customer"
                  options={customerChoices}
                  onValueChange={applyContact}
                  description="Pick a CRM contact, or leave blank and type the name below."
                />
                <FormInput
                  control={form.control}
                  name="customerName"
                  label="Customer name"
                  placeholder="Who is buying"
                />
                <FormInput
                  control={form.control}
                  name="customerEmail"
                  label="Email"
                  placeholder="customer@example.com"
                />
                <FormInput
                  control={form.control}
                  name="customerPhone"
                  label="Phone"
                  placeholder="Contact number"
                />
                <FormSelect
                  control={form.control}
                  name="warehouseId"
                  label="Ship from"
                  placeholder="Where the stock comes from"
                  options={warehouseChoices}
                  description="Stock is reserved here the moment the order is confirmed."
                />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Customer purchase order number"
                />
                <FormDate control={form.control} name="orderDate" label="Order date" dateOnly />
                <FormDate
                  control={form.control}
                  name="expectedDate"
                  label="Expected delivery"
                  dateOnly
                />
              </div>

              <DocumentItems
                lines={lines}
                onLinesChange={setLines}
                products={products}
                priceField="sellingPrice"
                charges={charges}
                onChargesChange={setCharges}
                error={linesError}
                emptyHint="Prices default to each product's selling price."
              />

              <FormTextarea
                control={form.control}
                name="shippingAddress"
                label="Shipping address"
                placeholder="Where the goods are going"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormTextarea
                  control={form.control}
                  name="terms"
                  label="Terms"
                  placeholder="Delivery and payment terms"
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
