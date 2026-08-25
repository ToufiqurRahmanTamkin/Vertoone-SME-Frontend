import { FormInput, FormPhone, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
} from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { SystemConfig } from "@/types/domain/systemConfig";
import { SystemConfigSchema, type SystemConfigFormValues } from "@/validations/systemConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
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
});

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
    },
  });

  // The config is a single upserted document, so the form is seeded once it
  // arrives and re-seeded after a save returns the persisted values.
  React.useEffect(() => {
    if (config) form.reset(toFormValues(config));
  }, [config, form]);

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
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
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
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Identity &amp; support</CardTitle>
                <CardDescription>
                  How the platform names itself and where customers reach you.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormInput control={form.control} name="appName" label="App name" />
                <FormInput control={form.control} name="supportEmail" label="Support email" />
                <FormPhone control={form.control} name="supportPhone" label="Support phone" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Defaults</CardTitle>
                <CardDescription>
                  Applied wherever a new plan or subscription does not set its own.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
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
                <FormSwitch
                  control={form.control}
                  name="allowSignups"
                  label="Allow signups"
                  description="Let new customers register"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Maintenance</CardTitle>
              <CardDescription>
                Turning this on is how you take the platform offline for everyone.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormSwitch
                control={form.control}
                name="maintenanceMode"
                label="Maintenance mode"
                description="Show the maintenance message instead of the app"
              />
              <FormTextarea
                control={form.control}
                name="maintenanceMessage"
                label="Maintenance message"
                placeholder="We are performing scheduled maintenance. Please check back shortly."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={isSaving || !form.formState.isDirty}
              onClick={() => config && form.reset(toFormValues(config))}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Reset
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSaving || !form.formState.isDirty}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
