import { FormColor, FormInput, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
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
import { useCreateLeadSourceMutation, useUpdateLeadSourceMutation } from "@/redux/apis/leadSourceApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { LeadSource } from "@/types/domain/leadSource";
import { LeadSourceSchema, type LeadSourceFormValues } from "@/validations/leadSource";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface LeadSourceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: LeadSource | null;
}

const DEFAULT_COLOR = "#0ea5e9";

const emptyValues = (): LeadSourceFormValues => ({
  name: "",
  color: DEFAULT_COLOR,
  description: "",
  isActive: true,
});

const toFormValues = (source: LeadSource): LeadSourceFormValues => ({
  name: source.name,
  color: source.color,
  description: source.description ?? "",
  isActive: source.isActive,
});

export function LeadSourceFormModal({ open, onOpenChange, source }: LeadSourceFormModalProps) {
  const isEdit = Boolean(source);

  const [createLeadSource, { isLoading: isCreating }] = useCreateLeadSourceMutation();
  const [updateLeadSource, { isLoading: isUpdating }] = useUpdateLeadSourceMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<LeadSourceFormValues>({
    resolver: zodResolver(LeadSourceSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(source ? toFormValues(source) : emptyValues());
  }, [open, source, form]);

  const onSubmit = async (values: LeadSourceFormValues) => {
    try {
      if (source) {
        await updateLeadSource({ id: source._id, body: values }).unwrap();
        toast.success("Lead source updated");
      } else {
        await createLeadSource(values).unwrap();
        toast.success("Lead source created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the lead source");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit lead source" : "New lead source"}</DialogTitle>
          <DialogDescription>
            Lead sources record where an enquiry came from, each with its own colour so they
            stand out in a list.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormInput
                control={form.control}
                name="name"
                label="Name"
                placeholder="Referral"
              />
              <FormColor control={form.control} name="color" label="Colour" />
              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="Where these enquiries come from (optional)"
              />
              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive sources stay on existing records but are not offered on new ones."
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create lead source"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
