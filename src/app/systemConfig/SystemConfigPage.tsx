import { FileUploader } from "@/components/shared/file-uploader";
import { FormInput, FormPhone, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
} from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { SystemConfig } from "@/types/domain/systemConfig";
import { SystemConfigSchema, type SystemConfigFormValues } from "@/validations/systemConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Globe2,
  Loader2,
  type LucideIcon,
  Power,
  QrCode,
  RotateCcw,
  Save,
} from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

const toFormValues = (config: SystemConfig): SystemConfigFormValues => ({
  appName: config.appName,
  supportEmail: config.supportEmail ?? "",
  supportPhone: config.supportPhone ?? "",
  defaultCurrency: config.defaultCurrency,
  defaultTimezone: config.defaultTimezone,
  maintenanceMode: config.maintenanceMode,
  maintenanceMessage: config.maintenanceMessage ?? "",
  allowSignups: config.allowSignups,
  trialDays: config.trialDays,
  paymentQrUrl: config.paymentQrUrl ?? "",
  paymentQrPublicId: config.paymentQrPublicId ?? "",
  paymentInstructions: config.paymentInstructions ?? "",
});

interface ConfigCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

function ConfigCard({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: ConfigCardProps) {
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      <CardHeader className="border-b bg-muted/40 px-5 py-4 md:px-6 [.border-b]:pb-4">
        <div className="flex items-start gap-3">
          <span className="bg-background text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border shadow-sm">
            <Icon className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-base leading-tight">{title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
          </div>
          {action && <div className="shrink-0 pt-0.5">{action}</div>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 p-5 md:p-6">{children}</CardContent>
    </Card>
  );
}

export default function SystemConfigPage() {
  const { data: config, isLoading } = useGetSystemConfigQuery();
  const [updateConfig, { isLoading: isSaving }] = useUpdateSystemConfigMutation();

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
      paymentQrUrl: "",
      paymentQrPublicId: "",
      paymentInstructions: "",
    },
  });

  React.useEffect(() => {
    if (config) form.reset(toFormValues(config));
  }, [config, form]);

  const paymentQrUrl = useWatch({ control: form.control, name: "paymentQrUrl" });
  const paymentQrPublicId = useWatch({ control: form.control, name: "paymentQrPublicId" });
  const maintenanceMode = useWatch({ control: form.control, name: "maintenanceMode" });

  const isDirty = form.formState.isDirty;

  const onSubmit = async (values: SystemConfigFormValues) => {
    try {
      const saved = await updateConfig({
        ...values,
        defaultCurrency: values.defaultCurrency.toUpperCase(),
      }).unwrap();
      form.reset(toFormValues(saved));
      toast.success("System configuration saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the configuration");
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="System Config" description="Platform-wide defaults and switches." />
        <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
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
        actions={
          <Badge variant={maintenanceMode ? "destructive" : "success"} className="px-2.5 py-1">
            <Power className="size-3" />
            {maintenanceMode ? "Maintenance mode" : "Platform live"}
          </Badge>
        }
      />

      <Form {...form}>
        <form className="flex flex-col gap-4 xl:gap-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:gap-6">
            <ConfigCard
              icon={Building2}
              title="Identity & support"
              description="How the platform names itself and where customers reach you."
            >
              <FormInput control={form.control} name="appName" label="App name" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput control={form.control} name="supportEmail" label="Support email" />
                <FormPhone control={form.control} name="supportPhone" label="Support phone" />
              </div>
            </ConfigCard>

            <ConfigCard
              icon={Globe2}
              title="Regional defaults"
              description="Applied wherever a new plan or subscription does not set its own."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="defaultCurrency"
                  label="Default currency"
                  placeholder="BDT"
                />
                <FormInput
                  control={form.control}
                  name="trialDays"
                  label="Trial days"
                  type="number"
                />
              </div>
              <FormInput
                control={form.control}
                name="defaultTimezone"
                label="Default timezone"
                placeholder="Asia/Dhaka"
              />
            </ConfigCard>

            <ConfigCard
              icon={QrCode}
              title="Payment QR"
              description="Shown to the buyer whenever a non-cash payment method is picked, so they can pay and hand back a transaction ID for you to approve."
            >
              <FileUploader
                value={paymentQrUrl}
                publicId={paymentQrPublicId}
                folder="payment-qr"
                label="QR image"
                description="PNG or JPG works best. Keep the code high-contrast and uncropped."
                onChange={(asset) => {
                  form.setValue("paymentQrUrl", asset?.url ?? "", { shouldDirty: true });
                  form.setValue("paymentQrPublicId", asset?.publicId ?? "", {
                    shouldDirty: true,
                  });
                }}
              />
              <FormTextarea
                control={form.control}
                name="paymentInstructions"
                label="Payment instructions"
                placeholder="Scan the QR with your mobile wallet, then enter the transaction ID below."
                showCharCount={false}
                className="mt-auto"
              />
            </ConfigCard>

            <ConfigCard
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
            </ConfigCard>
          </div>

          <div className="bg-background/85 sticky bottom-0 z-10 flex flex-col gap-3 rounded-xl border p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <p className="text-muted-foreground text-sm">
              {isDirty ? "You have unsaved changes." : "Everything is saved."}
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
