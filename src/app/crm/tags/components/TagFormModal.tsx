import {
  FormColor,
  FormInput,
  FormMultiSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
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
import { useCreateTagMutation, useUpdateTagMutation } from "@/redux/apis/tagApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { TAG_SCOPE_LABELS } from "@/constant";
import type { Tag } from "@/types/domain/tag";
import { TAG_SCOPES } from "@/types/domain/tag";
import { TagSchema, type TagFormValues } from "@/validations/tag";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface TagFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: Tag | null;
}

const DEFAULT_COLOR = "#6366f1";

const SCOPE_OPTIONS = TAG_SCOPES.map((scope) => ({
  value: scope,
  label: TAG_SCOPE_LABELS[scope],
}));

const emptyValues = (): TagFormValues => ({
  name: "",
  color: DEFAULT_COLOR,
  description: "",
  scopes: [],
  isActive: true,
});

const toFormValues = (tag: Tag): TagFormValues => ({
  name: tag.name,
  color: tag.color,
  description: tag.description ?? "",
  scopes: tag.scopes ?? [],
  isActive: tag.isActive,
});

export function TagFormModal({ open, onOpenChange, tag }: TagFormModalProps) {
  const isEdit = Boolean(tag);

  const [createTag, { isLoading: isCreating }] = useCreateTagMutation();
  const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<TagFormValues>({
    resolver: zodResolver(TagSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(tag ? toFormValues(tag) : emptyValues());
  }, [open, tag, form]);

  const onSubmit = async (values: TagFormValues) => {
    try {
      if (tag) {
        await updateTag({ id: tag._id, body: values }).unwrap();
        toast.success("Tag updated");
      } else {
        await createTag(values).unwrap();
        toast.success("Tag created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the tag");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit tag" : "New tag"}</DialogTitle>
          <DialogDescription>
            Tags label any record with a name and a colour, and can be used to filter lists across
            HRMS, SME and CRM.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormInput
                control={form.control}
                name="name"
                label="Name"
                placeholder="High priority"
              />
              <FormColor control={form.control} name="color" label="Colour" />
              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What this tag is for (optional)"
              />
              <FormMultiSelect
                control={form.control}
                name="scopes"
                label="Applies to"
                placeholder="Everything"
                options={SCOPE_OPTIONS}
                description="Leave empty and this tag can be attached to any record."
              />
              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive tags stay on existing records but are not offered on new ones."
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
                {isEdit ? "Save changes" : "Create tag"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
