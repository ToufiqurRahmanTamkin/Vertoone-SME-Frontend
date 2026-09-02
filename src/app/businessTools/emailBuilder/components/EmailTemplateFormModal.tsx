import { FormInput, FormSelect } from "@/components/shared/form-fields";
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  useCreateEmailTemplateMutation,
  useGetEmailStartersQuery,
} from "@/redux/apis/emailBuilderApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { EmailStarterTemplate, EmailTemplateCategory } from "@/types/domain/emailBuilder";
import { EMAIL_TEMPLATE_CATEGORIES } from "@/types/domain/emailBuilder";
import {
  EmailTemplateFormSchema,
  type EmailTemplateFormValues,
} from "@/validations/emailBuilder";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { titleCase } from "../emailBuilder.utils";

const emptyValues = (): EmailTemplateFormValues => ({
  name: "",
  subject: "",
  preheader: "",
  category: "GENERAL",
  templateKey: "BLANK",
});

interface EmailTemplateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailTemplateFormModal({ open, onOpenChange }: EmailTemplateFormModalProps) {
  const navigate = useNavigate();
  const { data: catalogue } = useGetEmailStartersQuery();
  const [createTemplate, { isLoading }] = useCreateEmailTemplateMutation();

  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(EmailTemplateFormSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(emptyValues());
  }, [open, form]);

  const templates = catalogue?.templates ?? [];
  const templateKey = useWatch({ control: form.control, name: "templateKey" });

  const pick = (template: EmailStarterTemplate) => {
    form.setValue("templateKey", template.key);
    form.setValue("category", template.category);

    if (!form.getValues("name")) form.setValue("name", template.suggestedName);
    if (!form.getValues("subject")) form.setValue("subject", template.suggestedSubject);
    if (!form.getValues("preheader")) form.setValue("preheader", template.suggestedPreheader);
  };

  const onSubmit = async (values: EmailTemplateFormValues) => {
    try {
      const template = await createTemplate({
        name: values.name,
        subject: values.subject || undefined,
        preheader: values.preheader || undefined,
        category: values.category as EmailTemplateCategory,
        templateKey: values.templateKey,
      }).unwrap();

      toast.success("Email created");
      onOpenChange(false);
      navigate(`/company/business-tools/email-builder/${template._id}`);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not create the email");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New email</DialogTitle>
          <DialogDescription>
            Start from a ready-made layout, then change anything you like in the builder.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm">Starting point</Label>
                <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {templates.map((template) => {
                    const selected = template.key === templateKey;

                    return (
                      <button
                        key={template.key}
                        type="button"
                        onClick={() => pick(template)}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                          selected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "hover:bg-muted/60"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
                            selected && "border-primary bg-primary text-primary-foreground"
                          )}
                        >
                          {selected && <Check className="size-3.5" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {template.label}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            {template.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Internal name"
                  placeholder="Welcome email"
                  description="Only your team sees this."
                />
                <FormSelect
                  control={form.control}
                  name="category"
                  label="Category"
                  options={EMAIL_TEMPLATE_CATEGORIES.map((category) => ({
                    label: titleCase(category),
                    value: category,
                  }))}
                />
              </div>

              <FormInput
                control={form.control}
                name="subject"
                label="Subject line"
                placeholder="Welcome to {{companyName}}"
                description="You can change this any time, and personalise it per recipient."
              />

              <FormInput
                control={form.control}
                name="preheader"
                label="Preview text"
                placeholder="Here is everything you need to get going."
              />
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                Create email
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
