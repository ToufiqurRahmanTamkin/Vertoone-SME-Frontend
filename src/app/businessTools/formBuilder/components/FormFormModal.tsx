import { FormInput } from "@/components/shared/form-fields";
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
import { useCreateFormMutation, useGetFormTemplatesQuery } from "@/redux/apis/formBuilderApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { FormTemplate } from "@/types/domain/formBuilder";
import { FormCreateSchema, type FormCreateValues } from "@/validations/formBuilder";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const emptyValues = (): FormCreateValues => ({
  name: "",
  slug: "",
  description: "",
  templateKey: "CONTACT",
});

interface FormFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormFormModal({ open, onOpenChange }: FormFormModalProps) {
  const navigate = useNavigate();
  const { data: catalogue } = useGetFormTemplatesQuery();
  const [createForm, { isLoading }] = useCreateFormMutation();

  const form = useForm<FormCreateValues>({
    resolver: zodResolver(FormCreateSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (open) form.reset(emptyValues());
  }, [open, form]);

  const templateKey = form.watch("templateKey");

  const pick = (template: FormTemplate) => {
    form.setValue("templateKey", template.key);
    if (!form.getValues("name")) form.setValue("name", template.suggestedName);
  };

  const onSubmit = async (values: FormCreateValues) => {
    try {
      const created = await createForm({
        name: values.name,
        slug: values.slug || undefined,
        description: values.description || undefined,
        templateKey: values.templateKey,
      }).unwrap();

      toast.success("Form created");
      onOpenChange(false);
      navigate(`/business-tools/form-builder/${created._id}`);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not create the form");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New form</DialogTitle>
          <DialogDescription>
            Pick the kind of form you need. We write the questions for you, ready to edit.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Form name"
                  placeholder="Contact us"
                />
                <FormInput
                  control={form.control}
                  name="slug"
                  label="Address"
                  placeholder="contact-us"
                  description="Leave empty and we build it from the name."
                />
              </div>

              <FormInput
                control={form.control}
                name="description"
                label="Description"
                placeholder="A line telling people what this form is for"
              />

              <div className="space-y-2">
                <Label className="text-sm">Starting point</Label>
                <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {(catalogue?.templates ?? []).map((template) => {
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
                          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-white"
                          style={{ backgroundColor: template.accentColor }}
                        >
                          {selected ? (
                            <Check className="size-4" />
                          ) : (
                            <span className="text-xs font-bold">{template.label.charAt(0)}</span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {template.label}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            {template.description}
                          </span>
                          {template.fieldLabels.length > 0 && (
                            <span className="mt-1 block text-[11px] text-muted-foreground">
                              {template.fieldLabels.join(" · ")}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create form
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
