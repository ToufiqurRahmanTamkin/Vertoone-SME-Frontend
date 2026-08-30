import {
  FormColor,
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import { InvoiceConfigSchema, type InvoiceConfigFormValues } from "@/validations/smeConfiguration";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Hammer, Hash, Palette, Receipt, ScrollText } from "lucide-react";
import { useForm, useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";
import { ConfigActions } from "../components/ConfigActions";

const RESET_OPTIONS = [
  { label: "Never — keep counting", value: "never" },
  { label: "Every year", value: "yearly" },
  { label: "Every month", value: "monthly" },
];

const DUE_BASIS = [
  { label: "Issue date", value: "issue-date" },
  { label: "Delivery date", value: "delivery-date" },
];

const TEMPLATES = [
  { label: "Classic", value: "classic" },
  { label: "Modern", value: "modern" },
  { label: "Compact", value: "compact" },
  { label: "Minimal", value: "minimal" },
];

const PAPER_SIZES = [
  { label: "A4", value: "a4" },
  { label: "US Letter", value: "letter" },
  { label: "Thermal 80mm", value: "thermal-80" },
];

type SeriesName =
  | "invoiceSeries"
  | "quotationSeries"
  | "purchaseOrderSeries"
  | "salesOrderSeries";

const SERIES: { name: SeriesName; label: string }[] = [
  { name: "invoiceSeries", label: "Sales invoice" },
  { name: "quotationSeries", label: "Quotation" },
  { name: "purchaseOrderSeries", label: "Purchase order" },
  { name: "salesOrderSeries", label: "Sales order" },
];

const DEFAULTS: InvoiceConfigFormValues = {
  invoiceSeries: { prefix: "INV-", nextNumber: 1, padding: 5 },
  quotationSeries: { prefix: "QUO-", nextNumber: 1, padding: 5 },
  purchaseOrderSeries: { prefix: "PO-", nextNumber: 1, padding: 5 },
  salesOrderSeries: { prefix: "SO-", nextNumber: 1, padding: 5 },
  resetNumbering: "yearly",
  paymentTermDays: 30,
  dueDateBasis: "issue-date",
  lateFeePercent: 0,
  template: "classic",
  paperSize: "a4",
  accentColor: "#0ea5e9",
  showLogo: true,
  showSignature: true,
  showPaidStamp: true,
  showBankDetails: true,
  roundOffTotal: true,
  defaultNote: "",
  termsAndConditions: "",
  footerText: "",
};

function SeriesRow({
  control,
  name,
  label,
}: {
  control: Control<InvoiceConfigFormValues>;
  name: SeriesName;
  label: string;
}) {
  const series = useWatch({ control, name });
  const preview = `${series?.prefix ?? ""}${String(series?.nextNumber ?? 1).padStart(
    series?.padding ?? 0,
    "0"
  )}`;

  return (
    <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end">
      <FormInput control={control} name={`${name}.prefix`} label={`${label} prefix`} />
      <FormInput control={control} name={`${name}.nextNumber`} label="Next number" type="number" />
      <FormInput control={control} name={`${name}.padding`} label="Digits" type="number" />
      <div className="flex flex-col gap-1.5 sm:items-end">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Next
        </span>
        <Badge variant="secondary" className="px-2.5 py-1 font-mono">
          {preview}
        </Badge>
      </div>
    </div>
  );
}

export default function InvoiceConfigPage() {
  const form = useForm<InvoiceConfigFormValues>({
    resolver: zodResolver(InvoiceConfigSchema),
    defaultValues: DEFAULTS,
  });

  const paymentTermDays = useWatch({ control: form.control, name: "paymentTermDays" });

  const onSubmit = (values: InvoiceConfigFormValues) => {
    form.reset(values);
    toast.success("Document configuration saved", {
      description: "Kept for this session only — the configuration API is not connected yet.",
    });
  };

  return (
    <>
      <PageHeader
        title="Invoice & documents"
        description="How documents are numbered, when they fall due, and what the printed page looks like."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-2.5 py-1">
              <CalendarClock className="size-3" />
              {paymentTermDays === 0 ? "Due on receipt" : `Net ${paymentTermDays} days`}
            </Badge>
            <Badge variant="secondary" className="px-2.5 py-1">
              <Hammer className="size-3" />
              UI only
            </Badge>
          </div>
        }
      />

      <Form {...form}>
        <form className="flex flex-col gap-4 xl:gap-6" onSubmit={form.handleSubmit(onSubmit)}>
          <SectionCard
            icon={Hash}
            title="Document numbering"
            description="Each series counts on its own. The preview shows the next number issued."
          >
            {SERIES.map((entry) => (
              <SeriesRow
                key={entry.name}
                control={form.control}
                name={entry.name}
                label={entry.label}
              />
            ))}
            <FormSelect
              control={form.control}
              name="resetNumbering"
              label="Reset counters"
              options={RESET_OPTIONS}
              className="max-w-sm"
            />
          </SectionCard>

          <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:gap-6">
            <SectionCard
              icon={CalendarClock}
              title="Payment terms"
              description="When an invoice becomes overdue, and what it costs the customer."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="paymentTermDays"
                  label="Payment term (days)"
                  type="number"
                  description="0 means due on receipt."
                />
                <FormInput
                  control={form.control}
                  name="lateFeePercent"
                  label="Late fee (%)"
                  type="number"
                  step="0.01"
                  description="Charged per month on the overdue balance."
                />
              </div>
              <FormSelect
                control={form.control}
                name="dueDateBasis"
                label="Count the due date from"
                options={DUE_BASIS}
              />
              <FormSwitch
                control={form.control}
                name="roundOffTotal"
                label="Round off the total"
                description="Round the grand total to the nearest whole unit"
                className="mt-auto"
              />
            </SectionCard>

            <SectionCard
              icon={Palette}
              title="Appearance"
              description="The layout and accents applied to printed and emailed documents."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="template"
                  label="Template"
                  options={TEMPLATES}
                />
                <FormSelect
                  control={form.control}
                  name="paperSize"
                  label="Paper size"
                  options={PAPER_SIZES}
                />
              </div>
              <FormColor control={form.control} name="accentColor" label="Accent colour" />
              <div className="mt-auto grid gap-3 sm:grid-cols-2">
                <FormSwitch
                  control={form.control}
                  name="showLogo"
                  label="Show logo"
                  description="Company logo in the header"
                  className="h-full"
                />
                <FormSwitch
                  control={form.control}
                  name="showSignature"
                  label="Show signature"
                  description="Authorised signature block"
                  className="h-full"
                />
                <FormSwitch
                  control={form.control}
                  name="showPaidStamp"
                  label="Show paid stamp"
                  description="Mark settled invoices"
                  className="h-full"
                />
                <FormSwitch
                  control={form.control}
                  name="showBankDetails"
                  label="Show bank details"
                  description="Print account details in the footer"
                  className="h-full"
                />
              </div>
            </SectionCard>
          </div>

          <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:gap-6">
            <SectionCard
              icon={Receipt}
              title="Default note"
              description="Placed under the line items on new documents. Staff can still edit it."
            >
              <FormTextarea
                control={form.control}
                name="defaultNote"
                label="Note to customer"
                placeholder="Thank you for your business. Please quote the invoice number when paying."
                showCharCount={false}
              />
              <FormInput
                control={form.control}
                name="footerText"
                label="Footer line"
                placeholder="Vertoone Trading Ltd. · vertoone.com · +880 1XXX XXXXXX"
                className="mt-auto"
              />
            </SectionCard>

            <SectionCard
              icon={ScrollText}
              title="Terms & conditions"
              description="Printed on the last page of quotations, orders and invoices."
            >
              <FormTextarea
                control={form.control}
                name="termsAndConditions"
                label="Terms"
                placeholder="Goods remain the property of the seller until paid in full. Returns accepted within 7 days with the original receipt."
                showCharCount={false}
              />
            </SectionCard>
          </div>

          <ConfigActions isDirty={form.formState.isDirty} onReset={() => form.reset(DEFAULTS)} />
        </form>
      </Form>
    </>
  );
}
