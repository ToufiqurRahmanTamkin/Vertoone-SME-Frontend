import {
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import { TaxConfigSchema, type TaxConfigFormValues } from "@/validations/smeConfiguration";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, FileSignature, Hammer, Percent, SlidersHorizontal } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ConfigActions } from "../components/ConfigActions";

const CALCULATIONS = [
  { label: "Per line item", value: "per-line" },
  { label: "On the invoice total", value: "per-invoice" },
];

const ROUNDING = [
  { label: "Nearest", value: "nearest" },
  { label: "Always up", value: "up" },
  { label: "Always down", value: "down" },
];

const FILING = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];

const DEFAULTS: TaxConfigFormValues = {
  taxEnabled: true,
  taxLabel: "VAT",
  registrationNumber: "",
  registrationCountry: "Bangladesh",
  binNumber: "",
  pricesIncludeTax: false,
  taxOnShipping: true,
  compoundTax: false,
  showTaxSummary: true,
  defaultSalesRate: 15,
  defaultPurchaseRate: 15,
  withholdingRate: 0,
  reducedRate: 5,
  taxCalculation: "per-line",
  roundingMode: "nearest",
  filingFrequency: "monthly",
  filingNote: "",
};

export default function TaxConfigPage() {
  const form = useForm<TaxConfigFormValues>({
    resolver: zodResolver(TaxConfigSchema),
    defaultValues: DEFAULTS,
  });

  const taxEnabled = useWatch({ control: form.control, name: "taxEnabled" });
  const taxLabel = useWatch({ control: form.control, name: "taxLabel" });
  const pricesIncludeTax = useWatch({ control: form.control, name: "pricesIncludeTax" });

  const onSubmit = (values: TaxConfigFormValues) => {
    form.reset(values);
    toast.success("Tax configuration saved", {
      description: "Kept for this session only — the configuration API is not connected yet.",
    });
  };

  return (
    <>
      <PageHeader
        title="Tax configuration"
        description="Registration details, the rates you charge, and how tax is worked out on a document."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={taxEnabled ? "success" : "outline"} className="px-2.5 py-1">
              <Percent className="size-3" />
              {taxEnabled ? `${taxLabel || "Tax"} applied` : "No tax applied"}
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
          <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:gap-6">
            <SectionCard
              icon={FileSignature}
              title="Registration"
              description="Printed on invoices so customers can claim the tax back."
            >
              <FormSwitch
                control={form.control}
                name="taxEnabled"
                label="Apply tax to documents"
                description="Turn off for a business below the registration threshold"
              />
              <FormInput
                control={form.control}
                name="taxLabel"
                label="Tax label"
                placeholder="VAT"
                description="Shown on every document line and total."
                disabled={!taxEnabled}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="registrationNumber"
                  label="Registration number"
                  placeholder="VAT / GST number"
                  disabled={!taxEnabled}
                />
                <FormInput
                  control={form.control}
                  name="binNumber"
                  label="BIN / TIN"
                  placeholder="Business identification number"
                  disabled={!taxEnabled}
                />
              </div>
              <FormInput
                control={form.control}
                name="registrationCountry"
                label="Registered in"
                placeholder="Bangladesh"
                className="mt-auto"
                disabled={!taxEnabled}
              />
            </SectionCard>

            <SectionCard
              icon={Percent}
              title="Default rates"
              description="Used whenever a product or supplier does not carry its own rate."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="defaultSalesRate"
                  label="Sales tax rate (%)"
                  type="number"
                  step="0.01"
                  disabled={!taxEnabled}
                />
                <FormInput
                  control={form.control}
                  name="defaultPurchaseRate"
                  label="Purchase tax rate (%)"
                  type="number"
                  step="0.01"
                  disabled={!taxEnabled}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="reducedRate"
                  label="Reduced rate (%)"
                  type="number"
                  step="0.01"
                  description="For zero-rated and essential goods."
                  disabled={!taxEnabled}
                />
                <FormInput
                  control={form.control}
                  name="withholdingRate"
                  label="Withholding tax (%)"
                  type="number"
                  step="0.01"
                  description="Deducted at source on supplier payments."
                  disabled={!taxEnabled}
                />
              </div>
            </SectionCard>
          </div>

          <SectionCard
            icon={SlidersHorizontal}
            title="How tax is applied"
            description="The arithmetic behind every total, and what the customer sees."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <FormSelect
                control={form.control}
                name="taxCalculation"
                label="Calculate tax"
                options={CALCULATIONS}
                disabled={!taxEnabled}
              />
              <FormSelect
                control={form.control}
                name="roundingMode"
                label="Rounding"
                options={ROUNDING}
                disabled={!taxEnabled}
              />
              <FormSelect
                control={form.control}
                name="filingFrequency"
                label="Return filed"
                options={FILING}
                disabled={!taxEnabled}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <FormSwitch
                control={form.control}
                name="pricesIncludeTax"
                label="Prices include tax"
                description={
                  pricesIncludeTax ? "Tax is backed out of the price" : "Tax is added on top"
                }
                className="h-full"
                disabled={!taxEnabled}
              />
              <FormSwitch
                control={form.control}
                name="taxOnShipping"
                label="Tax on shipping"
                description="Charge tax on delivery lines"
                className="h-full"
                disabled={!taxEnabled}
              />
              <FormSwitch
                control={form.control}
                name="compoundTax"
                label="Compound tax"
                description="Stack a second tax on the first"
                className="h-full"
                disabled={!taxEnabled}
              />
              <FormSwitch
                control={form.control}
                name="showTaxSummary"
                label="Show tax summary"
                description="Break rates out at the foot of documents"
                className="h-full"
                disabled={!taxEnabled}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Calculator}
            title="Filing notes"
            description="Kept alongside the return so whoever files it has the context."
          >
            <FormTextarea
              control={form.control}
              name="filingNote"
              label="Internal note"
              placeholder="Filed through the online portal by the third working day of each month."
              showCharCount={false}
            />
          </SectionCard>

          <ConfigActions isDirty={form.formState.isDirty} onReset={() => form.reset(DEFAULTS)} />
        </form>
      </Form>
    </>
  );
}
