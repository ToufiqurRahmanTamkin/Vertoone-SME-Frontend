import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormInput, FormSelect, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { getApiErrorMessage } from "@/lib/api-error";
import { humanizeEnum } from "@/lib/format";
import {
  useCreateUserGuideMutation,
  useUpdateUserGuideMutation,
} from "@/redux/apis/userGuideApi";
import { GUIDE_AUDIENCES, GUIDE_CATEGORIES, type UserGuide } from "@/types";

const schema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(160),
  summary: z.string().trim().max(300),
  content: z.string().trim().min(1, "Content is required"),
  category: z.enum(GUIDE_CATEGORIES),
  audience: z.enum(GUIDE_AUDIENCES),
  tagsText: z.string(),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY_VALUES: FormValues = {
  title: "",
  summary: "",
  content: "",
  category: "GETTING_STARTED",
  audience: "EVERYONE",
  tagsText: "",
  sortOrder: 0,
  isPublished: false,
};

const toFormValues = (guide: UserGuide): FormValues => ({
  title: guide.title,
  summary: guide.summary,
  content: guide.content,
  category: guide.category,
  audience: guide.audience,
  tagsText: guide.tags.join(", "),
  sortOrder: guide.sortOrder,
  isPublished: guide.isPublished,
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide?: UserGuide;
}

export function GuideFormDialog({ open, onOpenChange, guide }: Props) {
  const [createGuide, { isLoading: isCreating }] = useCreateUserGuideMutation();
  const [updateGuide, { isLoading: isUpdating }] = useUpdateUserGuideMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  const { reset } = form;

  React.useEffect(() => {
    if (open) reset(guide ? toFormValues(guide) : EMPTY_VALUES);
  }, [open, guide, reset]);

  const onSubmit = async (values: FormValues) => {
    const body = {
      title: values.title,
      summary: values.summary,
      content: values.content,
      category: values.category,
      audience: values.audience,
      tags: values.tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      sortOrder: values.sortOrder,
      isPublished: values.isPublished,
    };

    try {
      if (guide) {
        await updateGuide({ id: guide._id, body }).unwrap();
        toast.success("Guide updated");
      } else {
        await createGuide(body).unwrap();
        toast.success("Guide created");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save the guide"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{guide ? "Edit guide" : "New guide"}</DialogTitle>
          <DialogDescription>
            {guide
              ? `Slug: ${guide.slug}. Renaming the title keeps the existing slug so published links stay valid.`
              : "The slug is generated from the title."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormInput
              control={form.control}
              name="title"
              label="Title"
              placeholder="How to create a subscription plan"
            />

            <FormTextarea
              control={form.control}
              name="summary"
              label="Summary"
              description="One or two lines shown in the guide list."
              placeholder="A short description of what this guide covers."
              rows={2}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                control={form.control}
                name="category"
                label="Category"
                options={GUIDE_CATEGORIES.map((value) => ({ label: humanizeEnum(value), value }))}
              />
              <FormSelect
                control={form.control}
                name="audience"
                label="Audience"
                options={GUIDE_AUDIENCES.map((value) => ({ label: humanizeEnum(value), value }))}
              />
            </div>

            <FormTextarea
              control={form.control}
              name="content"
              label="Content"
              description="Markdown is supported."
              placeholder={"## Getting started\n\n1. Open Subscription Plans…"}
              rows={10}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="tagsText"
                label="Tags"
                description="Comma separated."
                placeholder="billing, plans"
              />
              <FormInput
                control={form.control}
                name="sortOrder"
                type="number"
                label="Sort order"
                description="Lower numbers appear first."
                placeholder="0"
              />
            </div>

            <FormSwitch
              control={form.control}
              name="isPublished"
              label="Published"
              description="Unpublished guides are visible to admins only."
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {guide ? "Save changes" : "Create guide"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
