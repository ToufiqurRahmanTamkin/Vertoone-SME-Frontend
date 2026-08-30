import { FormInput, FormPassword, FormSelect, FormSwitch } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FinanceConfigSchema, type FinanceConfigFormValues } from "@/validations/smeConfiguration";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Hammer, Link2, ListChecks, RefreshCw, ScrollText } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ConfigActions } from "../components/ConfigActions";

const PROVIDERS = [
  { label: "Not connected", value: "none" },
  { label: "QuickBooks Online", value: "quickbooks" },
  { label: "Xero", value: "xero" },
  { label: "Zoho Books", value: "zohobooks" },
  { label: "Sage Business Cloud", value: "sage" },
  { label: "Wave", value: "wave" },
];

const PROVIDER_LABELS: Record<string, string> = {
  none: "No accounting system",
  quickbooks: "QuickBooks Online",
  xero: "Xero",
  zohobooks: "Zoho Books",
  sage: "Sage Business Cloud",
  wave: "Wave",
};

const ENVIRONMENTS = [
  { label: "Sandbox", value: "sandbox" },
  { label: "Production", value: "production" },
];

const METHODS = [
  { label: "Accrual", value: "accrual" },
  { label: "Cash", value: "cash" },
];

const DIRECTIONS = [
  { label: "Push to accounting", value: "push" },
  { label: "Pull from accounting", value: "pull" },
  { label: "Two-way", value: "two-way" },
];

const FREQUENCIES = [
  { label: "Manual only", value: "manual" },
  { label: "Every hour", value: "hourly" },
  { label: "Once a day", value: "daily" },
  { label: "Once a week", value: "weekly" },
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

const DEFAULTS: FinanceConfigFormValues = {
  provider: "quickbooks",
  environment: "sandbox",
  clientId: "",
  clientSecret: "",
  realmId: "",
  tenantId: "",
  redirectUri: "",
  accountingMethod: "accrual",
  fiscalYearStart: "July",
  booksCloseDate: "",
  baseCurrency: "BDT",
  syncDirection: "push",
  syncFrequency: "daily",
  syncStartDate: "",
  syncInvoices: true,
  syncPayments: true,
  syncExpenses: true,
  syncProducts: false,
  syncCustomers: true,
  salesAccount: "",
  purchaseAccount: "",
  inventoryAccount: "",
  taxAccount: "",
  discountAccount: "",
  depositAccount: "",
};

export default function FinanceConfigPage() {
  const form = useForm<FinanceConfigFormValues>({
    resolver: zodResolver(FinanceConfigSchema),
    defaultValues: DEFAULTS,
  });

  const provider = useWatch({ control: form.control, name: "provider" });
  const isConnected = provider !== "none";
  const isQuickBooks = provider === "quickbooks";

  const onSubmit = (values: FinanceConfigFormValues) => {
    form.reset(values);
    toast.success("Finance configuration saved", {
      description: "Kept for this session only — the configuration API is not connected yet.",
    });
  };

  return (
    <>
      <PageHeader
        title="Finance configuration"
        description="Your accounting system, what gets pushed to it, and which ledger accounts things land in."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "success" : "outline"} className="px-2.5 py-1">
              <Link2 className="size-3" />
              {PROVIDER_LABELS[provider]}
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
              icon={Calculator}
              title="Accounting system"
              description="The books this workspace reconciles against."
              action={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  disabled={!isConnected}
                  onClick={() =>
                    toast.info(`${PROVIDER_LABELS[provider]} is not connected yet`, {
                      description: "The OAuth handshake is wired up in a later step.",
                    })
                  }
                >
                  <Link2 className="mr-1.5 h-4 w-4" />
                  Connect
                </Button>
              }
            >
              <FormSelect
                control={form.control}
                name="provider"
                label="Provider"
                options={PROVIDERS}
              />
              <FormSelect
                control={form.control}
                name="environment"
                label="Environment"
                options={ENVIRONMENTS}
                disabled={!isConnected}
              />
              <FormInput
                control={form.control}
                name="clientId"
                label="Client ID"
                disabled={!isConnected}
              />
              <FormPassword
                control={form.control}
                name="clientSecret"
                label="Client secret"
                disabled={!isConnected}
              />
              <div className="mt-auto grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="realmId"
                  label={isQuickBooks ? "Realm (company) ID" : "Company ID"}
                  disabled={!isConnected}
                />
                <FormInput
                  control={form.control}
                  name="tenantId"
                  label="Tenant ID"
                  description="Used by Xero and Sage."
                  disabled={!isConnected}
                />
              </div>
              <FormInput
                control={form.control}
                name="redirectUri"
                label="Redirect URI"
                placeholder="https://app.yourdomain.com/oauth/callback"
                disabled={!isConnected}
              />
            </SectionCard>

            <SectionCard
              icon={ScrollText}
              title="Books & period"
              description="How results are recognised and where a financial year starts."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="accountingMethod"
                  label="Accounting method"
                  options={METHODS}
                />
                <FormSelect
                  control={form.control}
                  name="fiscalYearStart"
                  label="Fiscal year starts"
                  options={MONTHS}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="baseCurrency"
                  label="Base currency"
                  placeholder="BDT"
                />
                <FormInput
                  control={form.control}
                  name="booksCloseDate"
                  label="Books closed through"
                  type="date"
                  description="Entries on or before this date are locked."
                />
              </div>
              <FormInput
                control={form.control}
                name="syncStartDate"
                label="Sync records from"
                type="date"
                description="Nothing dated earlier is sent to the accounting system."
                className="mt-auto"
              />
            </SectionCard>
          </div>

          <SectionCard
            icon={RefreshCw}
            title="Sync rules"
            description="Which records travel between the two systems, and how often."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <FormSelect
                control={form.control}
                name="syncDirection"
                label="Direction"
                options={DIRECTIONS}
                disabled={!isConnected}
              />
              <FormSelect
                control={form.control}
                name="syncFrequency"
                label="Frequency"
                options={FREQUENCIES}
                disabled={!isConnected}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <FormSwitch
                control={form.control}
                name="syncInvoices"
                label="Invoices"
                description="Sales invoices and credit notes"
                className="h-full"
                disabled={!isConnected}
              />
              <FormSwitch
                control={form.control}
                name="syncPayments"
                label="Payments"
                description="Receipts against invoices"
                className="h-full"
                disabled={!isConnected}
              />
              <FormSwitch
                control={form.control}
                name="syncExpenses"
                label="Expenses"
                description="Bills and purchase payments"
                className="h-full"
                disabled={!isConnected}
              />
              <FormSwitch
                control={form.control}
                name="syncProducts"
                label="Products"
                description="Items and their prices"
                className="h-full"
                disabled={!isConnected}
              />
              <FormSwitch
                control={form.control}
                name="syncCustomers"
                label="Customers"
                description="Contacts and suppliers"
                className="h-full"
                disabled={!isConnected}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={ListChecks}
            title="Chart of accounts mapping"
            description="Where each kind of amount is posted in the ledger."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <FormInput
                control={form.control}
                name="salesAccount"
                label="Sales income"
                placeholder="4000 · Sales"
                disabled={!isConnected}
              />
              <FormInput
                control={form.control}
                name="purchaseAccount"
                label="Cost of goods sold"
                placeholder="5000 · Purchases"
                disabled={!isConnected}
              />
              <FormInput
                control={form.control}
                name="inventoryAccount"
                label="Inventory asset"
                placeholder="1200 · Stock on hand"
                disabled={!isConnected}
              />
              <FormInput
                control={form.control}
                name="taxAccount"
                label="Tax payable"
                placeholder="2200 · VAT payable"
                disabled={!isConnected}
              />
              <FormInput
                control={form.control}
                name="discountAccount"
                label="Discounts given"
                placeholder="4100 · Discounts"
                disabled={!isConnected}
              />
              <FormInput
                control={form.control}
                name="depositAccount"
                label="Default deposit account"
                placeholder="1000 · Bank"
                disabled={!isConnected}
              />
            </div>
          </SectionCard>

          <ConfigActions isDirty={form.formState.isDirty} onReset={() => form.reset(DEFAULTS)} />
        </form>
      </Form>
    </>
  );
}
