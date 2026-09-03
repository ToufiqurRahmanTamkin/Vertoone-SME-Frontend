import { FileUploader } from "@/components/shared/file-uploader";
import { FormInput, FormPassword, FormSelect, FormTextarea } from "@/components/shared/form-fields";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toOptions } from "@/constant";
import { cn } from "@/lib/utils";
import {
  GATEWAY_ENVIRONMENT_LABELS,
  PAYMENT_GATEWAY_LABELS,
  type PaymentGateway,
  type SystemConfig,
} from "@/types/domain/systemConfig";
import type { SystemConfigFormValues } from "@/validations/systemConfig";
import { Check, CreditCard, Landmark, QrCode, TriangleAlert, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";

const ENVIRONMENT_OPTIONS = toOptions(GATEWAY_ENVIRONMENT_LABELS);
const DEFAULT_GATEWAY_OPTIONS = toOptions(PAYMENT_GATEWAY_LABELS);

type EnabledField = Extract<
  keyof SystemConfigFormValues,
  "paymentQrEnabled" | "stripeEnabled" | "nmiEnabled" | "valorEnabled" | "paypalEnabled"
>;

interface MethodDefinition {
  id: PaymentGateway;
  label: string;
  blurb: string;
  icon: LucideIcon;
  enabledField: EnabledField;
}

const METHODS: readonly MethodDefinition[] = [
  {
    id: "MANUAL",
    label: PAYMENT_GATEWAY_LABELS.MANUAL,
    blurb: "Buyer scans and pays, you approve the transaction ID",
    icon: QrCode,
    enabledField: "paymentQrEnabled",
  },
  {
    id: "STRIPE",
    label: PAYMENT_GATEWAY_LABELS.STRIPE,
    blurb: "Cards and wallets through your Stripe account",
    icon: CreditCard,
    enabledField: "stripeEnabled",
  },
  {
    id: "NMI",
    label: PAYMENT_GATEWAY_LABELS.NMI,
    blurb: "Network Merchants card gateway",
    icon: Landmark,
    enabledField: "nmiEnabled",
  },
  {
    id: "VALOR",
    label: PAYMENT_GATEWAY_LABELS.VALOR,
    blurb: "Valor terminals and hosted checkout",
    icon: CreditCard,
    enabledField: "valorEnabled",
  },
  {
    id: "PAYPAL",
    label: PAYMENT_GATEWAY_LABELS.PAYPAL,
    blurb: "PayPal balance, cards and Pay Later",
    icon: Wallet,
    enabledField: "paypalEnabled",
  },
];

interface PaymentsTabProps {
  form: UseFormReturn<SystemConfigFormValues>;
  config?: SystemConfig;
}

const secretHint = (isStored: boolean): string =>
  isStored
    ? "Stored. Leave blank to keep it, or type a new one to replace it."
    : "Not set yet. It is never shown again once saved.";

export function PaymentsTab({ form, config }: PaymentsTabProps) {
  const { control } = form;
  const values = useWatch({ control }) as Partial<SystemConfigFormValues>;
  const gateways = config?.paymentGateways;

  const [selected, setSelected] = React.useState<PaymentGateway>("MANUAL");

  const filled = (value: string | undefined): boolean => Boolean(value && value.trim());

  const isConfigured = (id: PaymentGateway): boolean => {
    switch (id) {
      case "MANUAL":
        return filled(values.paymentQrUrl);
      case "STRIPE":
        return (
          filled(values.stripePublishableKey) &&
          (Boolean(gateways?.stripe.hasSecretKey) || filled(values.stripeSecretKey))
        );
      case "NMI":
        return (
          filled(values.nmiUsername) &&
          (Boolean(gateways?.nmi.hasSecurityKey) || filled(values.nmiSecurityKey))
        );
      case "VALOR":
        return (
          filled(values.valorMerchantId) &&
          filled(values.valorAppId) &&
          (Boolean(gateways?.valor.hasAppKey) || filled(values.valorAppKey))
        );
      case "PAYPAL":
        return (
          filled(values.paypalClientId) &&
          (Boolean(gateways?.paypal.hasClientSecret) || filled(values.paypalClientSecret))
        );
    }
  };

  const isEnabled = (method: MethodDefinition): boolean =>
    Boolean(values[method.enabledField]);

  const enabledCount = METHODS.filter(isEnabled).length;
  const active = METHODS.find((method) => method.id === selected) ?? METHODS[0];
  const activeEnabled = isEnabled(active);
  const activeConfigured = isConfigured(active.id);

  const toggle = (method: MethodDefinition, next: boolean) => {
    form.setValue(method.enabledField, next, { shouldDirty: true });
    setSelected(method.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between md:p-5">
        <FormSelect
          control={control}
          name="defaultGateway"
          label="Offer this method first at checkout"
          options={DEFAULT_GATEWAY_OPTIONS}
          description="Every method switched on below stays available as an alternative."
          className="w-full sm:max-w-xs"
        />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{enabledCount}</span> of {METHODS.length}{" "}
          methods switched on
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:items-start">
        <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
          {METHODS.map((method) => {
            const Icon = method.icon;
            const enabled = isEnabled(method);
            const configured = isConfigured(method.id);
            const isSelected = method.id === active.id;

            return (
              <li key={method.id}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 transition-colors",
                    isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(method.id)}
                    aria-current={isSelected ? "true" : undefined}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                        enabled
                          ? "bg-background text-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">{method.label}</span>
                        {enabled && !configured && (
                          <TriangleAlert className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        )}
                        {enabled && configured && (
                          <Check className="size-3.5 shrink-0 text-green-600 dark:text-green-400" />
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {enabled
                          ? configured
                            ? "Ready"
                            : "Needs credentials"
                          : "Off"}
                      </span>
                    </span>
                  </button>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(next) => toggle(method, next)}
                    aria-label={`Switch ${method.label} ${enabled ? "off" : "on"}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b bg-muted/40 px-5 py-4 md:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground shadow-sm">
                <active.icon className="size-4.5" />
              </span>
              <div className="min-w-0 space-y-1">
                <h3 className="text-base leading-tight font-semibold">{active.label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{active.blurb}</p>
              </div>
            </div>
            <Badge
              variant={activeEnabled ? (activeConfigured ? "success" : "outline") : "outline"}
              className="shrink-0 px-2.5 py-1"
            >
              {activeEnabled ? (activeConfigured ? "Ready" : "Needs credentials") : "Off"}
            </Badge>
          </header>

          <div
            className={cn(
              "flex flex-col gap-4 p-5 md:p-6",
              !activeEnabled && "opacity-70"
            )}
          >
            {!activeEnabled && (
              <p className="rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
                {active.label} is switched off. Fill these in now and flip the switch when you are
                ready — nothing is offered to buyers until it is on.
              </p>
            )}

            {active.id === "MANUAL" && (
              <ManualFields form={form} disabled={!activeEnabled} values={values} />
            )}
            {active.id === "STRIPE" && (
              <StripeFields form={form} disabled={!activeEnabled} config={config} />
            )}
            {active.id === "NMI" && (
              <NmiFields form={form} disabled={!activeEnabled} config={config} />
            )}
            {active.id === "VALOR" && (
              <ValorFields form={form} disabled={!activeEnabled} config={config} />
            )}
            {active.id === "PAYPAL" && (
              <PaypalFields form={form} disabled={!activeEnabled} config={config} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

interface FieldsProps {
  form: UseFormReturn<SystemConfigFormValues>;
  disabled: boolean;
  config?: SystemConfig;
}

function EnvironmentField({
  form,
  disabled,
  name,
}: {
  form: UseFormReturn<SystemConfigFormValues>;
  disabled: boolean;
  name: Extract<
    keyof SystemConfigFormValues,
    "stripeEnvironment" | "nmiEnvironment" | "valorEnvironment" | "paypalEnvironment"
  >;
}) {
  return (
    <FormSelect
      control={form.control}
      name={name}
      label="Environment"
      options={ENVIRONMENT_OPTIONS}
      description="Sandbox keys never move real money."
      disabled={disabled}
      className="sm:max-w-xs"
    />
  );
}

function ManualFields({
  form,
  disabled,
  values,
}: {
  form: UseFormReturn<SystemConfigFormValues>;
  disabled: boolean;
  values: Partial<SystemConfigFormValues>;
}) {
  return (
    <>
      <FileUploader
        value={values.paymentQrUrl}
        publicId={values.paymentQrPublicId}
        folder="payment-qr"
        label="QR image"
        description="PNG or JPG works best. Keep the code high-contrast and uncropped."
        disabled={disabled}
        onChange={(asset) => {
          form.setValue("paymentQrUrl", asset?.url ?? "", { shouldDirty: true });
          form.setValue("paymentQrPublicId", asset?.publicId ?? "", { shouldDirty: true });
        }}
      />
      <FormTextarea
        control={form.control}
        name="paymentInstructions"
        label="Payment instructions"
        placeholder="Scan the QR with your mobile wallet, then enter the transaction ID below."
        description="Shown under the QR at checkout."
        showCharCount={false}
        disabled={disabled}
      />
    </>
  );
}

function StripeFields({ form, disabled, config }: FieldsProps) {
  const stripe = config?.paymentGateways.stripe;

  return (
    <>
      <EnvironmentField form={form} disabled={disabled} name="stripeEnvironment" />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          control={form.control}
          name="stripePublishableKey"
          label="Publishable key"
          placeholder="pk_live_..."
          disabled={disabled}
        />
        <FormInput
          control={form.control}
          name="stripeAccountId"
          label="Connected account ID"
          placeholder="acct_..."
          description="Only needed for Stripe Connect."
          disabled={disabled}
        />
        <FormPassword
          control={form.control}
          name="stripeSecretKey"
          label="Secret key"
          description={secretHint(Boolean(stripe?.hasSecretKey))}
          disabled={disabled}
        />
        <FormPassword
          control={form.control}
          name="stripeWebhookSecret"
          label="Webhook signing secret"
          description={secretHint(Boolean(stripe?.hasWebhookSecret))}
          disabled={disabled}
        />
      </div>
    </>
  );
}

function NmiFields({ form, disabled, config }: FieldsProps) {
  const nmi = config?.paymentGateways.nmi;

  return (
    <>
      <EnvironmentField form={form} disabled={disabled} name="nmiEnvironment" />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          control={form.control}
          name="nmiUsername"
          label="Username"
          disabled={disabled}
        />
        <FormPassword
          control={form.control}
          name="nmiPassword"
          label="Password"
          description={secretHint(Boolean(nmi?.hasPassword))}
          disabled={disabled}
        />
        <FormPassword
          control={form.control}
          name="nmiSecurityKey"
          label="Security key"
          description={secretHint(Boolean(nmi?.hasSecurityKey))}
          disabled={disabled}
        />
        <FormInput
          control={form.control}
          name="nmiTokenizationKey"
          label="Tokenization key"
          description="Used by the hosted card fields."
          disabled={disabled}
        />
      </div>
      <FormInput
        control={form.control}
        name="nmiEndpoint"
        label="API endpoint"
        disabled={disabled}
      />
    </>
  );
}

function ValorFields({ form, disabled, config }: FieldsProps) {
  const valor = config?.paymentGateways.valor;

  return (
    <>
      <EnvironmentField form={form} disabled={disabled} name="valorEnvironment" />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          control={form.control}
          name="valorMerchantId"
          label="Merchant ID"
          disabled={disabled}
        />
        <FormInput control={form.control} name="valorAppId" label="App ID" disabled={disabled} />
        <FormPassword
          control={form.control}
          name="valorAppKey"
          label="App key"
          description={secretHint(Boolean(valor?.hasAppKey))}
          disabled={disabled}
        />
        <FormInput
          control={form.control}
          name="valorEpi"
          label="EPI"
          description="The terminal identifier Valor issued for this merchant."
          disabled={disabled}
        />
      </div>
    </>
  );
}

function PaypalFields({ form, disabled, config }: FieldsProps) {
  const paypal = config?.paymentGateways.paypal;

  return (
    <>
      <EnvironmentField form={form} disabled={disabled} name="paypalEnvironment" />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          control={form.control}
          name="paypalClientId"
          label="Client ID"
          disabled={disabled}
        />
        <FormPassword
          control={form.control}
          name="paypalClientSecret"
          label="Client secret"
          description={secretHint(Boolean(paypal?.hasClientSecret))}
          disabled={disabled}
        />
        <FormInput
          control={form.control}
          name="paypalWebhookId"
          label="Webhook ID"
          description="From the webhook you registered in the PayPal dashboard."
          disabled={disabled}
        />
      </div>
    </>
  );
}

