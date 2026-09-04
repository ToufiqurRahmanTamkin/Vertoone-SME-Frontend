import { FormInput, FormMultiSelect, FormSelect } from "@/components/shared/form-fields";
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
import { KeyRound } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { API_KEY_SCOPES, type ApiKeyScope } from "./apiWebhookData";

const EXPIRY_OPTIONS = [
  { value: "never", label: "Never expires" },
  { value: "30", label: "In 30 days" },
  { value: "90", label: "In 90 days" },
  { value: "365", label: "In a year" },
];

const ApiKeySchema = z.object({
  name: z.string().trim().min(1, "Give the key a name you will recognise").max(60),
  scopes: z.array(z.enum(API_KEY_SCOPES)).min(1, "Pick at least one permission"),
  expiry: z.string(),
});

export type ApiKeyFormValues = z.infer<typeof ApiKeySchema>;

interface ApiKeyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: ApiKeyFormValues) => void;
}

const SCOPE_OPTIONS = API_KEY_SCOPES.map((scope) => ({ value: scope, label: scope }));

export function ApiKeyFormModal({ open, onOpenChange, onCreate }: ApiKeyFormModalProps) {
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(ApiKeySchema),
    defaultValues: { name: "", scopes: [] as ApiKeyScope[], expiry: "never" },
  });

  React.useEffect(() => {
    if (open) form.reset({ name: "", scopes: [], expiry: "never" });
  }, [open, form]);

  const onSubmit = (values: ApiKeyFormValues) => {
    onCreate(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>New API key</DialogTitle>
              <DialogDescription>
                Keys let another system read and write your data. Grant only what it needs.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <FormInput
                control={form.control}
                name="name"
                label="What is it for"
                placeholder="Storefront sync"
              />
              <FormMultiSelect
                control={form.control}
                name="scopes"
                label="Permissions"
                placeholder="Pick what this key can do"
                options={SCOPE_OPTIONS}
                searchable
                description="Read scopes are safe to share. Write scopes can change your data."
              />
              <FormSelect
                control={form.control}
                name="expiry"
                label="Expiry"
                options={EXPIRY_OPTIONS}
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
                <KeyRound className="mr-1.5 size-4" />
                Create key
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
