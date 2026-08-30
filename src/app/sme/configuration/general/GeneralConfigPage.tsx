import { FormInput, FormSelect, FormSwitch } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import {
  GeneralConfigSchema,
  type GeneralConfigFormValues,
} from "@/validations/smeConfiguration";
import { zodResolver } from "@hookform/resolvers/zod";
import { Boxes, Building2, Coins, Globe2, Hammer, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfigActions } from "../components/ConfigActions";

const BUSINESS_TYPES = [
  { label: "Retail", value: "retail" },
  { label: "Wholesale", value: "wholesale" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Services", value: "services" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Other", value: "other" },
];

const SYMBOL_POSITIONS = [
  { label: "Before amount — $1,250.00", value: "before" },
  { label: "After amount — 1,250.00 $", value: "after" },
];

const SEPARATORS = [
  { label: "Comma — 1,250,000.00", value: "comma" },
  { label: "Dot — 1.250.000,00", value: "dot" },
  { label: "Space — 1 250 000.00", value: "space" },
];

const DATE_FORMATS = [
  { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
  { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
  { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
  { label: "DD MMM YYYY", value: "DD MMM YYYY" },
];

const TIME_FORMATS = [
  { label: "12 hour — 04:30 PM", value: "12h" },
  { label: "24 hour — 16:30", value: "24h" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((month) => ({ label: month, value: month }));

const WEEK_DAYS = ["Saturday", "Sunday", "Monday"].map((day) => ({ label: day, value: day }));

const UNITS = [
  { label: "Piece (pc)", value: "pc" },
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Gram (g)", value: "g" },
  { label: "Litre (l)", value: "l" },
  { label: "Metre (m)", value: "m" },
  { label: "Box", value: "box" },
  { label: "Dozen", value: "dozen" },
];

const BARCODE_TYPES = [
  { label: "Code 128", value: "code128" },
  { label: "Code 39", value: "code39" },
  { label: "EAN-13", value: "ean13" },
  { label: "UPC-A", value: "upca" },
  { label: "QR Code", value: "qr" },
];

const DEFAULTS: GeneralConfigFormValues = {
  businessName: "",
  legalName: "",
  businessType: "retail",
  defaultCurrency: "BDT",
  currencySymbol: "৳",
  symbolPosition: "before",
  decimalPlaces: 2,
  thousandSeparator: "comma",
  defaultTimezone: "Asia/Dhaka",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
  fiscalYearStart: "July",
  weekStart: "Sunday",
  defaultUnit: "pc",
  skuPrefix: "SKU",
  barcodeSymbology: "code128",
  lowStockThreshold: 10,
  autoGenerateSku: true,
  allowNegativeStock: false,
  trackBatchAndExpiry: false,
  multiWarehouse: true,
};

export default function GeneralConfigPage() {
  const form = useForm<GeneralConfigFormValues>({
    resolver: zodResolver(GeneralConfigSchema),
    defaultValues: DEFAULTS,
  });

  const onSubmit = (values: GeneralConfigFormValues) => {
    form.reset(values);
    toast.success("General configuration saved", {
      description: "Kept for this session only — the configuration API is not connected yet.",
    });
  };

  return (
    <>
      <PageHeader
        title="General configuration"
        description="The currency, calendar and stock defaults every other SME screen falls back to."
        actions={
          <Badge variant="secondary" className="px-2.5 py-1">
            <Hammer className="size-3" />
            UI only
          </Badge>
        }
      />

      <Form {...form}>
        <form className="flex flex-col gap-4 xl:gap-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:gap-6">
            <SectionCard
              icon={Building2}
              title="Business identity"
              description="How this business is named on documents you send out."
            >
              <FormInput
                control={form.control}
                name="businessName"
                label="Business name"
                placeholder="Vertoone Trading"
              />
              <FormInput
                control={form.control}
                name="legalName"
                label="Registered legal name"
                placeholder="Vertoone Trading Ltd."
              />
              <FormSelect
                control={form.control}
                name="businessType"
                label="Business type"
                options={BUSINESS_TYPES}
                className="mt-auto"
              />
            </SectionCard>

            <SectionCard
              icon={Coins}
              title="Currency & numbers"
              description="Applied to every price, total and report unless a document overrides it."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="defaultCurrency"
                  label="Currency code"
                  placeholder="BDT"
                />
                <FormInput
                  control={form.control}
                  name="currencySymbol"
                  label="Currency symbol"
                  placeholder="৳"
                />
              </div>
              <FormSelect
                control={form.control}
                name="symbolPosition"
                label="Symbol position"
                options={SYMBOL_POSITIONS}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="decimalPlaces"
                  label="Decimal places"
                  type="number"
                />
                <FormSelect
                  control={form.control}
                  name="thousandSeparator"
                  label="Thousand separator"
                  options={SEPARATORS}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={Globe2}
              title="Locale & calendar"
              description="Drives how dates are shown and where a reporting year begins."
            >
              <FormInput
                control={form.control}
                name="defaultTimezone"
                label="Timezone"
                placeholder="Asia/Dhaka"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="dateFormat"
                  label="Date format"
                  options={DATE_FORMATS}
                />
                <FormSelect
                  control={form.control}
                  name="timeFormat"
                  label="Time format"
                  options={TIME_FORMATS}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="fiscalYearStart"
                  label="Fiscal year starts"
                  options={MONTHS}
                />
                <FormSelect
                  control={form.control}
                  name="weekStart"
                  label="Week starts on"
                  options={WEEK_DAYS}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={Package}
              title="Catalogue defaults"
              description="Pre-filled whenever someone adds a new product."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="defaultUnit"
                  label="Default unit"
                  options={UNITS}
                />
                <FormInput
                  control={form.control}
                  name="skuPrefix"
                  label="SKU prefix"
                  placeholder="SKU"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="barcodeSymbology"
                  label="Barcode type"
                  options={BARCODE_TYPES}
                />
                <FormInput
                  control={form.control}
                  name="lowStockThreshold"
                  label="Low stock alert at"
                  type="number"
                  description="Units left before a product is flagged."
                />
              </div>
            </SectionCard>
          </div>

          <SectionCard
            icon={Boxes}
            title="Stock rules"
            description="How inventory behaves when quantities run out or need tracing."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <FormSwitch
                control={form.control}
                name="autoGenerateSku"
                label="Auto-generate SKU"
                description="Build a code from the prefix"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="allowNegativeStock"
                label="Allow negative stock"
                description="Sell below quantity on hand"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="trackBatchAndExpiry"
                label="Track batch & expiry"
                description="Ask for batch on receipt"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="multiWarehouse"
                label="Multiple warehouses"
                description="Count stock per location"
                className="h-full"
              />
            </div>
          </SectionCard>

          <ConfigActions isDirty={form.formState.isDirty} onReset={() => form.reset(DEFAULTS)} />
        </form>
      </Form>
    </>
  );
}
