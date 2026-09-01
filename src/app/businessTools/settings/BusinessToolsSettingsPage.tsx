import { PageHeader } from "@/components/shared/page-header";
import {
  FormColor,
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermission } from "@/hooks/use-permission";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  useGetBusinessToolsSettingsQuery,
  useUpdateBusinessToolsSettingsMutation,
} from "@/redux/apis/webBuilderApis";
import type { BusinessToolsSettings } from "@/types/domain/webBuilder";
import {
  BusinessToolsSettingsSchema,
  type BusinessToolsSettingsFormValues,
} from "@/validations/webBuilder";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Globe, Loader2, Mail, Palette, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const FONTS = [
  { label: "System sans", value: "SYSTEM" },
  { label: "Serif", value: "SERIF" },
  { label: "Rounded", value: "ROUNDED" },
];

const RADII = [
  { label: "Square", value: "NONE" },
  { label: "Small", value: "SMALL" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Large", value: "LARGE" },
];

const toFormValues = (settings: BusinessToolsSettings): BusinessToolsSettingsFormValues => ({
  webDefaultPrimaryColor: settings.webBuilder.defaultPrimaryColor,
  webDefaultFont: settings.webBuilder.defaultFont,
  webDefaultRadius: settings.webBuilder.defaultRadius,
  webDefaultLanguage: settings.webBuilder.defaultLanguage,
  webDefaultIndexable: settings.webBuilder.defaultIndexable,
  webDefaultFooterText: settings.webBuilder.defaultFooterText,

  formNotifyEmail: settings.formBuilder.notifyEmail,
  formNotifyOnSubmission: settings.formBuilder.notifyOnSubmission,
  formStoreSubmissions: settings.formBuilder.storeSubmissions,
  formRetentionDays: String(settings.formBuilder.retentionDays),
  formSpamProtection: settings.formBuilder.spamProtection,
  formSuccessMessage: settings.formBuilder.successMessage,

  emailSenderName: settings.emailBuilder.senderName,
  emailReplyToEmail: settings.emailBuilder.replyToEmail,
  emailBrandColor: settings.emailBuilder.brandColor,
  emailContentWidth: String(settings.emailBuilder.contentWidth),
  emailFooterText: settings.emailBuilder.footerText,
});

function SettingsForm({
  settings,
  canEdit,
}: {
  settings: BusinessToolsSettings;
  canEdit: boolean;
}) {
  const [updateSettings, { isLoading }] = useUpdateBusinessToolsSettingsMutation();

  const form = useForm<BusinessToolsSettingsFormValues>({
    resolver: zodResolver(BusinessToolsSettingsSchema),
    defaultValues: toFormValues(settings),
  });

  const onSubmit = async (values: BusinessToolsSettingsFormValues) => {
    try {
      await updateSettings({
        webBuilder: {
          defaultPrimaryColor: values.webDefaultPrimaryColor,
          defaultFont: values.webDefaultFont,
          defaultRadius: values.webDefaultRadius,
          defaultLanguage: values.webDefaultLanguage,
          defaultIndexable: values.webDefaultIndexable,
          defaultFooterText: values.webDefaultFooterText,
        },
        formBuilder: {
          notifyEmail: values.formNotifyEmail,
          notifyOnSubmission: values.formNotifyOnSubmission,
          storeSubmissions: values.formStoreSubmissions,
          retentionDays: Number(values.formRetentionDays),
          spamProtection: values.formSpamProtection,
          successMessage: values.formSuccessMessage,
        },
        emailBuilder: {
          senderName: values.emailSenderName,
          replyToEmail: values.emailReplyToEmail,
          brandColor: values.emailBrandColor,
          contentWidth: Number(values.emailContentWidth),
          footerText: values.emailFooterText,
        },
      }).unwrap();

      toast.success("Settings saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the settings");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs defaultValue="web" className="space-y-4">
          <TabsList>
            <TabsTrigger value="web">Web Builder</TabsTrigger>
            <TabsTrigger value="form">Form Builder</TabsTrigger>
            <TabsTrigger value="email">Email Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="web" className="space-y-4">
            <SectionCard
              icon={Palette}
              title="Defaults for new websites"
              description="Every website you create starts from these. Changing them here leaves existing sites alone."
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <FormColor
                  control={form.control}
                  name="webDefaultPrimaryColor"
                  label="Brand colour"
                  disabled={!canEdit}
                />
                <FormSelect
                  control={form.control}
                  name="webDefaultFont"
                  label="Typeface"
                  options={FONTS}
                  disabled={!canEdit}
                />
                <FormSelect
                  control={form.control}
                  name="webDefaultRadius"
                  label="Corner style"
                  options={RADII}
                  disabled={!canEdit}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="webDefaultLanguage"
                  label="Language code"
                  placeholder="en"
                  disabled={!canEdit}
                />
              </div>

              <FormTextarea
                control={form.control}
                name="webDefaultFooterText"
                label="Default footer note"
                placeholder="Company registration, opening hours, anything small print."
                disabled={!canEdit}
              />
            </SectionCard>

            <SectionCard
              icon={Globe}
              title="Search engines"
              description="Whether a brand new website is open to Google before you have finished it."
            >
              <FormSwitch
                control={form.control}
                name="webDefaultIndexable"
                label="New websites are indexable"
                description="Turn this off if you would rather opt each site in by hand once it is ready."
                disabled={!canEdit}
              />
            </SectionCard>
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            <SectionCard
              icon={ClipboardList}
              title="Submissions"
              description="What happens when somebody completes one of your forms."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="formNotifyEmail"
                  label="Notification email"
                  placeholder="enquiries@yourcompany.com"
                  description="Where new submissions are sent."
                  disabled={!canEdit}
                />
                <FormInput
                  control={form.control}
                  name="formRetentionDays"
                  label="Keep submissions for (days)"
                  type="number"
                  description="0 keeps them indefinitely."
                  disabled={!canEdit}
                />
              </div>

              <FormTextarea
                control={form.control}
                name="formSuccessMessage"
                label="Thank-you message"
                disabled={!canEdit}
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <FormSwitch
                  control={form.control}
                  name="formNotifyOnSubmission"
                  label="Email on submission"
                  disabled={!canEdit}
                />
                <FormSwitch
                  control={form.control}
                  name="formStoreSubmissions"
                  label="Store submissions"
                  disabled={!canEdit}
                />
                <FormSwitch
                  control={form.control}
                  name="formSpamProtection"
                  label="Spam protection"
                  disabled={!canEdit}
                />
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <SectionCard
              icon={Mail}
              title="Sending"
              description="The name and address your campaigns go out under."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="emailSenderName"
                  label="Sender name"
                  placeholder="Acme Trading"
                  disabled={!canEdit}
                />
                <FormInput
                  control={form.control}
                  name="emailReplyToEmail"
                  label="Reply-to address"
                  placeholder="hello@yourcompany.com"
                  disabled={!canEdit}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={ShieldCheck}
              title="Template defaults"
              description="How a new email template looks before you touch it."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormColor
                  control={form.control}
                  name="emailBrandColor"
                  label="Brand colour"
                  disabled={!canEdit}
                />
                <FormInput
                  control={form.control}
                  name="emailContentWidth"
                  label="Content width (px)"
                  type="number"
                  description="600px is the safe default across email clients."
                  disabled={!canEdit}
                />
              </div>

              <FormTextarea
                control={form.control}
                name="emailFooterText"
                label="Footer text"
                placeholder="Your postal address and an unsubscribe line."
                disabled={!canEdit}
              />
            </SectionCard>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={!canEdit || isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save settings
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function BusinessToolsSettingsPage() {
  const access = useModulePermission("/business-tools/settings");
  const { data: settings, isLoading } = useGetBusinessToolsSettingsQuery();

  return (
    <>
      <PageHeader
        title="Business Tools settings"
        description="Shared defaults for the Web Builder, Form Builder and Email Builder."
      />

      {isLoading || !settings ? (
        <LoadingSpinner />
      ) : (
        <SettingsForm key={settings.updatedAt} settings={settings} canEdit={access.canEdit} />
      )}
    </>
  );
}
