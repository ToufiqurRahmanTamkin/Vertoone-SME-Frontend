import {
  FormInput,
  FormPassword,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import { PaymentConfigSchema, type PaymentConfigFormValues } from "@/validations/smeConfiguration";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, CreditCard, Hammer, Landmark, TestTube, Wallet } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ConfigActions } from "./components/ConfigActions";
import { ProviderCard } from "./components/ProviderCard";

const GATEWAYS = [
  { label: "Stripe", value: "stripe" },
  { label: "NMI", value: "nmi" },
  { label: "Valor PayTech", value: "valor" },
  { label: "Offline only", value: "offline" },
];

const CAPTURE_MODES = [
  { label: "Capture immediately", value: "automatic" },
  { label: "Authorise now, capture later", value: "manual" },
];

const ENVIRONMENTS = [
  { label: "Sandbox", value: "sandbox" },
  { label: "Production", value: "production" },
];

const DEFAULTS: PaymentConfigFormValues = {
  defaultGateway: "stripe",
  paymentCurrency: "USD",
  captureMode: "automatic",
  testMode: true,
  allowSavedCards: true,
  allowPartialPayment: false,
  surchargePercent: 0,
  statementDescriptor: "",
  stripeEnabled: false,
  stripePublishableKey: "",
  stripeSecretKey: "",
  stripeWebhookSecret: "",
  stripeAccountId: "",
  nmiEnabled: false,
  nmiSecurityKey: "",
  nmiUsername: "",
  nmiPassword: "",
  nmiTokenizationKey: "",
  nmiEndpoint: "https://secure.networkmerchants.com/api/transact.php",
  valorEnabled: false,
  valorMerchantId: "",
  valorAppId: "",
  valorAppKey: "",
  valorEpi: "",
  valorEnvironment: "sandbox",
  cashEnabled: true,
  bankTransferEnabled: true,
  chequeEnabled: false,
  mobileWalletEnabled: true,
  bankInstructions: "",
};

export default function PaymentConfigPage() {
  const form = useForm<PaymentConfigFormValues>({
    resolver: zodResolver(PaymentConfigSchema),
    defaultValues: DEFAULTS,
  });

  const testMode = useWatch({ control: form.control, name: "testMode" });
  const stripeEnabled = useWatch({ control: form.control, name: "stripeEnabled" });
  const nmiEnabled = useWatch({ control: form.control, name: "nmiEnabled" });
  const valorEnabled = useWatch({ control: form.control, name: "valorEnabled" });

  const liveCount = [stripeEnabled, nmiEnabled, valorEnabled].filter(Boolean).length;

  const setEnabled = (name: "stripeEnabled" | "nmiEnabled" | "valorEnabled") => (value: boolean) =>
    form.setValue(name, value, { shouldDirty: true });

  const onSubmit = (values: PaymentConfigFormValues) => {
    form.reset(values);
    toast.success("Payment configuration saved", {
      description: "Kept for this session only — the configuration API is not connected yet.",
    });
  };

  return (
    <>
      <PageHeader
        title="Payment configuration"
        description="Card gateways, their credentials, and the offline ways you still take money."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={testMode ? "secondary" : "success"} className="px-2.5 py-1">
              <TestTube className="size-3" />
              {testMode ? "Test mode" : "Live mode"}
            </Badge>
            <Badge variant="outline" className="px-2.5 py-1">
              {liveCount} of 3 gateways on
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
            icon={Wallet}
            title="Checkout behaviour"
            description="Rules that apply to every gateway before its own settings are read."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <FormSelect
                control={form.control}
                name="defaultGateway"
                label="Default gateway"
                options={GATEWAYS}
              />
              <FormInput
                control={form.control}
                name="paymentCurrency"
                label="Settlement currency"
                placeholder="USD"
              />
              <FormSelect
                control={form.control}
                name="captureMode"
                label="Capture mode"
                options={CAPTURE_MODES}
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <FormInput
                control={form.control}
                name="surchargePercent"
                label="Card surcharge (%)"
                type="number"
                step="0.01"
                description="Added to the total when a customer pays by card."
              />
              <FormInput
                control={form.control}
                name="statementDescriptor"
                label="Statement descriptor"
                placeholder="VERTOONE TRADING"
                description="Up to 22 characters, shown on the cardholder's statement."
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <FormSwitch
                control={form.control}
                name="testMode"
                label="Test mode"
                description="Use sandbox credentials everywhere"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="allowSavedCards"
                label="Allow saved cards"
                description="Let customers store a card on file"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="allowPartialPayment"
                label="Allow part payment"
                description="Accept less than the invoice total"
                className="h-full"
              />
            </div>
          </SectionCard>

          <div className="grid items-stretch gap-4 xl:grid-cols-3 xl:gap-6">
            <ProviderCard
              icon={CreditCard}
              title="Stripe"
              description="Cards, wallets and payment links."
              switchId="stripeEnabled"
              enabled={stripeEnabled}
              onEnabledChange={setEnabled("stripeEnabled")}
              note="Keys live under Developers → API keys. Use the test keys while test mode is on."
            >
              <FormInput
                control={form.control}
                name="stripePublishableKey"
                label="Publishable key"
                placeholder="pk_test_..."
              />
              <FormPassword
                control={form.control}
                name="stripeSecretKey"
                label="Secret key"
                placeholder="sk_test_..."
              />
              <FormPassword
                control={form.control}
                name="stripeWebhookSecret"
                label="Webhook signing secret"
                placeholder="whsec_..."
              />
              <FormInput
                control={form.control}
                name="stripeAccountId"
                label="Connected account ID"
                placeholder="acct_..."
                className="mt-auto"
              />
            </ProviderCard>

            <ProviderCard
              icon={Landmark}
              title="NMI"
              description="Direct post gateway with tokenised card capture."
              switchId="nmiEnabled"
              enabled={nmiEnabled}
              onEnabledChange={setEnabled("nmiEnabled")}
              note="The security key replaces username and password on newer NMI accounts."
            >
              <FormPassword
                control={form.control}
                name="nmiSecurityKey"
                label="Security key"
                placeholder="Gateway security key"
              />
              <FormInput control={form.control} name="nmiUsername" label="Username" />
              <FormPassword control={form.control} name="nmiPassword" label="Password" />
              <FormPassword
                control={form.control}
                name="nmiTokenizationKey"
                label="Collect.js tokenization key"
              />
              <FormInput
                control={form.control}
                name="nmiEndpoint"
                label="Gateway endpoint"
                className="mt-auto"
              />
            </ProviderCard>

            <ProviderCard
              icon={Banknote}
              title="Valor PayTech"
              description="Terminal and virtual-terminal payments."
              switchId="valorEnabled"
              enabled={valorEnabled}
              onEnabledChange={setEnabled("valorEnabled")}
              note="EPI identifies the terminal a transaction is routed to."
            >
              <FormInput
                control={form.control}
                name="valorMerchantId"
                label="Merchant ID"
                placeholder="MID"
              />
              <FormInput control={form.control} name="valorAppId" label="App ID" />
              <FormPassword control={form.control} name="valorAppKey" label="App key" />
              <FormInput
                control={form.control}
                name="valorEpi"
                label="EPI / terminal ID"
                placeholder="2323XXXXXXXX"
              />
              <FormSelect
                control={form.control}
                name="valorEnvironment"
                label="Environment"
                options={ENVIRONMENTS}
                className="mt-auto"
              />
            </ProviderCard>
          </div>

          <SectionCard
            icon={Banknote}
            title="Offline payments"
            description="Ways money reaches you without a gateway, and what the customer is told."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <FormSwitch
                control={form.control}
                name="cashEnabled"
                label="Cash"
                description="Counter and delivery collection"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="bankTransferEnabled"
                label="Bank transfer"
                description="Direct deposit to your account"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="chequeEnabled"
                label="Cheque"
                description="Recorded as pending until cleared"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="mobileWalletEnabled"
                label="Mobile wallet"
                description="bKash, Nagad, Rocket and similar"
                className="h-full"
              />
            </div>
            <FormTextarea
              control={form.control}
              name="bankInstructions"
              label="Bank & wallet instructions"
              placeholder="Account name, account number, branch and routing number printed on the invoice."
              showCharCount={false}
            />
          </SectionCard>

          <ConfigActions isDirty={form.formState.isDirty} onReset={() => form.reset(DEFAULTS)} />
        </form>
      </Form>
    </>
  );
}
