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
import {
  NotificationConfigSchema,
  type NotificationConfigFormValues,
} from "@/validations/smeConfiguration";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Clock, Hammer, ListChecks, MessageCircle, Smartphone } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ConfigActions } from "../components/ConfigActions";
import { ProviderCard } from "../components/ProviderCard";

const SMS_PROVIDERS = [
  { label: "Not configured", value: "none" },
  { label: "Twilio", value: "twilio" },
  { label: "Vonage", value: "vonage" },
  { label: "MessageBird", value: "messagebird" },
  { label: "Local SMS gateway", value: "local-gateway" },
];

const DEFAULTS: NotificationConfigFormValues = {
  emailChannel: true,
  smsChannel: false,
  whatsappChannel: false,
  pushChannel: true,
  smsProvider: "none",
  smsSenderId: "",
  smsAccountSid: "",
  smsAuthToken: "",
  smsEndpoint: "",
  whatsappPhoneNumberId: "",
  whatsappBusinessId: "",
  whatsappAccessToken: "",
  whatsappTemplateNamespace: "",
  notifyInvoiceCreated: true,
  notifyPaymentReceived: true,
  notifyPaymentOverdue: true,
  notifyLowStock: true,
  notifyNewOrder: true,
  notifyPurchaseApproval: false,
  dailySummary: false,
  summaryTime: "09:00",
  adminRecipients: "",
  quietHoursFrom: "22:00",
  quietHoursTo: "07:00",
};

export default function NotificationConfigPage() {
  const form = useForm<NotificationConfigFormValues>({
    resolver: zodResolver(NotificationConfigSchema),
    defaultValues: DEFAULTS,
  });

  const smsChannel = useWatch({ control: form.control, name: "smsChannel" });
  const whatsappChannel = useWatch({ control: form.control, name: "whatsappChannel" });
  const emailChannel = useWatch({ control: form.control, name: "emailChannel" });
  const pushChannel = useWatch({ control: form.control, name: "pushChannel" });

  const activeChannels = [emailChannel, smsChannel, whatsappChannel, pushChannel].filter(
    Boolean
  ).length;

  const setChannel = (name: "smsChannel" | "whatsappChannel") => (value: boolean) =>
    form.setValue(name, value, { shouldDirty: true });

  const onSubmit = (values: NotificationConfigFormValues) => {
    form.reset(values);
    toast.success("Notification configuration saved", {
      description: "Kept for this session only — the configuration API is not connected yet.",
    });
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description="The channels alerts travel on, the providers behind them, and which events are worth a message."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={activeChannels > 0 ? "success" : "outline"} className="px-2.5 py-1">
              <Bell className="size-3" />
              {activeChannels} of 4 channels on
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
            icon={Bell}
            title="Channels"
            description="Turn a channel off and nothing leaves through it, whatever the event settings say."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <FormSwitch
                control={form.control}
                name="emailChannel"
                label="Email"
                description="Uses your email configuration"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="smsChannel"
                label="SMS"
                description="Short text to a mobile number"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="whatsappChannel"
                label="WhatsApp"
                description="Template messages via Meta"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="pushChannel"
                label="In-app & push"
                description="Bell icon and browser push"
                className="h-full"
              />
            </div>
          </SectionCard>

          <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:gap-6">
            <ProviderCard
              icon={Smartphone}
              title="SMS provider"
              description="Credentials for the gateway that carries your text messages."
              switchId="smsChannel"
              enabled={smsChannel}
              onEnabledChange={setChannel("smsChannel")}
              note="Sender IDs usually need pre-approval from the carrier before they deliver."
            >
              <FormSelect
                control={form.control}
                name="smsProvider"
                label="Provider"
                options={SMS_PROVIDERS}
              />
              <FormInput
                control={form.control}
                name="smsSenderId"
                label="Sender ID"
                placeholder="VERTOONE"
              />
              <FormInput
                control={form.control}
                name="smsAccountSid"
                label="Account SID / API key"
              />
              <FormPassword control={form.control} name="smsAuthToken" label="Auth token" />
              <FormInput
                control={form.control}
                name="smsEndpoint"
                label="Gateway endpoint"
                placeholder="https://api.provider.com/send"
                description="Only needed for a local gateway."
                className="mt-auto"
              />
            </ProviderCard>

            <ProviderCard
              icon={MessageCircle}
              title="WhatsApp Business"
              description="Meta Cloud API details for template messaging."
              switchId="whatsappChannel"
              enabled={whatsappChannel}
              onEnabledChange={setChannel("whatsappChannel")}
              note="Templates must be approved in Meta Business Manager before they can be sent."
            >
              <FormInput
                control={form.control}
                name="whatsappPhoneNumberId"
                label="Phone number ID"
              />
              <FormInput
                control={form.control}
                name="whatsappBusinessId"
                label="Business account ID"
              />
              <FormPassword
                control={form.control}
                name="whatsappAccessToken"
                label="Permanent access token"
              />
              <FormInput
                control={form.control}
                name="whatsappTemplateNamespace"
                label="Template namespace"
                className="mt-auto"
              />
            </ProviderCard>
          </div>

          <SectionCard
            icon={ListChecks}
            title="Events"
            description="What actually triggers a message once the channel is open."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <FormSwitch
                control={form.control}
                name="notifyInvoiceCreated"
                label="Invoice issued"
                description="Send the customer their invoice"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="notifyPaymentReceived"
                label="Payment received"
                description="Confirm the receipt to both sides"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="notifyPaymentOverdue"
                label="Payment overdue"
                description="Chase once the due date passes"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="notifyLowStock"
                label="Low stock"
                description="Alert when a product hits its threshold"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="notifyNewOrder"
                label="New order"
                description="Tell the team an order came in"
                className="h-full"
              />
              <FormSwitch
                control={form.control}
                name="notifyPurchaseApproval"
                label="Purchase approval"
                description="Ask an approver to sign off a PO"
                className="h-full"
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Clock}
            title="Timing & recipients"
            description="Who hears from the system, and the hours it stays quiet."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <FormInput
                control={form.control}
                name="summaryTime"
                label="Daily summary at"
                type="time"
              />
              <FormInput
                control={form.control}
                name="quietHoursFrom"
                label="Quiet hours from"
                type="time"
              />
              <FormInput
                control={form.control}
                name="quietHoursTo"
                label="Quiet hours until"
                type="time"
              />
            </div>
            <FormSwitch
              control={form.control}
              name="dailySummary"
              label="Send a daily summary"
              description="Sales, receipts and low stock in one message"
            />
            <FormTextarea
              control={form.control}
              name="adminRecipients"
              label="Internal recipients"
              placeholder="owner@yourdomain.com, accounts@yourdomain.com"
              description="Comma separated. These addresses receive every internal alert."
              showCharCount={false}
            />
          </SectionCard>

          <ConfigActions isDirty={form.formState.isDirty} onReset={() => form.reset(DEFAULTS)} />
        </form>
      </Form>
    </>
  );
}
