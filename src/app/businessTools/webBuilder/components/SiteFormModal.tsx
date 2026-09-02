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
import {
  useCreateWebSiteMutation,
  useGetTemplateCatalogueQuery,
} from "@/redux/apis/webBuilderApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { WebSiteFormSchema, type WebSiteFormValues } from "@/validations/webBuilder";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const emptyValues = (): WebSiteFormValues => ({
  name: "",
  slug: "",
  tagline: "",
  templateKey: "GENERAL",
});

interface SiteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteFormModal({ open, onOpenChange }: SiteFormModalProps) {
  const navigate = useNavigate();
  const { data: catalogue } = useGetTemplateCatalogueQuery();
  const [createSite, { isLoading }] = useCreateWebSiteMutation();

  const form = useForm<WebSiteFormValues>({
    resolver: zodResolver(WebSiteFormSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (open) form.reset(emptyValues());
  }, [open, form]);

  const templateKey = form.watch("templateKey");

  const onSubmit = async (values: WebSiteFormValues) => {
    try {
      const site = await createSite({
        name: values.name,
        slug: values.slug || undefined,
        tagline: values.tagline || undefined,
        templateKey: values.templateKey,
      }).unwrap();

      toast.success("Website created");
      onOpenChange(false);
      navigate(`/company/business-tools/web-builder/${site._id}`);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not create the website");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New website</DialogTitle>
          <DialogDescription>
            Pick the kind of site you are building. We create the pages for you, written and laid
            out, ready to edit.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Website name"
                  placeholder="Acme Trading"
                />
                <FormInput
                  control={form.control}
                  name="slug"
                  label="Address"
                  placeholder="acme-trading"
                  description="Leave empty and we build it from the name."
                />
              </div>

              <FormInput
                control={form.control}
                name="tagline"
                label="Tagline"
                placeholder="What you do, in one line"
              />

              <div className="space-y-2">
                <Label className="text-sm">Starting point</Label>
                <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {(catalogue?.sites ?? []).map((template) => {
                    const selected = template.key === templateKey;

                    return (
                      <button
                        key={template.key}
                        type="button"
                        onClick={() => form.setValue("templateKey", template.key)}
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
                            <span className="text-xs font-bold">
                              {template.label.charAt(0)}
                            </span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {template.label}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            {template.description}
                          </span>
                          <span className="mt-1 block text-[11px] text-muted-foreground">
                            {template.pages.map((page) => page.title).join(" · ")}
                          </span>
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
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                Create website
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
