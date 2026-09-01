import { FormInput, FormSelect, FormSwitch } from "@/components/shared/form-fields";
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
import { useCreateWebPageMutation } from "@/redux/apis/webBuilderApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { WebPageSchema, type WebPageFormValues } from "@/validations/webBuilder";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TEMPLATES = [
  { label: "Blank page", value: "BLANK" },
  { label: "Landing page", value: "LANDING" },
  { label: "About us", value: "ABOUT" },
  { label: "Services", value: "SERVICES" },
  { label: "Contact", value: "CONTACT" },
];

const emptyValues = (): WebPageFormValues => ({
  title: "",
  slug: "",
  template: "LANDING",
  showInNav: true,
});

interface PageFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PageFormModal({ open, onOpenChange }: PageFormModalProps) {
  const navigate = useNavigate();
  const [createPage, { isLoading }] = useCreateWebPageMutation();

  const form = useForm<WebPageFormValues>({
    resolver: zodResolver(WebPageSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (open) form.reset(emptyValues());
  }, [open, form]);

  const onSubmit = async (values: WebPageFormValues) => {
    try {
      const page = await createPage({
        title: values.title,
        slug: values.slug || undefined,
        template: values.template,
        showInNav: values.showInNav,
      }).unwrap();

      toast.success("Page created");
      onOpenChange(false);
      navigate(`/business-tools/web-builder/${page._id}`);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not create the page");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New page</DialogTitle>
          <DialogDescription>
            Pick a starting point. Every section can be changed, moved or removed afterwards.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-4">
              <FormInput
                control={form.control}
                name="title"
                label="Page title"
                placeholder="About us"
              />

              <FormInput
                control={form.control}
                name="slug"
                label="Address"
                placeholder="about-us"
                description="Leave empty and we build it from the title."
              />

              <FormSelect
                control={form.control}
                name="template"
                label="Starting point"
                options={TEMPLATES}
              />

              <FormSwitch
                control={form.control}
                name="showInNav"
                label="Show in the menu"
                description="Adds the page to the site header and footer."
              />
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create page
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
