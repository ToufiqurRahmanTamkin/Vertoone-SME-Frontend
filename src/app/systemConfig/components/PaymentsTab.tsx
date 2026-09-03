import { FileUploader } from "@/components/shared/file-uploader";
import { FormInput, FormPassword, FormSelect, FormTextarea } from "@/components/shared/form-fields";
import { ProviderCard } from "@/components/shared/provider-card";
import { SectionCard } from "@/components/shared/section-card";
import { toOptions } from "@/constant";
import {
  GATEWAY_ENVIRONMENT_LABELS,
  PAYMENT_GATEWAY_LABELS,
  type SystemConfig,
} from "@/types/domain/systemConfig";
import type { SystemConfigFormValues } from "@/validations/systemConfig";
import { CreditCard, Landmark, QrCode, Wallet } from "lucide-react";
import type { Control, UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

const ENVIRONMENT_OPTIONS = toOptions(GATEWAY_ENVIRONMENT_LABELS);
const DEFAULT_GATEWAY_OPTIONS = toOptions(PAYMENT_GATEWAY_LABELS);

interface PaymentsTabProps {
  form: UseFormReturn<SystemConfigFormValues>;
  config?: SystemConfig;
}

const secretHint = (isStored: boolean): string =>
  isStored ? "Stored. Leave blank to keep it, or type a new one to replace it." : "Not set yet.";

const useToggle = (
  control: Control<SystemConfigFormValues>,
  name: keyof SystemConfigFormValues
): boolean => Boolean(useWatch({ control, name }));

export function PaymentsTab({ form, config }: PaymentsTabProps) {
  const { control } = form;

  const qrEnabled = useToggle(control, "paymentQrEnabled");
  const stripeEnabled = useToggle(control, "stripeEnabled");
  const nmiEnabled = useToggle(control, "nmiEnabled");
  const valorEnabled = useToggle(control, "valorEnabled");
  const paypalEnabled = useToggle(control, "paypalEnabled");

  const paymentQrUrl = useWatch({ control, name: "paymentQrUrl" });
  const paymentQrPublicId = useWatch({ control, name: "paymentQrPublicId" });

  const gateways = config?.paymentGateways;

  const setEnabled = (name: keyof SystemConfigFormValues) => (next: boolean) =>
    form.setValue(name, next, { shouldDirty: true });

  return (
    <div className="grid items-start gap-4 xl:gap-6">
      <SectionCard
        icon={Wallet}
        title="How buyers pay"
        description="Pick the method offered first at checkout. Every method you enable below stays available as an alternative."
      >
        <FormSelect
          control={control}
          name="defaultGateway"
          label="Default payment method"
          options={DEFAULT_GATEWAY_OPTIONS}
          description="Manual / QR always stays on — it is the fallback when a gateway is unreachable."
          className="sm:max-w-sm"
        />
      </SectionCard>

      <div className="grid items-start gap-4 lg:grid-cols-2 xl:gap-6">
        <ProviderCard
          icon={QrCode}
          title="Manual / QR"
          description="Shown to the buyer whenever a non-card method is picked, so they can pay and hand back a transaction ID for you to approve."
          enabled={qrEnabled}
          onEnabledChange={setEnabled("paymentQrEnabled")}
          switchId="system-payment-qr"
        >
          <FileUploader
            value={paymentQrUrl}
            publicId={paymentQrPublicId}
            folder="payment-qr"
            label="QR image"
            description="PNG or JPG works best. Keep the code high-contrast and uncropped."
            disabled={!qrEnabled}
            onChange={(asset) => {
              form.setValue("paymentQrUrl", asset?.url ?? "", { shouldDirty: true });
              form.setValue("paymentQrPublicId", asset?.publicId ?? "", { shouldDirty: true });
            }}
          />
          <FormTextarea
            control={control}
            name="paymentInstructions"
            label="Payment instructions"
            placeholder="Scan the QR with your mobile wallet, then enter the transaction ID below."
            showCharCount={false}
            className="mt-auto"
          />
        </ProviderCard>

        <ProviderCard
          icon={CreditCard}
          title="Stripe"
          description="Cards and wallets through your Stripe account."
          enabled={stripeEnabled}
          onEnabledChange={setEnabled("stripeEnabled")}
          switchId="system-payment-stripe"
          note="Point your Stripe webhook at /api/v1/webhooks/stripe and paste the signing secret here."
        >
          <FormSelect
            control={control}
            name="stripeEnvironment"
            label="Environment"
            options={ENVIRONMENT_OPTIONS}
            disabled={!stripeEnabled}
          />
          <FormInput
            control={control}
            name="stripePublishableKey"
            label="Publishable key"
            placeholder="pk_live_..."
            disabled={!stripeEnabled}
          />
          <FormPassword
            control={control}
            name="stripeSecretKey"
            label="Secret key"
            description={secretHint(Boolean(gateways?.stripe.hasSecretKey))}
            disabled={!stripeEnabled}
          />
          <FormPassword
            control={control}
            name="stripeWebhookSecret"
            label="Webhook signing secret"
            description={secretHint(Boolean(gateways?.stripe.hasWebhookSecret))}
            disabled={!stripeEnabled}
          />
          <FormInput
            control={control}
            name="stripeAccountId"
            label="Connected account ID"
            placeholder="acct_..."
            disabled={!stripeEnabled}
          />
        </ProviderCard>

        <ProviderCard
          icon={Landmark}
          title="NMI"
          description="Network Merchants gateway for card-present and card-not-present traffic."
          enabled={nmiEnabled}
          onEnabledChange={setEnabled("nmiEnabled")}
          switchId="system-payment-nmi"
        >
          <FormSelect
            control={control}
            name="nmiEnvironment"
            label="Environment"
            options={ENVIRONMENT_OPTIONS}
            disabled={!nmiEnabled}
          />
          <FormInput
            control={control}
            name="nmiUsername"
            label="Username"
            disabled={!nmiEnabled}
          />
          <FormPassword
            control={control}
            name="nmiPassword"
            label="Password"
            description={secretHint(Boolean(gateways?.nmi.hasPassword))}
            disabled={!nmiEnabled}
          />
          <FormPassword
            control={control}
            name="nmiSecurityKey"
            label="Security key"
            description={secretHint(Boolean(gateways?.nmi.hasSecurityKey))}
            disabled={!nmiEnabled}
          />
          <FormInput
            control={control}
            name="nmiTokenizationKey"
            label="Tokenization key"
            disabled={!nmiEnabled}
          />
          <FormInput
            control={control}
            name="nmiEndpoint"
            label="API endpoint"
            disabled={!nmiEnabled}
          />
        </ProviderCard>

        <ProviderCard
          icon={CreditCard}
          title="Valor PayTech"
          description="Valor terminals and hosted checkout."
          enabled={valorEnabled}
          onEnabledChange={setEnabled("valorEnabled")}
          switchId="system-payment-valor"
        >
          <FormSelect
            control={control}
            name="valorEnvironment"
            label="Environment"
            options={ENVIRONMENT_OPTIONS}
            disabled={!valorEnabled}
          />
          <FormInput
            control={control}
            name="valorMerchantId"
            label="Merchant ID"
            disabled={!valorEnabled}
          />
          <FormInput control={control} name="valorAppId" label="App ID" disabled={!valorEnabled} />
          <FormPassword
            control={control}
            name="valorAppKey"
            label="App key"
            description={secretHint(Boolean(gateways?.valor.hasAppKey))}
            disabled={!valorEnabled}
          />
          <FormInput
            control={control}
            name="valorEpi"
            label="EPI"
            description="The terminal identifier Valor issued for this merchant."
            disabled={!valorEnabled}
          />
        </ProviderCard>

        <ProviderCard
          icon={Wallet}
          title="PayPal"
          description="PayPal balance, cards and Pay Later at checkout."
          enabled={paypalEnabled}
          onEnabledChange={setEnabled("paypalEnabled")}
          switchId="system-payment-paypal"
        >
          <FormSelect
            control={control}
            name="paypalEnvironment"
            label="Environment"
            options={ENVIRONMENT_OPTIONS}
            disabled={!paypalEnabled}
          />
          <FormInput
            control={control}
            name="paypalClientId"
            label="Client ID"
            disabled={!paypalEnabled}
          />
          <FormPassword
            control={control}
            name="paypalClientSecret"
            label="Client secret"
            description={secretHint(Boolean(gateways?.paypal.hasClientSecret))}
            disabled={!paypalEnabled}
          />
          <FormInput
            control={control}
            name="paypalWebhookId"
            label="Webhook ID"
            disabled={!paypalEnabled}
          />
        </ProviderCard>
      </div>
    </div>
  );
}
