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
import { useGetContactOptionsQuery } from "@/redux/apis/contactApis";
import { useGetProductPricingOptionsQuery } from "@/redux/apis/productApis";
import {
  useGetSalesInvoiceQuery,
  useGetSalesInvoicesQuery,
} from "@/redux/apis/salesInvoiceApis";
import {
  useCreateSalesReturnMutation,
  useUpdateSalesReturnMutation,
} from "@/redux/apis/salesReturnApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  SALES_RETURN_REASONS,
  SALES_RETURN_REASON_LABELS,
  SALES_RETURN_SETTLEMENTS,
  SALES_RETURN_SETTLEMENT_LABELS,
  type SalesReturn,
  type SalesReturnPayload,
} from "@/types/domain/salesReturn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ReturnSchema = z.object({
  customerId: z.string(),
  customerName: z.string().trim().min(1, "A return needs a customer name").max(160),
  customerEmail: z.union([z.literal(""), z.string().trim().email("A valid email is required")]),
  customerPhone: z.string().trim().max(30),
  warehouseId: z.string().min(1, "Pick where the stock is coming back to"),
  salesInvoiceId: z.string(),
  returnDate: z.string().min(1, "A return needs a date"),
  reason: z.enum(SALES_RETURN_REASONS),
  settlement: z.enum(SALES_RETURN_SETTLEMENTS),
  reference: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
});

type ReturnFormValues = z.infer<typeof ReturnSchema>;

interface SalesReturnFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesReturn?: SalesReturn | null;
}

const REASON_OPTIONS = SALES_RETURN_REASONS.map((reason) => ({
  label: SALES_RETURN_REASON_LABELS[reason],
  value: reason,
}));

const SETTLEMENT_OPTIONS = SALES_RETURN_SETTLEMENTS.map((settlement) => ({
  label: SALES_RETURN_SETTLEMENT_LABELS[settlement],
  value: settlement,
}));

const emptyValues = (): ReturnFormValues => ({
  customerId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  warehouseId: "",
  salesInvoiceId: "",
  returnDate: new Date().toISOString(),
  reason: "DAMAGED",
  settlement: "REFUND",
  reference: "",
  notes: "",
});

export function SalesReturnFormModal({
  open,
  onOpenChange,
  salesReturn,
}: SalesReturnFormModalProps) {
  const isEdit = Boolean(salesReturn);

  const [createReturn, { isLoading: isCreating }] = useCreateSalesReturnMutation();
  const [updateReturn, { isLoading: isUpdating }] = useUpdateSalesReturnMutation();
  const isSaving = isCreating || isUpdating;

  const { data: contactOptions = [] } = useGetContactOptionsQuery();
  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();
  const { data: products = [] } = useGetProductPricingOptionsQuery();

  const [lines, setLines] = React.useState<DocumentLine[]>([emptyLine()]);
  const [charges, setCharges] = React.useState<DocumentCharges>(emptyCharges());
  const [linesError, setLinesError] = React.useState<string | null>(null);
  const [loadedInvoiceId, setLoadedInvoiceId] = React.useState<string>("");

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(ReturnSchema),
    defaultValues: emptyValues(),
  });

  const customerId = useWatch({ control: form.control, name: "customerId" });
  const salesInvoiceId = useWatch({ control: form.control, name: "salesInvoiceId" });

  const { data: invoiceList } = useGetSalesInvoicesQuery(
    { customerId, status: "ISSUED", limit: 100 },
    { skip: !customerId }
  );

  const { data: sourceInvoice } = useGetSalesInvoiceQuery(salesInvoiceId, {
    skip: !salesInvoiceId,
  });

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

  const invoiceChoices = React.useMemo(
    () => [
      { label: "Not linked to an invoice", value: "" },
      ...(invoiceList?.data ?? []).map((invoice) => ({
        label: `${invoice.invoiceNumber} · ${invoice.warehouse?.name ?? ""}`,
        value: invoice._id,
      })),
    ],
    [invoiceList]
  );

  React.useEffect(() => {
    if (!open) return;

    setLinesError(null);

    if (salesReturn) {
      form.reset({
        customerId: salesReturn.customerId ?? "",
        customerName: salesReturn.customerName,
        customerEmail: salesReturn.customerEmail,
        customerPhone: salesReturn.customerPhone,
        warehouseId: salesReturn.warehouseId,
        salesInvoiceId: salesReturn.salesInvoiceId ?? "",
        returnDate: salesReturn.returnDate,
        reason: salesReturn.reason,
        settlement: salesReturn.settlement,
        reference: salesReturn.reference,
        notes: salesReturn.notes,
      });
      setLines(
        salesReturn.items.map((item) => ({
          key: item._id,
          productId: item.productId,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
          discount: item.discount ? String(item.discount) : "",
          taxRate: item.taxRate ? String(item.taxRate) : "",
          sourceItemId: item.invoiceItemId,
          restock: item.restock,
        }))
      );
      setCharges({
        discountAmount: salesReturn.discountAmount ? String(salesReturn.discountAmount) : "",
        shippingCost: salesReturn.shippingCost ? String(salesReturn.shippingCost) : "",
        roundOff: salesReturn.roundOff ? String(salesReturn.roundOff) : "",
      });
      setLoadedInvoiceId(salesReturn.salesInvoiceId ?? "");
      return;
    }

    form.reset({
      ...emptyValues(),
      warehouseId: warehouseOptions.length === 1 ? warehouseOptions[0]._id : "",
    });
    setLines([emptyLine()]);
    setCharges(emptyCharges());
    setLoadedInvoiceId("");
  }, [open, salesReturn, form, warehouseOptions]);

  React.useEffect(() => {
    if (!open) return;
    if (salesInvoiceId === loadedInvoiceId) return;

    setLoadedInvoiceId(salesInvoiceId);

    if (!salesInvoiceId) {
      setLines([emptyLine()]);
      return;
    }
    if (!sourceInvoice || sourceInvoice._id !== salesInvoiceId) return;

    form.setValue("warehouseId", sourceInvoice.warehouseId, { shouldDirty: true });

    const returnable = sourceInvoice.items.filter((item) => item.returnableQuantity > 0);

    setLines(
      returnable.length > 0
        ? returnable.map((item) => ({
            key: item._id,
            productId: item.productId,
            quantity: String(item.returnableQuantity),
            unitPrice: String(item.unitPrice),
            discount: "",
            taxRate: item.taxRate ? String(item.taxRate) : "",
            sourceItemId: item._id,
            maxQuantity: item.returnableQuantity,
            restock: true,
          }))
        : [emptyLine()]
    );
  }, [open, salesInvoiceId, sourceInvoice, loadedInvoiceId, form]);

  const applyContact = (contactId: string) => {
    form.setValue("salesInvoiceId", "", { shouldDirty: true });

    const contact = contactOptions.find((option) => option._id === contactId);
    if (!contact) return;
    form.setValue("customerName", contact.name, { shouldDirty: true });
    form.setValue("customerEmail", contact.email ?? "", { shouldDirty: true });
    form.setValue("customerPhone", contact.phone ?? "", { shouldDirty: true });
  };

  const onSubmit = async (values: ReturnFormValues) => {
    const problem = lineError(lines);
    setLinesError(problem);
    if (problem) return;

    const body: SalesReturnPayload = {
      customerId: values.customerId || null,
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      warehouseId: values.warehouseId,
      salesInvoiceId: values.salesInvoiceId || null,
      returnDate: values.returnDate,
      reason: values.reason,
      settlement: values.settlement,
      items: lines
        .filter((line) => line.productId)
        .map((line) => ({
          productId: line.productId,
          invoiceItemId: line.sourceItemId ?? null,
          quantity: toNumber(line.quantity),
          unitPrice: toNumber(line.unitPrice),
          discount: toNumber(line.discount),
          taxRate: toNumber(line.taxRate),
          restock: line.restock ?? true,
        })),
      discountAmount: toNumber(charges.discountAmount),
      shippingCost: toNumber(charges.shippingCost),
      roundOff: toNumber(charges.roundOff),
      reference: values.reference,
      notes: values.notes,
    };

    try {
      if (salesReturn) {
        await updateReturn({ id: salesReturn._id, body }).unwrap();
        toast.success("Sales return updated");
      } else {
        await createReturn(body).unwrap();
        toast.success("Sales return created");
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
          <DialogTitle>{isEdit ? "Edit sales return" : "New sales return"}</DialogTitle>
          <DialogDescription>
            Goods a customer is sending back. Link the invoice they were sold on and the quantities
            are checked for you. Only lines marked for restock go back on the shelf.
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
                  description="Pick a CRM contact to list their invoices below."
                />
                <FormSelect
                  control={form.control}
                  name="salesInvoiceId"
                  label="Against invoice"
                  placeholder={customerId ? "Not linked to an invoice" : "Pick a customer first"}
                  options={invoiceChoices}
                  disabled={!customerId}
                  description="Linking the invoice caps each line at what is still returnable."
                />
                <FormInput
                  control={form.control}
                  name="customerName"
                  label="Customer name"
                  placeholder="Who is returning the goods"
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
                  label="Return into"
                  placeholder="Where the stock comes back to"
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
                  placeholder="Credit note or RMA number"
                  className="sm:col-span-2"
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
                lockProducts={Boolean(salesInvoiceId)}
                showRestock
                emptyHint={
                  salesInvoiceId
                    ? "Lines come from the linked invoice. Trim the quantities to what is coming back."
                    : "Untick restock for anything too damaged to resell."
                }
              />

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="What the customer reported, and what you agreed to"
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
