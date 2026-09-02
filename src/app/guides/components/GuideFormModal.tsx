import { FormInput, FormSelect, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
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
import { GUIDE_AUDIENCE_LABELS, GUIDE_CATEGORY_LABELS, toOptions } from "@/constant";
import { useCreateGuideMutation, useUpdateGuideMutation } from "@/redux/apis/guideApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { UserGuide } from "@/types/domain/guide";
import { GuideSchema, parseTags, type GuideFormValues } from "@/validations/guide";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface GuideFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide?: UserGuide | null;
}

const CATEGORY_OPTIONS = toOptions(GUIDE_CATEGORY_LABELS);
const AUDIENCE_OPTIONS = toOptions(GUIDE_AUDIENCE_LABELS);

const emptyValues: GuideFormValues = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  category: "GETTING_STARTED",
  audience: "EVERYONE",
  tags: "",
  sortOrder: 0,
  isPublished: false,
};

const toFormValues = (guide: UserGuide): GuideFormValues => ({
  title: guide.title,
  slug: guide.slug ?? "",
  summary: guide.summary ?? "",
  content: guide.content,
  category: guide.category,
  audience: guide.audience,
  tags: (guide.tags ?? []).join(", "),
  sortOrder: guide.sortOrder ?? 0,
  isPublished: guide.isPublished,
});

export function GuideFormModal({ open, onOpenChange, guide }: GuideFormModalProps) {
  const isEdit = Boolean(guide);
  const [createGuide, { isLoading: isCreating }] = useCreateGuideMutation();
  const [updateGuide, { isLoading: isUpdating }] = useUpdateGuideMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<GuideFormValues>({
    resolver: zodResolver(GuideSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(guide ? toFormValues(guide) : emptyValues);
  }, [open, guide, form]);

  const onSubmit = async (values: GuideFormValues) => {
    const payload = {
      title: values.title,
      summary: values.summary,
      content: values.content,
      category: values.category,
      audience: values.audience,
      tags: parseTags(values.tags),
      sortOrder: values.sortOrder,
      isPublished: values.isPublished,
      ...(values.slug ? { slug: values.slug } : {}),
    };

    try {
      if (guide) {
        await updateGuide({ id: guide._id, body: payload }).unwrap();
        toast.success("Guide updated");
      } else {
        await createGuide(payload).unwrap();
        toast.success("Guide created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the guide");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit guide" : "New user guide"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this guide. Changing the slug changes its public link."
              : "Leave the slug blank to derive it from the title."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <FormInput
                control={form.control}
                name="title"
                label="Title"
                placeholder="Getting started with Vertoone Omni"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="slug"
                  label="Slug"
                  placeholder="auto-generated-from-title"
                  description="Lowercase words separated by hyphens."
                />
                <FormInput
                  control={form.control}
                  name="tags"
                  label="Tags"
                  placeholder="setup, billing"
                  description="Comma separated, up to 20."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormSelect
                  control={form.control}
                  name="category"
                  label="Category"
                  options={CATEGORY_OPTIONS}
                />
                <FormSelect
                  control={form.control}
                  name="audience"
                  label="Audience"
                  options={AUDIENCE_OPTIONS}
                />
                <FormInput
                  control={form.control}
                  name="sortOrder"
                  label="Sort order"
                  type="number"
                  description="Lower shows first."
                />
              </div>

              <FormTextarea
                control={form.control}
                name="summary"
                label="Summary"
                placeholder="One or two sentences shown in the guide list."
              />

              <FormTextarea
                control={form.control}
                name="content"
                label="Content"
                placeholder="The full guide body. Markdown is preserved as written."
                className="[&_textarea]:min-h-52"
              />

              <FormSwitch
                control={form.control}
                name="isPublished"
                label="Published"
                description="Visible to its audience"
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
                {isEdit ? "Save changes" : "Create guide"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
