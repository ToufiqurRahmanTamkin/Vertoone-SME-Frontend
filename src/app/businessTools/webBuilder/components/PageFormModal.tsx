import { FormInput, FormSwitch } from "@/components/shared/form-fields";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useCreateWebPageMutation,
  useGetTemplateCatalogueQuery,
} from "@/redux/apis/webBuilderApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { PageTemplate } from "@/types/domain/webBuilder";
import { WebPageSchema, type WebPageFormValues } from "@/validations/webBuilder";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const emptyValues = (): WebPageFormValues => ({
  title: "",
  slug: "",
  templateKey: "BLANK",
  showInNav: true,
});

interface PageFormModalProps {
  siteId: string;
  siteTemplateKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PageFormModal({
  siteId,
  siteTemplateKey,
  open,
  onOpenChange,
}: PageFormModalProps) {
  const navigate = useNavigate();
  const { data: catalogue } = useGetTemplateCatalogueQuery();
  const [createPage, { isLoading }] = useCreateWebPageMutation();

  const [category, setCategory] = React.useState(siteTemplateKey);

  const form = useForm<WebPageFormValues>({
    resolver: zodResolver(WebPageSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(emptyValues());
    setCategory(siteTemplateKey);
  }, [open, siteTemplateKey, form]);

  const templates = React.useMemo(() => catalogue?.pages ?? [], [catalogue]);

  const categories = React.useMemo(() => {
    const seen = new Map<string, string>();
    templates.forEach((template) => seen.set(template.category, template.categoryLabel));
    return [...seen.entries()].map(([value, label]) => ({ value, label }));
  }, [templates]);

  const visible = React.useMemo(
    () =>
      templates.filter(
        (template) => template.key === "BLANK" || template.category === category
      ),
    [templates, category]
  );

  const templateKey = form.watch("templateKey");

  const pick = (template: PageTemplate) => {
    form.setValue("templateKey", template.key);
    if (!form.getValues("title")) {
      form.setValue("title", template.suggestedTitle);
    }
  };

  const onSubmit = async (values: WebPageFormValues) => {
    try {
      const page = await createPage({
        siteId,
        body: {
          title: values.title,
          slug: values.slug || undefined,
          templateKey: values.templateKey,
          showInNav: values.showInNav,
        },
      }).unwrap();

      toast.success("Page created");
      onOpenChange(false);
      navigate(`/crm/business-tools/web-builder/${siteId}/pages/${page._id}`);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not create the page");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New page</DialogTitle>
          <DialogDescription>
            Start from a premade layout, then change anything you like in the builder.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="text-sm">Starting point</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Kind of website" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((entry) => (
                        <SelectItem key={entry.value} value={entry.value}>
                          {entry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {visible.map((template) => {
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
                            {template.suggestedTitle}
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
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                Create page
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
