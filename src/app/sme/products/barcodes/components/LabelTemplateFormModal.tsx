import {
  FormInput,
  FormSelect,
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
import {
  useCreateLabelTemplateMutation,
  useUpdateLabelTemplateMutation,
} from "@/redux/apis/productBarcodeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  BARCODE_SYMBOLOGIES,
  BARCODE_SYMBOLOGY_LABELS,
  LABEL_PRESETS,
  LABEL_PRESET_LABELS,
  type LabelTemplate,
  type LabelTemplatePayload,
} from "@/types/domain/productBarcode";
import { LabelTemplateSchema, type LabelTemplateFormValues } from "@/validations/catalog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface LabelTemplateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: LabelTemplate | null;
}

const PRESET_OPTIONS = LABEL_PRESETS.map((preset) => ({
  label: LABEL_PRESET_LABELS[preset],
  value: preset,
}));

const SYMBOLOGY_OPTIONS = BARCODE_SYMBOLOGIES.map((symbology) => ({
  label: BARCODE_SYMBOLOGY_LABELS[symbology],
  value: symbology,
}));

const emptyValues = (): LabelTemplateFormValues => ({
  name: "",
  preset: "MEDIUM",
  widthMm: 50,
  heightMm: 30,
  columns: 3,
  gapMm: 2,
  symbology: "EAN13",
  showName: true,
  showSku: true,
  showPrice: true,
  showBarcode: true,
  showCompany: false,
  description: "",
  isDefault: false,
  isActive: true,
});

const toFormValues = (template: LabelTemplate): LabelTemplateFormValues => ({
  name: template.name,
  preset: template.preset,
  widthMm: template.widthMm,
  heightMm: template.heightMm,
  columns: template.columns,
  gapMm: template.gapMm,
  symbology: template.symbology,
  showName: template.fields.showName,
  showSku: template.fields.showSku,
  showPrice: template.fields.showPrice,
  showBarcode: template.fields.showBarcode,
  showCompany: template.fields.showCompany,
  description: template.description,
  isDefault: template.isDefault,
  isActive: template.isActive,
});

const toPayload = (values: LabelTemplateFormValues): LabelTemplatePayload => ({
  name: values.name,
  preset: values.preset,
  widthMm: Number(values.widthMm || 50),
  heightMm: Number(values.heightMm || 30),
  columns: Number(values.columns || 1),
  gapMm: Number(values.gapMm || 0),
  symbology: values.symbology,
  fields: {
    showName: values.showName,
    showSku: values.showSku,
    showPrice: values.showPrice,
    showBarcode: values.showBarcode,
    showCompany: values.showCompany,
  },
  description: values.description,
  isDefault: values.isDefault,
  isActive: values.isActive,
});

export function LabelTemplateFormModal({
  open,
  onOpenChange,
  template,
}: LabelTemplateFormModalProps) {
  const isEdit = Boolean(template);

  const [createTemplate, { isLoading: isCreating }] = useCreateLabelTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateLabelTemplateMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<LabelTemplateFormValues>({
    resolver: zodResolver(LabelTemplateSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(template ? toFormValues(template) : emptyValues());
  }, [open, template, form]);

  const preset = useWatch({ control: form.control, name: "preset" });

  const onSubmit = async (values: LabelTemplateFormValues) => {
    try {
      const body = toPayload(values);

      if (template) {
        await updateTemplate({ id: template._id, body }).unwrap();
        toast.success("Label updated");
      } else {
        await createTemplate(body).unwrap();
        toast.success("Label created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the label");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit label" : "New label"}</DialogTitle>
          <DialogDescription>
            The size of your shelf and product labels, and what gets printed on them.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormInput
                control={form.control}
                name="name"
                label="Label name"
                placeholder="Shelf edge label"
              />

              <FormSelect
                control={form.control}
                name="preset"
                label="Size"
                options={PRESET_OPTIONS}
              />

              {preset === "CUSTOM" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInput
                    control={form.control}
                    name="widthMm"
                    label="Width (mm)"
                    type="number"
                  />
                  <FormInput
                    control={form.control}
                    name="heightMm"
                    label="Height (mm)"
                    type="number"
                  />
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <FormInput
                  control={form.control}
                  name="columns"
                  label="Across a sheet"
                  type="number"
                />
                <FormInput
                  control={form.control}
                  name="gapMm"
                  label="Gap (mm)"
                  type="number"
                />
                <FormSelect
                  control={form.control}
                  name="symbology"
                  label="Barcode format"
                  options={SYMBOLOGY_OPTIONS}
                />
              </div>

              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-sm font-medium">What gets printed</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <FormSwitch control={form.control} name="showName" label="Product name" />
                  <FormSwitch control={form.control} name="showSku" label="SKU" />
                  <FormSwitch control={form.control} name="showPrice" label="Price" />
                  <FormSwitch control={form.control} name="showBarcode" label="Barcode" />
                  <FormSwitch control={form.control} name="showCompany" label="Company name" />
                </div>
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="Where this label is used (optional)"
              />

              <FormSwitch
                control={form.control}
                name="isDefault"
                label="Default label"
                description="Picked first whenever labels are printed."
              />

              <FormSwitch control={form.control} name="isActive" label="Active" />
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
                {isEdit ? "Save changes" : "Create label"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
