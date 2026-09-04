import { FormInput, FormMultiSelect, FormSwitch } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Webhook } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { WEBHOOK_EVENTS, type WebhookRow } from "./apiWebhookData";

const WebhookSchema = z.object({
  name: z.string().trim().min(1, "Give the endpoint a name").max(60),
  url: z.string().trim().url("Enter the full https:// address we should call"),
  events: z.array(z.enum(WEBHOOK_EVENTS)).min(1, "Pick at least one event"),
  isActive: z.boolean(),
});

export type WebhookFormValues = z.infer<typeof WebhookSchema>;

interface WebhookFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: WebhookRow | null;
  onSave: (values: WebhookFormValues) => void;
}

const EVENT_OPTIONS = WEBHOOK_EVENTS.map((event) => ({ value: event, label: event }));

export function WebhookFormModal({
  open,
  onOpenChange,
  webhook,
  onSave,
}: WebhookFormModalProps) {
  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(WebhookSchema),
    defaultValues: { name: "", url: "", events: [], isActive: true },
  });

  React.useEffect(() => {
    if (!open) return;

    form.reset(
      webhook
        ? {
            name: webhook.name,
            url: webhook.url,
            events: webhook.events,
            isActive: webhook.status !== "PAUSED",
          }
        : { name: "", url: "", events: [], isActive: true }
    );
  }, [open, webhook, form]);

  const onSubmit = (values: WebhookFormValues) => {
    onSave(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{webhook ? "Edit endpoint" : "New webhook endpoint"}</DialogTitle>
              <DialogDescription>
                We POST a JSON payload to this address whenever one of the chosen events happens.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <FormInput
                control={form.control}
                name="name"
                label="Name"
                placeholder="Accounting bridge"
              />
              <FormInput
                control={form.control}
                name="url"
                label="Endpoint URL"
                placeholder="https://hooks.yourcompany.com/vertoone"
                description="Must be https and answer within 10 seconds."
              />
              <FormMultiSelect
                control={form.control}
                name="events"
                label="Events"
                placeholder="Pick what triggers a call"
                options={EVENT_OPTIONS}
                searchable
              />
              <FormSwitch
                control={form.control}
                name="isActive"
                label="Deliver events"
                description="Pause to stop calls without losing the endpoint."
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                <Webhook className="mr-1.5 size-4" />
                {webhook ? "Save endpoint" : "Add endpoint"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
