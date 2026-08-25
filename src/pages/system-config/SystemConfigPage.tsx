import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, RotateCcw, Save } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/shared/empty-state";
import { FormInput, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
} from "@/redux/apis/systemConfigApi";
import type { SystemConfig } from "@/types";

const schema = z.object({
  appName: z.string().trim().min(1, "App name is required").max(80),
  supportEmail: z.string().trim().email("Enter a valid email address"),
  supportPhone: z.string().trim().max(32),
  defaultCurrency: z
    .string()
    .trim()
    .length(3, "Use a 3-letter ISO currency code")
    .transform((value) => value.toUpperCase()),
  defaultTimezone: z.string().trim().min(1, "Timezone is required").max(64),
  trialDays: z.number().int().min(0).max(365),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().trim().max(500),
  allowSignups: z.boolean(),
});

type FormValues = z.input<typeof schema>;

const toFormValues = (config: SystemConfig): FormValues => ({
  appName: config.appName,
  supportEmail: config.supportEmail,
  supportPhone: config.supportPhone,
  defaultCurrency: config.defaultCurrency,
  defaultTimezone: config.defaultTimezone,
  trialDays: config.trialDays,
  maintenanceMode: config.maintenanceMode,
  maintenanceMessage: config.maintenanceMessage,
  allowSignups: config.allowSignups,
});

const EMPTY_VALUES: FormValues = {
  appName: "",
  supportEmail: "",
  supportPhone: "",
  defaultCurrency: "BDT",
  defaultTimezone: "Asia/Dhaka",
  trialDays: 0,
  maintenanceMode: false,
  maintenanceMessage: "",
  allowSignups: true,
};

export default function SystemConfigPage() {
  const { data: config, isLoading, isError, error } = useGetSystemConfigQuery();
  const [updateConfig, { isLoading: isSaving }] = useUpdateSystemConfigMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  const { reset } = form;

  React.useEffect(() => {
    if (config) reset(toFormValues(config));
  }, [config, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const parsed = schema.parse(values);
      const updated = await updateConfig(parsed).unwrap();
      reset(toFormValues(updated));
      toast.success("System configuration saved");
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError, "Could not save the configuration"));
    }
  };

  if (isError) {
    return (
      <>
        <PageHeader title="System Config" description="Platform-wide settings." />
        <EmptyState
          icon={AlertCircle}
          title="Could not load the configuration"
          description={getApiErrorMessage(error, "The server did not respond.")}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="System Config"
        description="Platform-wide settings that apply to every tenant."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={isLoading || isSaving || !form.formState.isDirty}
              onClick={() => config && reset(toFormValues(config))}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
            <Button
              type="submit"
              form="system-config-form"
              className="cursor-pointer"
              disabled={isLoading || isSaving}
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save changes
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : (
        <Form {...form}>
          <form
            id="system-config-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 lg:grid-cols-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Branding &amp; contact</CardTitle>
                <CardDescription>How the platform identifies itself to customers.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormInput
                  control={form.control}
                  name="appName"
                  label="Application name"
                  placeholder="Vertoone SME"
                />
                <FormInput
                  control={form.control}
                  name="supportEmail"
                  type="email"
                  label="Support email"
                  placeholder="support@vertoone.com"
                />
                <FormInput
                  control={form.control}
                  name="supportPhone"
                  label="Support phone"
                  placeholder="+880 1XXX-XXXXXX"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional defaults</CardTitle>
                <CardDescription>
                  Applied to new plans and to any figure without its own currency.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormInput
                  control={form.control}
                  name="defaultCurrency"
                  label="Default currency"
                  placeholder="BDT"
                  description="Three-letter ISO 4217 code, e.g. BDT, USD, EUR."
                />
                <FormInput
                  control={form.control}
                  name="defaultTimezone"
                  label="Default timezone"
                  placeholder="Asia/Dhaka"
                  description="IANA timezone name."
                />
                <FormInput
                  control={form.control}
                  name="trialDays"
                  type="number"
                  label="Default trial length (days)"
                  placeholder="14"
                  description="Used when a plan does not define its own trial."
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>
                  Maintenance mode blocks every non-admin surface until it is turned off.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormSwitch
                    control={form.control}
                    name="maintenanceMode"
                    label="Maintenance mode"
                    description="Take the customer-facing product offline."
                  />
                  <FormSwitch
                    control={form.control}
                    name="allowSignups"
                    label="Allow new signups"
                    description="Let new customers register themselves."
                  />
                </div>
                <FormTextarea
                  control={form.control}
                  name="maintenanceMessage"
                  label="Maintenance message"
                  placeholder="We are performing scheduled maintenance…"
                  rows={3}
                />
              </CardContent>
            </Card>
          </form>
        </Form>
      )}
    </>
  );
}
