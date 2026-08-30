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
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
} from "@/redux/apis/quotationApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Quotation, QuotationPayload } from "@/types/domain/quotation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const QuotationSchema = z.object({
  customerId: z.string(),
  customerName: z.string().trim().min(1, "A quotation needs a customer name").max(160),
  customerEmail: z.union([z.literal(""), z.string().trim().email("A valid email is required")]),
  customerPhone: z.string().trim().max(30),
  quotationDate: z.string().min(1, "A quotation needs a date"),
  validUntil: z.string().min(1, "Say how long the price holds"),
  subject: z.string().trim().max(200),
  reference: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
  terms: z.string().trim().max(2000),
});

type QuotationFormValues = z.infer<typeof QuotationSchema>;

interface QuotationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation?: Quotation | null;
}

const inDays = (days: number): string =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const emptyValues = (): QuotationFormValues => ({
  customerId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  quotationDate: new Date().toISOString(),
  validUntil: inDays(14),
  subject: "",
  reference: "",
  notes: "",
  terms: "",
});

export function QuotationFormModal({
  open,
  onOpenChange,
  quotation,
}: QuotationFormModalProps) {
  const isEdit = Boolean(quotation);

  const [createQuotation, { isLoading: isCreating }] = useCreateQuotationMutation();
  const [updateQuotation, { isLoading: isUpdating }] = useUpdateQuotationMutation();
  const isSaving = isCreating || isUpdating;

  const { data: contactOptions = [] } = useGetContactOptionsQuery();
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

  const [lines, setLines] = React.useState<DocumentLine[]>([emptyLine()]);
  const [charges, setCharges] = React.useState<DocumentCharges>(emptyCharges());
  const [linesError, setLinesError] = React.useState<string | null>(null);

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(QuotationSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;

    setLinesError(null);

    if (quotation) {
      form.reset({
        customerId: quotation.customerId ?? "",
        customerName: quotation.customerName,
        customerEmail: quotation.customerEmail,
        customerPhone: quotation.customerPhone,
        quotationDate: quotation.quotationDate,
        validUntil: quotation.validUntil,
        subject: quotation.subject,
        reference: quotation.reference,
        notes: quotation.notes,
        terms: quotation.terms,
      });
      setLines(
        quotation.items.length > 0
          ? quotation.items.map((item) => ({
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
        discountAmount: quotation.discountAmount ? String(quotation.discountAmount) : "",
        shippingCost: quotation.shippingCost ? String(quotation.shippingCost) : "",
        roundOff: quotation.roundOff ? String(quotation.roundOff) : "",
      });
      return;
    }

    form.reset(emptyValues());
    setLines([emptyLine()]);
    setCharges(emptyCharges());
  }, [open, quotation, form]);

  const applyContact = (contactId: string) => {
    const contact = contactOptions.find((option) => option._id === contactId);
    if (!contact) return;
    form.setValue("customerName", contact.name, { shouldDirty: true });
    form.setValue("customerEmail", contact.email ?? "", { shouldDirty: true });
    form.setValue("customerPhone", contact.phone ?? "", { shouldDirty: true });
  };

  const onSubmit = async (values: QuotationFormValues) => {
    const problem = lineError(lines);
    setLinesError(problem);
    if (problem) return;

    const body: QuotationPayload = {
      customerId: values.customerId || null,
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      customerPhone: values.customerPhone,
      quotationDate: values.quotationDate,
      validUntil: values.validUntil,
      subject: values.subject,
      items: toItemPayload(lines),
      discountAmount: toNumber(charges.discountAmount),
      shippingCost: toNumber(charges.shippingCost),
      roundOff: toNumber(charges.roundOff),
      reference: values.reference,
      notes: values.notes,
      terms: values.terms,
    };

    try {
      if (quotation) {
        await updateQuotation({ id: quotation._id, body }).unwrap();
        toast.success("Quotation updated");
      } else {
        await createQuotation(body).unwrap();
        toast.success("Quotation created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the quotation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit quotation" : "New quotation"}</DialogTitle>
          <DialogDescription>
            A price offered to a customer. Nothing is reserved or invoiced until it becomes a sales
            order.
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
                  placeholder="Who the quote is addressed to"
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
                <FormDate
                  control={form.control}
                  name="quotationDate"
                  label="Quotation date"
                  dateOnly
                />
                <FormDate control={form.control} name="validUntil" label="Valid until" dateOnly />
                <FormInput
                  control={form.control}
                  name="subject"
                  label="Subject"
                  placeholder="What this quote is for"
                />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Customer enquiry or RFQ number"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <FormTextarea
                  control={form.control}
                  name="terms"
                  label="Terms"
                  placeholder="Delivery, payment and validity terms"
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
                {isEdit ? "Save changes" : "Create quotation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
