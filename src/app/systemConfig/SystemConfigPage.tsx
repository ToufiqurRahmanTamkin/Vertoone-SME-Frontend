import {
  FormInput,
  FormPhone,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from "@/constant/locale";
import { cn } from "@/lib/utils";
import {
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
} from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { SystemConfig, SystemConfigPayload } from "@/types/domain/systemConfig";
import { SystemConfigSchema, type SystemConfigFormValues } from "@/validations/systemConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Globe2, Loader2, Power, RotateCcw, Save, Wallet } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PaymentsTab } from "./components/PaymentsTab";

const TABS = [
  { id: "identity", label: "Identity & support", icon: Building2 },
  { id: "regional", label: "Regional defaults", icon: Globe2 },
  { id: "payments", label: "Payments", icon: Wallet },
  { id: "availability", label: "Availability", icon: Power },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_PARAM = "tab";

const DEFAULT_TAB: TabId = "identity";

const isTabId = (value: string | null): value is TabId =>
  TABS.some((tab) => tab.id === value);

const TAB_FIELDS: Record<TabId, readonly (keyof SystemConfigFormValues)[]> = {
  identity: ["appName", "supportEmail", "supportPhone"],
  regional: ["defaultCurrency", "defaultTimezone", "trialDays"],
  payments: [
    "defaultGateway",
    "paymentQrEnabled",
    "paymentQrUrl",
    "paymentQrPublicId",
    "paymentInstructions",
    "stripeEnabled",
    "stripeEnvironment",
    "stripePublishableKey",
    "stripeAccountId",
    "stripeSecretKey",
    "stripeWebhookSecret",
    "nmiEnabled",
    "nmiEnvironment",
    "nmiUsername",
    "nmiTokenizationKey",
    "nmiEndpoint",
    "nmiPassword",
    "nmiSecurityKey",
    "valorEnabled",
    "valorEnvironment",
    "valorMerchantId",
    "valorAppId",
    "valorEpi",
    "valorAppKey",
    "paypalEnabled",
    "paypalEnvironment",
    "paypalClientId",
    "paypalWebhookId",
    "paypalClientSecret",
  ],
  availability: ["allowSignups", "maintenanceMode", "maintenanceMessage"],
};

const tabOf = (field: string): TabId => {
  const match = TABS.find((tab) =>
    TAB_FIELDS[tab.id].includes(field as keyof SystemConfigFormValues)
  );
  return match?.id ?? DEFAULT_TAB;
};

const toFormValues = (config: SystemConfig): SystemConfigFormValues => {
  const { stripe, nmi, valor, paypal } = config.paymentGateways;

  return {
    appName: config.appName,
    supportEmail: config.supportEmail ?? "",
    supportPhone: config.supportPhone ?? "",
    defaultCurrency: config.defaultCurrency,
    defaultTimezone: config.defaultTimezone,
    maintenanceMode: config.maintenanceMode,
    maintenanceMessage: config.maintenanceMessage ?? "",
    allowSignups: config.allowSignups,
    trialDays: config.trialDays,

    defaultGateway: config.paymentGateways.defaultGateway,

    paymentQrEnabled: config.paymentQrEnabled,
    paymentQrUrl: config.paymentQrUrl ?? "",
    paymentQrPublicId: config.paymentQrPublicId ?? "",
    paymentInstructions: config.paymentInstructions ?? "",

    stripeEnabled: stripe.enabled,
    stripeEnvironment: stripe.environment,
    stripePublishableKey: stripe.publishableKey ?? "",
    stripeAccountId: stripe.accountId ?? "",
    stripeSecretKey: "",
    stripeWebhookSecret: "",

    nmiEnabled: nmi.enabled,
    nmiEnvironment: nmi.environment,
    nmiUsername: nmi.username ?? "",
    nmiTokenizationKey: nmi.tokenizationKey ?? "",
    nmiEndpoint: nmi.endpoint ?? "",
    nmiPassword: "",
    nmiSecurityKey: "",

    valorEnabled: valor.enabled,
    valorEnvironment: valor.environment,
    valorMerchantId: valor.merchantId ?? "",
    valorAppId: valor.appId ?? "",
    valorEpi: valor.epi ?? "",
    valorAppKey: "",

    paypalEnabled: paypal.enabled,
    paypalEnvironment: paypal.environment,
    paypalClientId: paypal.clientId ?? "",
    paypalWebhookId: paypal.webhookId ?? "",
    paypalClientSecret: "",
  };
};

const toPayload = (values: SystemConfigFormValues): SystemConfigPayload => ({
  appName: values.appName,
  supportEmail: values.supportEmail,
  supportPhone: values.supportPhone,
  defaultCurrency: values.defaultCurrency.toUpperCase(),
  defaultTimezone: values.defaultTimezone,
  maintenanceMode: values.maintenanceMode,
  maintenanceMessage: values.maintenanceMessage,
  allowSignups: values.allowSignups,
  trialDays: values.trialDays,
  paymentQrEnabled: values.paymentQrEnabled,
  paymentQrUrl: values.paymentQrUrl,
  paymentQrPublicId: values.paymentQrPublicId,
  paymentInstructions: values.paymentInstructions,
  paymentGateways: {
    defaultGateway: values.defaultGateway,
    stripe: {
      enabled: values.stripeEnabled,
      environment: values.stripeEnvironment,
      publishableKey: values.stripePublishableKey,
      accountId: values.stripeAccountId,
      secretKey: values.stripeSecretKey,
      webhookSecret: values.stripeWebhookSecret,
    },
    nmi: {
      enabled: values.nmiEnabled,
      environment: values.nmiEnvironment,
      username: values.nmiUsername,
      tokenizationKey: values.nmiTokenizationKey,
      endpoint: values.nmiEndpoint,
      password: values.nmiPassword,
      securityKey: values.nmiSecurityKey,
    },
    valor: {
      enabled: values.valorEnabled,
      environment: values.valorEnvironment,
      merchantId: values.valorMerchantId,
      appId: values.valorAppId,
      epi: values.valorEpi,
      appKey: values.valorAppKey,
    },
    paypal: {
      enabled: values.paypalEnabled,
      environment: values.paypalEnvironment,
      clientId: values.paypalClientId,
      webhookId: values.paypalWebhookId,
      clientSecret: values.paypalClientSecret,
    },
  },
});

export default function SystemConfigPage() {
  const { data: config, isLoading } = useGetSystemConfigQuery();
  const [updateConfig, { isLoading: isSaving }] = useUpdateSystemConfigMutation();

  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get(TAB_PARAM);
  const tab: TabId = isTabId(tabParam) ? tabParam : DEFAULT_TAB;

  const setTab = React.useCallback(
    (next: TabId) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);
          params.set(TAB_PARAM, next);
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const form = useForm<SystemConfigFormValues>({
    resolver: zodResolver(SystemConfigSchema),
    defaultValues: {
      appName: "",
      supportEmail: "",
      supportPhone: "",
      defaultCurrency: "BDT",
      defaultTimezone: "Asia/Dhaka",
      maintenanceMode: false,
      maintenanceMessage: "",
      allowSignups: true,
      trialDays: 14,
      defaultGateway: "MANUAL",
      paymentQrEnabled: true,
      paymentQrUrl: "",
      paymentQrPublicId: "",
      paymentInstructions: "",
      stripeEnabled: false,
      stripeEnvironment: "SANDBOX",
      stripePublishableKey: "",
      stripeAccountId: "",
      stripeSecretKey: "",
      stripeWebhookSecret: "",
      nmiEnabled: false,
      nmiEnvironment: "SANDBOX",
      nmiUsername: "",
      nmiTokenizationKey: "",
      nmiEndpoint: "",
      nmiPassword: "",
      nmiSecurityKey: "",
      valorEnabled: false,
      valorEnvironment: "SANDBOX",
      valorMerchantId: "",
      valorAppId: "",
      valorEpi: "",
      valorAppKey: "",
      paypalEnabled: false,
      paypalEnvironment: "SANDBOX",
      paypalClientId: "",
      paypalWebhookId: "",
      paypalClientSecret: "",
    },
  });

  React.useEffect(() => {
    if (config) form.reset(toFormValues(config));
  }, [config, form]);

  const maintenanceMode = useWatch({ control: form.control, name: "maintenanceMode" });

  const isDirty = form.formState.isDirty;

  const onSubmit = async (values: SystemConfigFormValues) => {
    try {
      const saved = await updateConfig(toPayload(values)).unwrap();
      form.reset(toFormValues(saved));
      toast.success("System configuration saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the configuration");
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstField = Object.keys(errors)[0];
    if (firstField) setTab(tabOf(firstField));
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="System Config" description="Platform-wide defaults and switches." />
        <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
        <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="System Config"
        description="Platform-wide defaults and switches. These apply to every part of the console."
      />

      <Form {...form}>
        <form
          className="flex flex-col gap-4 xl:gap-6"
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        >
          <Tabs value={tab} onValueChange={(next) => setTab(next as TabId)} className="gap-4">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-1 sm:w-fit">
              {TABS.map(({ id, label, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="cursor-pointer gap-1.5 px-3 py-1.5">
                  <Icon className="size-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="identity">
              <SectionCard
                icon={Building2}
                title="Identity & support"
                description="How the platform names itself and where customers reach you."
              >
                <FormInput control={form.control} name="appName" label="App name" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput control={form.control} name="supportEmail" label="Support email" />
                  <FormPhone control={form.control} name="supportPhone" label="Support phone" />
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent value="regional">
              <SectionCard
                icon={Globe2}
                title="Regional defaults"
                description="Applied wherever a new plan, subscription or finance entry does not set its own."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormSelect
                    control={form.control}
                    name="defaultCurrency"
                    label="Default currency"
                    placeholder="Select a currency"
                    options={CURRENCY_OPTIONS}
                    description="Invoices and finance entries are recorded in this currency."
                    searchable
                  />
                  <FormInput
                    control={form.control}
                    name="trialDays"
                    label="Trial days"
                    type="number"
                    description="The default offered on a new plan."
                  />
                </div>
                <FormSelect
                  control={form.control}
                  name="defaultTimezone"
                  label="Default timezone"
                  placeholder="Select a timezone"
                  options={TIMEZONE_OPTIONS}
                  searchable
                />
              </SectionCard>
            </TabsContent>

            <TabsContent value="payments">
              <PaymentsTab form={form} config={config} />
            </TabsContent>

            <TabsContent value="availability">
              <SectionCard
                icon={Power}
                title="Availability"
                description="Who can join the platform, and how you take it offline for everyone."
                action={
                  maintenanceMode ? (
                    <Badge variant="destructive" className="px-2.5 py-1">
                      Offline
                    </Badge>
                  ) : null
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormSwitch
                    control={form.control}
                    name="allowSignups"
                    label="Allow signups"
                    description="Let new customers register"
                    className="h-full"
                  />
                  <FormSwitch
                    control={form.control}
                    name="maintenanceMode"
                    label="Maintenance mode"
                    description="Show the message instead of the app"
                    className={cn(
                      "h-full",
                      maintenanceMode && "border-destructive/40 bg-destructive/5"
                    )}
                  />
                </div>
                <FormTextarea
                  control={form.control}
                  name="maintenanceMessage"
                  label="Maintenance message"
                  placeholder="We are performing scheduled maintenance. Please check back shortly."
                  showCharCount={false}
                  className="mt-auto"
                />
              </SectionCard>
            </TabsContent>
          </Tabs>

          <div className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              {isDirty
                ? "You have unsaved changes across all tabs."
                : "Everything is saved."}
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={isSaving || !isDirty}
                onClick={() => config && form.reset(toFormValues(config))}
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Reset
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isSaving || !isDirty}>
                {isSaving ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-4 w-4" />
                )}
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
