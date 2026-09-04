import {
  FormInput,
  FormPassword,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useModulePermission } from "@/hooks/use-permission";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  useDisconnectEmailServerMutation,
  useGetEmailProvidersQuery,
  useGetEmailSettingsQuery,
  useSendTestEmailMutation,
  useTestEmailConnectionMutation,
  useUpdateEmailSettingsMutation,
} from "@/redux/apis/emailSettingsApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  EMAIL_ENCRYPTIONS,
  EMAIL_ENCRYPTION_LABELS,
  EMAIL_HEALTH_COLORS,
  EMAIL_HEALTH_LABELS,
  type EmailProviderPreset,
  type EmailSettings,
} from "@/types/domain/emailSettings";
import {
  EmailSettingsSchema,
  type EmailSettingsFormValues,
} from "@/validations/emailSettings";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  MailCheck,
  PlugZap,
  Send,
  Server,
  Unplug,
} from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ConfigActions } from "./components/ConfigActions";
import { ProviderPicker } from "./components/ProviderPicker";

const ENCRYPTION_OPTIONS = EMAIL_ENCRYPTIONS.map((value) => ({
  value,
  label: EMAIL_ENCRYPTION_LABELS[value],
}));

const toFormValues = (settings: EmailSettings): EmailSettingsFormValues => ({
  isEnabled: settings.isEnabled,
  provider: settings.provider,
  host: settings.host,
  port: settings.port,
  encryption: settings.encryption,
  username: settings.username,
  password: "",
  fromName: settings.fromName,
  fromEmail: settings.fromEmail,
  replyToEmail: settings.replyToEmail,
  footerText: settings.footerText,
});

export default function EmailConfigPage() {
  const access = useModulePermission("/settings/system/email");

  const { data: settings, isLoading } = useGetEmailSettingsQuery();
  const { data: providers = [] } = useGetEmailProvidersQuery();

  const [updateSettings, { isLoading: isSaving }] = useUpdateEmailSettingsMutation();
  const [testConnection, { isLoading: isTestingConnection }] = useTestEmailConnectionMutation();
  const [sendTest, { isLoading: isSendingTest }] = useSendTestEmailMutation();
  const [disconnectServer, { isLoading: isDisconnecting }] = useDisconnectEmailServerMutation();

  const form = useForm<EmailSettingsFormValues>({
    resolver: zodResolver(EmailSettingsSchema),
    defaultValues: {
      isEnabled: false,
      provider: "CUSTOM_SMTP",
      host: "",
      port: 587,
      encryption: "STARTTLS",
      username: "",
      password: "",
      fromName: "",
      fromEmail: "",
      replyToEmail: "",
      footerText: "",
    },
  });

  const [testRecipient, setTestRecipient] = React.useState("");
  const [disconnectOpen, setDisconnectOpen] = React.useState(false);

  React.useEffect(() => {
    if (settings) form.reset(toFormValues(settings));
  }, [settings, form]);

  const provider = useWatch({ control: form.control, name: "provider" });

  const preset = React.useMemo<EmailProviderPreset | undefined>(
    () => providers.find((entry) => entry.provider === provider),
    [providers, provider]
  );

  const applyPreset = (next: EmailProviderPreset) => {
    form.setValue("provider", next.provider, { shouldDirty: true });
    form.setValue("host", next.host, { shouldDirty: true });
    form.setValue("port", next.port, { shouldDirty: true });
    form.setValue("encryption", next.encryption, { shouldDirty: true });
    if (next.fixedUsername) {
      form.setValue("username", next.fixedUsername, { shouldDirty: true });
    }
  };

  const onSubmit = async (values: EmailSettingsFormValues) => {
    const parsed = EmailSettingsSchema.parse(values);

    try {
      const saved = await updateSettings({
        isEnabled: parsed.isEnabled,
        provider: parsed.provider,
        host: parsed.host,
        port: parsed.port,
        encryption: parsed.encryption,
        username: parsed.username,
        ...(parsed.password ? { password: parsed.password } : {}),
        fromName: parsed.fromName,
        fromEmail: parsed.fromEmail,
        replyToEmail: parsed.replyToEmail,
        footerText: parsed.footerText,
      }).unwrap();

      form.reset(toFormValues(saved));
      toast.success("Email settings saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the email settings");
    }
  };

  const runConnectionTest = async () => {
    try {
      const result = await testConnection().unwrap();
      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not reach the mail server");
    }
  };

  const runTestSend = async () => {
    const recipient = testRecipient.trim();
    if (!recipient) {
      toast.error("Enter the address the test should go to");
      return;
    }

    try {
      const result = await sendTest({ recipient }).unwrap();
      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not send the test email");
    }
  };

  const confirmDisconnect = async () => {
    try {
      const cleared = await disconnectServer().unwrap();
      form.reset(toFormValues(cleared));
      setDisconnectOpen(false);
      toast.success("Mail server disconnected");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not disconnect the mail server");
    }
  };

  if (isLoading || !settings) {
    return (
      <>
        <PageHeader
          title="Email"
          description="The mailbox every module sends invoices, alerts and campaigns from."
        />
        <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  const readOnly = !access.canEdit;
  const health = settings.health;
  const isHealthy = health === "WORKING";
  const hasFailure = health === "FAILING";

  return (
    <>
      <PageHeader
        title="Email"
        description="The mailbox every module sends invoices, alerts and campaigns from."
        actions={
          <StatusBadge color={EMAIL_HEALTH_COLORS[health]} label={EMAIL_HEALTH_LABELS[health]} />
        }
      />

      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
          isHealthy && "border-emerald-500/40 bg-emerald-500/10",
          hasFailure && "border-red-500/40 bg-red-500/10",
          !isHealthy && !hasFailure && "bg-muted/40"
        )}
      >
        <div className="flex items-start gap-2.5">
          {isHealthy ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
          ) : hasFailure ? (
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-500" />
          ) : (
            <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          )}
          <div className="space-y-0.5 text-sm">
            <p className="font-medium">
              {isHealthy
                ? "Your mail server is connected and working."
                : hasFailure
                  ? "The last attempt to reach your mail server failed."
                  : settings.isComplete
                    ? "Details are filled in, but not tested yet."
                    : "Pick a provider below and paste your credentials to start sending."}
            </p>
            <p className="text-muted-foreground">
              {hasFailure
                ? settings.lastError
                : settings.usesPlatformFallback
                  ? "Until then, mail goes out through the Vertoone shared mailbox."
                  : settings.lastTestedAt
                    ? `Last checked ${formatDateTime(settings.lastTestedAt)}`
                    : "Nothing has been sent from here yet."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={readOnly || !settings.isComplete || isTestingConnection}
            onClick={() => void runConnectionTest()}
          >
            {isTestingConnection ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <PlugZap className="size-4" />
            )}
            Test connection
          </Button>
          {settings.isComplete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={readOnly || isDisconnecting}
              onClick={() => setDisconnectOpen(true)}
            >
              <Unplug className="size-4" />
              Disconnect
            </Button>
          )}
        </div>
      </div>

      <Form {...form}>
        <form className="flex flex-col gap-4 xl:gap-6" onSubmit={form.handleSubmit(onSubmit)}>
          <SectionCard
            icon={Server}
            title="Who carries your mail"
            description="Pick your email provider and we fill in the server details for you."
          >
            <ProviderPicker
              providers={providers}
              value={provider}
              disabled={readOnly}
              onSelect={applyPreset}
            />
          </SectionCard>

          <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:gap-6">
            <SectionCard
              icon={PlugZap}
              title={preset ? `${preset.label} credentials` : "Connection"}
              description={
                preset?.passwordHint ??
                "The username and password your mail host gave you."
              }
              action={
                preset?.helpUrl ? (
                  <a
                    href={preset.helpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Guide
                    <ExternalLink className="size-3" />
                  </a>
                ) : undefined
              }
            >
              <FormInput
                control={form.control}
                name="username"
                label={preset?.usernameLabel ?? "Username"}
                description={preset?.usernameHint}
                placeholder="you@yourcompany.com"
                disabled={readOnly || Boolean(preset?.fixedUsername)}
              />

              <FormPassword
                control={form.control}
                name="password"
                label={preset?.passwordLabel ?? "Password"}
                description={
                  settings.hasPassword
                    ? "Saved. Leave blank to keep the current one, or type a new one to replace it."
                    : undefined
                }
                disabled={readOnly}
              />

              <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                <FormInput
                  control={form.control}
                  name="host"
                  label="Server"
                  placeholder="smtp.yourcompany.com"
                  disabled={readOnly || preset?.hostIsEditable === false}
                  description={
                    preset?.hostIsEditable === false ? "Fixed by your provider." : undefined
                  }
                />
                <FormInput
                  control={form.control}
                  name="port"
                  label="Port"
                  type="number"
                  disabled={readOnly}
                />
              </div>

              <FormSelect
                control={form.control}
                name="encryption"
                label="Encryption"
                options={ENCRYPTION_OPTIONS}
                disabled={readOnly}
                className="mt-auto"
              />
            </SectionCard>

            <SectionCard
              icon={Mail}
              title="What people see"
              description="The name and address on every message you send."
            >
              <FormInput
                control={form.control}
                name="fromName"
                label="From name"
                placeholder="Vertoone Trading"
                disabled={readOnly}
              />
              <FormInput
                control={form.control}
                name="fromEmail"
                label="From address"
                placeholder="billing@yourcompany.com"
                description="Most providers require this to match the mailbox you signed in with."
                disabled={readOnly}
              />
              <FormInput
                control={form.control}
                name="replyToEmail"
                label="Reply-to address"
                placeholder="support@yourcompany.com"
                description="Optional. Where replies land if that is a different inbox."
                disabled={readOnly}
              />
              <FormTextarea
                control={form.control}
                name="footerText"
                label="Footer"
                placeholder="Vertoone Trading Ltd. · Dhaka · +880 1XXX XXXXXX"
                description="Appended to the bottom of every message."
                showCharCount={false}
                disabled={readOnly}
                className="mt-auto"
              />
            </SectionCard>
          </div>

          <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:gap-6">
            <SectionCard
              icon={Send}
              title="Turn sending on"
              description="Until this is on, mail goes out through the Vertoone shared mailbox."
            >
              <FormSwitch
                control={form.control}
                name="isEnabled"
                label="Send email from this mailbox"
                description="Needs a server, username, password and from address."
                disabled={readOnly}
              />
            </SectionCard>

            <SectionCard
              icon={MailCheck}
              title="Prove it works"
              description="Send yourself a real message to confirm everything is wired up."
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="space-y-2">
                  <label htmlFor="test-recipient" className="text-sm font-medium">
                    Send a test to
                  </label>
                  <Input
                    id="test-recipient"
                    value={testRecipient}
                    onChange={(event) => setTestRecipient(event.target.value)}
                    placeholder="you@yourcompany.com"
                    disabled={readOnly || !settings.isComplete}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  disabled={readOnly || !settings.isComplete || isSendingTest}
                  onClick={() => void runTestSend()}
                >
                  {isSendingTest ? (
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                  ) : (
                    <Send className="mr-1.5 size-4" />
                  )}
                  Send test
                </Button>
              </div>

              {settings.lastTestRecipient && (
                <p className="mt-auto text-xs text-muted-foreground">
                  Last test went to {settings.lastTestRecipient}
                  {settings.lastTestedAt ? ` on ${formatDateTime(settings.lastTestedAt)}` : ""}.
                </p>
              )}
            </SectionCard>
          </div>

          {access.canEdit && (
            <ConfigActions
              isDirty={form.formState.isDirty}
              isSaving={isSaving}
              onReset={() => form.reset(toFormValues(settings))}
            />
          )}
        </form>
      </Form>

      <ConfirmDialog
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
        title="Disconnect this mail server?"
        description="The server, username and password are cleared, and mail falls back to the Vertoone shared mailbox."
        confirmText="Disconnect"
        variant="destructive"
        isLoading={isDisconnecting}
        onConfirm={confirmDisconnect}
      />
    </>
  );
}
