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
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { EmailConfigSchema, type EmailConfigFormValues } from "@/validations/smeConfiguration";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hammer, KeyRound, Mail, MailCheck, Send, Server } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ConfigActions } from "./components/ConfigActions";

const PROVIDERS = [
  { label: "SMTP server", value: "smtp" },
  { label: "SendGrid", value: "sendgrid" },
  { label: "Mailgun", value: "mailgun" },
  { label: "Amazon SES", value: "ses" },
  { label: "Postmark", value: "postmark" },
  { label: "Resend", value: "resend" },
];

const ENCRYPTIONS = [
  { label: "None", value: "none" },
  { label: "TLS (STARTTLS)", value: "tls" },
  { label: "SSL", value: "ssl" },
];

const PROVIDER_LABELS: Record<string, string> = {
  smtp: "SMTP server",
  sendgrid: "SendGrid",
  mailgun: "Mailgun",
  ses: "Amazon SES",
  postmark: "Postmark",
  resend: "Resend",
};

const DEFAULTS: EmailConfigFormValues = {
  enabled: true,
  provider: "smtp",
  fromName: "",
  fromEmail: "",
  replyToEmail: "",
  bccEmail: "",
  smtpHost: "",
  smtpPort: 587,
  smtpEncryption: "tls",
  smtpUsername: "",
  smtpPassword: "",
  apiKey: "",
  apiDomain: "",
  apiRegion: "",
  dailySendLimit: 1000,
  footerText: "",
  trackOpens: false,
  retryFailed: true,
  testRecipient: "",
};

export default function EmailConfigPage() {
  const form = useForm<EmailConfigFormValues>({
    resolver: zodResolver(EmailConfigSchema),
    defaultValues: DEFAULTS,
  });

  const provider = useWatch({ control: form.control, name: "provider" });
  const enabled = useWatch({ control: form.control, name: "enabled" });
  const isSmtp = provider === "smtp";

  const onSubmit = (values: EmailConfigFormValues) => {
    form.reset(values);
    toast.success("Email configuration saved", {
      description: "Kept for this session only — the configuration API is not connected yet.",
    });
  };

  const sendTest = () => {
    const recipient = form.getValues("testRecipient");
    if (!recipient) {
      toast.error("Enter an address to send the test to");
      return;
    }
    toast.info(`Test email to ${recipient} is not sent yet`, {
      description: "The mail service is wired up in a later step.",
    });
  };

  return (
    <>
      <PageHeader
        title="Email configuration"
        description="The mailbox every module sends invoices, campaigns and alerts from."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={enabled ? "success" : "outline"} className="px-2.5 py-1">
              <Mail className="size-3" />
              {enabled ? "Sending on" : "Sending off"}
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
              icon={Send}
              title="Delivery"
              description="Which service carries your mail, and how hard it tries."
            >
              <FormSwitch
                control={form.control}
                name="enabled"
                label="Send email from this workspace"
                description="Turn off to suppress every outgoing message"
              />
              <FormSelect
                control={form.control}
                name="provider"
                label="Provider"
                options={PROVIDERS}
              />
              <FormInput
                control={form.control}
                name="dailySendLimit"
                label="Daily send limit"
                type="number"
                description="Stops runaway sending. Set 0 to leave it uncapped."
              />
              <FormSwitch
                control={form.control}
                name="retryFailed"
                label="Retry failed sends"
                description="Try three more times over an hour"
                className="mt-auto"
              />
            </SectionCard>

            <SectionCard
              icon={Mail}
              title="Sender identity"
              description="What a customer sees in their inbox, and where replies land."
            >
              <FormInput
                control={form.control}
                name="fromName"
                label="From name"
                placeholder="Vertoone Trading"
              />
              <FormInput
                control={form.control}
                name="fromEmail"
                label="From address"
                placeholder="billing@yourdomain.com"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="replyToEmail"
                  label="Reply-to address"
                  placeholder="support@yourdomain.com"
                />
                <FormInput
                  control={form.control}
                  name="bccEmail"
                  label="Always BCC"
                  placeholder="archive@yourdomain.com"
                />
              </div>
            </SectionCard>

            {isSmtp ? (
              <SectionCard
                icon={Server}
                title="SMTP server"
                description="Connection details from your mail host."
              >
                <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                  <FormInput
                    control={form.control}
                    name="smtpHost"
                    label="Host"
                    placeholder="smtp.yourdomain.com"
                  />
                  <FormInput control={form.control} name="smtpPort" label="Port" type="number" />
                </div>
                <FormSelect
                  control={form.control}
                  name="smtpEncryption"
                  label="Encryption"
                  options={ENCRYPTIONS}
                />
                <FormInput
                  control={form.control}
                  name="smtpUsername"
                  label="Username"
                  placeholder="billing@yourdomain.com"
                />
                <FormPassword control={form.control} name="smtpPassword" label="Password" />
              </SectionCard>
            ) : (
              <SectionCard
                icon={KeyRound}
                title={`${PROVIDER_LABELS[provider]} credentials`}
                description="Generated in your provider dashboard. Keys are write-only once saved."
              >
                <FormPassword control={form.control} name="apiKey" label="API key" />
                <FormInput
                  control={form.control}
                  name="apiDomain"
                  label="Sending domain"
                  placeholder="mail.yourdomain.com"
                  description="Required by Mailgun, optional elsewhere."
                />
                <FormInput
                  control={form.control}
                  name="apiRegion"
                  label="Region"
                  placeholder="us-east-1"
                  description="Used by Amazon SES and Mailgun EU accounts."
                  className="mt-auto"
                />
              </SectionCard>
            )}

            <SectionCard
              icon={MailCheck}
              title="Footer & testing"
              description="The signature appended to every message, and a way to prove delivery."
            >
              <FormTextarea
                control={form.control}
                name="footerText"
                label="Email footer"
                placeholder="Vertoone Trading Ltd. · Dhaka · +880 1XXX XXXXXX"
                showCharCount={false}
              />
              <FormSwitch
                control={form.control}
                name="trackOpens"
                label="Track opens"
                description="Add a tracking pixel to outgoing mail"
              />
              <div className="mt-auto grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <FormInput
                  control={form.control}
                  name="testRecipient"
                  label="Send a test to"
                  placeholder="you@yourdomain.com"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={sendTest}
                >
                  <Send className="mr-1.5 h-4 w-4" />
                  Send test
                </Button>
              </div>
            </SectionCard>
          </div>

          <ConfigActions isDirty={form.formState.isDirty} onReset={() => form.reset(DEFAULTS)} />
        </form>
      </Form>
    </>
  );
}
