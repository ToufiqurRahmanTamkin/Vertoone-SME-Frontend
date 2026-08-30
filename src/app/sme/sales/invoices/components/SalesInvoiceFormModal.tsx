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
  useCreateSalesInvoiceMutation,
  useUpdateSalesInvoiceMutation,
} from "@/redux/apis/salesInvoiceApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { SalesInvoice, SalesInvoicePayload } from "@/types/domain/salesInvoice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const SalesInvoiceSchema = z.object({
  customerId: z.string(),
  customerName: z.string().trim().min(1, "An invoice needs a customer name").max(160),
  customerEmail: z.union([z.literal(""), z.string().trim().email("A valid email is required")]),
  customerPhone: z.string().trim().max(30),
  warehouseId: z.string().min(1, "Pick the warehouse the stock leaves from"),
  invoiceDate: z.string().min(1, "An invoice needs a date"),
  dueDate: z.string().min(1, "Say when payment is due"),
  billingAddress: z.string().trim().max(500),
  reference: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
  terms: z.string().trim().max(2000),
});

type SalesInvoiceFormValues = z.infer<typeof SalesInvoiceSchema>;

interface SalesInvoiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: SalesInvoice | null;
}

const inDays = (days: number): string =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const emptyValues = (): SalesInvoiceFormValues => ({
  customerId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  warehouseId: "",
  invoiceDate: new Date().toISOString(),
  dueDate: inDays(14),
  billingAddress: "",
  reference: "",
  notes: "",
  terms: "",
});

export function SalesInvoiceFormModal({
  open,
  onOpenChange,
  invoice,
}: SalesInvoiceFormModalProps) {
  const isEdit = Boolean(invoice);

  const [createInvoice, { isLoading: isCreating }] = useCreateSalesInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateSalesInvoiceMutation();
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

  const form = useForm<SalesInvoiceFormValues>({
    resolver: zodResolver(SalesInvoiceSchema),
    defaultValues: emptyValues(),
  });

  const isFromOrder = Boolean(invoice?.salesOrderId);

  React.useEffect(() => {
    if (!open) return;

    setLinesError(null);

    if (invoice) {
      form.reset({
        customerId: invoice.customerId ?? "",
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        customerPhone: invoice.customerPhone,
        warehouseId: invoice.warehouseId,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        billingAddress: invoice.billingAddress,
        reference: invoice.reference,
        notes: invoice.notes,
        terms: invoice.terms,
      });
      setLines(
        invoice.items.length > 0
          ? invoice.items.map((item) => ({
              key: item._id,
              productId: item.productId,
              quantity: String(item.quantity),
              unitPrice: String(item.unitPrice),
              discount: item.discount ? String(item.discount) : "",
              taxRate: item.taxRate ? String(item.taxRate) : "",
              sourceItemId: item.orderItemId,
            }))
          : [emptyLine()]
      );
      setCharges({
        discountAmount: invoice.discountAmount ? String(invoice.discountAmount) : "",
        shippingCost: invoice.shippingCost ? String(invoice.shippingCost) : "",
        roundOff: invoice.roundOff ? String(invoice.roundOff) : "",
      });
      return;
    }

    form.reset({
      ...emptyValues(),
      warehouseId: warehouseOptions.length === 1 ? warehouseOptions[0]._id : "",
    });
    setLines([emptyLine()]);
    setCharges(emptyCharges());
  }, [open, invoice, form, warehouseOptions]);

  const applyContact = (contactId: string) => {
    const contact = contactOptions.find((option) => option._id === contactId);
    if (!contact) return;
    form.setValue("customerName", contact.name, { shouldDirty: true });
    form.setValue("customerEmail", contact.email ?? "", { shouldDirty: true });
    form.setValue("customerPhone", contact.phone ?? "", { shouldDirty: true });
  };

  const onSubmit = async (values: SalesInvoiceFormValues) => {
    const problem = lineError(lines);
    setLinesError(problem);
    if (problem) return;

    const body: SalesInvoicePayload = {
      customerId: values.customerId || null,
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      warehouseId: values.warehouseId,
      invoiceDate: values.invoiceDate,
      dueDate: values.dueDate,
      items: toItemPayload(lines),
      billingAddress: values.billingAddress,
      discountAmount: toNumber(charges.discountAmount),
      shippingCost: toNumber(charges.shippingCost),
      roundOff: toNumber(charges.roundOff),
      reference: values.reference,
      notes: values.notes,
      terms: values.terms,
    };

    try {
      if (invoice) {
        await updateInvoice({ id: invoice._id, body }).unwrap();
        toast.success("Invoice updated");
      } else {
        await createInvoice(body).unwrap();
        toast.success("Invoice created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the invoice");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit invoice" : "New invoice"}</DialogTitle>
          <DialogDescription>
            {isFromOrder
              ? "This invoice came from a sales order, so its lines are fixed. Stock already moved on delivery."
              : "A direct invoice. Issuing it takes the stock off the shelf and puts the amount on the customer's account."}
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
                  placeholder="Who is being billed"
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
                  label="Stock leaves from"
                  placeholder="Where the goods come from"
                  options={warehouseChoices}
                  disabled={isFromOrder}
                  description={
                    isFromOrder
                      ? "Fixed by the sales order this invoice came from."
                      : "Issuing the invoice books the stock out of this warehouse."
                  }
                />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Customer purchase order number"
                />
                <FormDate control={form.control} name="invoiceDate" label="Invoice date" dateOnly />
                <FormDate control={form.control} name="dueDate" label="Due date" dateOnly />
              </div>

              <DocumentItems
                lines={lines}
                onLinesChange={setLines}
                products={products}
                priceField="sellingPrice"
                charges={charges}
                onChargesChange={setCharges}
                error={linesError}
                lockProducts={isFromOrder}
                emptyHint={
                  isFromOrder
                    ? "Lines come from the linked sales order."
                    : "Prices default to each product's selling price."
                }
              />

              <FormTextarea
                control={form.control}
                name="billingAddress"
                label="Billing address"
                placeholder="Where the invoice is addressed"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormTextarea
                  control={form.control}
                  name="terms"
                  label="Terms"
                  placeholder="Payment terms and late fees"
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
                {isEdit ? "Save changes" : "Create invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
