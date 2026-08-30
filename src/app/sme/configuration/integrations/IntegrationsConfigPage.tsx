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
import {
  IntegrationsConfigSchema,
  type IntegrationsConfigFormValues,
} from "@/validations/smeConfiguration";
import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, Cloud, Hammer, KeyRound, Plug, RefreshCw, Webhook } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ConfigActions } from "../components/ConfigActions";

const STORAGE_PROVIDERS = [
  { label: "Cloudinary", value: "cloudinary" },
  { label: "Amazon S3", value: "s3" },
  { label: "Local disk", value: "local" },
];

const DEFAULTS: IntegrationsConfigFormValues = {
  apiEnabled: false,
  apiKey: "",
  apiRateLimit: 600,
  allowedOrigins: "",
  allowedIps: "",
  webhookUrl: "",
  webhookSecret: "",
  webhookRetries: 3,
  webhookOnOrder: true,
  webhookOnPayment: true,
  webhookOnStock: false,
  storageProvider: "cloudinary",
  storageKey: "",
  storageSecret: "",
  storageBucket: "",
  storageRegion: "",
  googleAnalyticsId: "",
  metaPixelId: "",
  googleMapsKey: "",
};

const generateKey = (): string => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const random = Array.from(
    { length: 32 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join("");
  return `vto_live_${random}`;
};

export default function IntegrationsConfigPage() {
  const form = useForm<IntegrationsConfigFormValues>({
    resolver: zodResolver(IntegrationsConfigSchema),
    defaultValues: DEFAULTS,
  });

  const apiEnabled = useWatch({ control: form.control, name: "apiEnabled" });
  const storageProvider = useWatch({ control: form.control, name: "storageProvider" });
  const isS3 = storageProvider === "s3";

  const onSubmit = (values: IntegrationsConfigFormValues) => {
    form.reset(values);
    toast.success("Integration configuration saved", {
      description: "Kept for this session only — the configuration API is not connected yet.",
    });
  };

  const regenerate = () => {
    form.setValue("apiKey", generateKey(), { shouldDirty: true });
    toast.success("A new key has been generated", {
      description: "It replaces the old one once you save.",
    });
  };

  return (
    <>
      <PageHeader
        title="Integrations & API"
        description="Programmatic access to this workspace, outbound webhooks, file storage and analytics tags."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={apiEnabled ? "success" : "outline"} className="px-2.5 py-1">
              <Plug className="size-3" />
              {apiEnabled ? "API open" : "API closed"}
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
              icon={KeyRound}
              title="API access"
              description="Let another system read and write your data over HTTP."
              action={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={regenerate}
                >
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  Regenerate
                </Button>
              }
            >
              <FormSwitch
                control={form.control}
                name="apiEnabled"
                label="Enable the API"
                description="Requests are rejected while this is off"
              />
              <FormInput
                control={form.control}
                name="apiKey"
                label="API key"
                placeholder="Generate a key to get started"
                readOnly
                description="Sent as the X-API-Key header on every request."
              />
              <FormInput
                control={form.control}
                name="apiRateLimit"
                label="Rate limit (requests per minute)"
                type="number"
                disabled={!apiEnabled}
              />
              <FormTextarea
                control={form.control}
                name="allowedOrigins"
                label="Allowed origins"
                placeholder="https://shop.yourdomain.com, https://portal.yourdomain.com"
                description="Comma separated. Leave empty to allow any origin."
                showCharCount={false}
                disabled={!apiEnabled}
                className="mt-auto"
              />
            </SectionCard>

            <SectionCard
              icon={Webhook}
              title="Webhooks"
              description="We post a JSON payload to your endpoint when something happens here."
            >
              <FormInput
                control={form.control}
                name="webhookUrl"
                label="Endpoint URL"
                placeholder="https://hooks.yourdomain.com/vertoone"
              />
              <FormPassword
                control={form.control}
                name="webhookSecret"
                label="Signing secret"
                description="Used to sign the payload so you can verify it came from us."
              />
              <FormInput
                control={form.control}
                name="webhookRetries"
                label="Retries on failure"
                type="number"
              />
              <div className="mt-auto grid gap-3 sm:grid-cols-3">
                <FormSwitch
                  control={form.control}
                  name="webhookOnOrder"
                  label="Orders"
                  description="Created and updated"
                  className="h-full"
                />
                <FormSwitch
                  control={form.control}
                  name="webhookOnPayment"
                  label="Payments"
                  description="Received and refunded"
                  className="h-full"
                />
                <FormSwitch
                  control={form.control}
                  name="webhookOnStock"
                  label="Stock"
                  description="Quantity changes"
                  className="h-full"
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={Cloud}
              title="File storage"
              description="Where product images, logos and document attachments are kept."
            >
              <FormSelect
                control={form.control}
                name="storageProvider"
                label="Provider"
                options={STORAGE_PROVIDERS}
              />
              <FormInput
                control={form.control}
                name="storageKey"
                label={isS3 ? "Access key ID" : "API key"}
                disabled={storageProvider === "local"}
              />
              <FormPassword
                control={form.control}
                name="storageSecret"
                label={isS3 ? "Secret access key" : "API secret"}
                disabled={storageProvider === "local"}
              />
              <div className="mt-auto grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="storageBucket"
                  label={isS3 ? "Bucket" : "Cloud name"}
                  disabled={storageProvider === "local"}
                />
                <FormInput
                  control={form.control}
                  name="storageRegion"
                  label="Region"
                  placeholder="ap-south-1"
                  disabled={storageProvider !== "s3"}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={BarChart3}
              title="Analytics & maps"
              description="Tags injected into your public shop pages."
            >
              <FormInput
                control={form.control}
                name="googleAnalyticsId"
                label="Google Analytics ID"
                placeholder="G-XXXXXXXXXX"
              />
              <FormInput
                control={form.control}
                name="metaPixelId"
                label="Meta Pixel ID"
                placeholder="1234567890"
              />
              <FormPassword
                control={form.control}
                name="googleMapsKey"
                label="Google Maps API key"
                description="Used for delivery address lookup and store locators."
                className="mt-auto"
              />
            </SectionCard>
          </div>

          <SectionCard
            icon={Plug}
            title="Network restrictions"
            description="Narrow who can reach the API at all. Leave empty to accept any address."
          >
            <FormTextarea
              control={form.control}
              name="allowedIps"
              label="Allowed IP addresses"
              placeholder="103.21.44.0/24, 198.51.100.17"
              description="Comma separated. Single addresses or CIDR ranges."
              showCharCount={false}
              disabled={!apiEnabled}
            />
          </SectionCard>

          <ConfigActions isDirty={form.formState.isDirty} onReset={() => form.reset(DEFAULTS)} />
        </form>
      </Form>
    </>
  );
}
