import { FileUploader } from "@/components/shared/file-uploader";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetProductOptionsQuery } from "@/redux/apis/productApis";
import {
  useCreateProductVariantMutation,
  useGetProductOptionChoicesQuery,
  useUpdateProductVariantMutation,
} from "@/redux/apis/productVariantApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { ProductVariant, ProductVariantPayload } from "@/types/domain/productVariant";
import { ProductVariantSchema, type ProductVariantFormValues } from "@/validations/catalog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface VariantFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: ProductVariant | null;
}

const emptyValues = (): ProductVariantFormValues => ({
  productId: "",
  sku: "",
  barcode: "",
  selections: [{ optionId: "", optionName: "", value: "" }],
  purchasePrice: "",
  sellingPrice: "",
  lowStockAlert: "",
  imageUrl: null,
  imagePublicId: null,
  isDefault: false,
  isActive: true,
});

const toFormValues = (variant: ProductVariant): ProductVariantFormValues => ({
  productId: variant.productId,
  sku: variant.sku,
  barcode: variant.barcode,
  selections: variant.selections.map((entry) => ({
    optionId: entry.optionId ?? "",
    optionName: entry.optionName,
    value: entry.value,
  })),
  purchasePrice: variant.purchasePrice,
  sellingPrice: variant.sellingPrice,
  lowStockAlert: variant.lowStockAlert,
  imageUrl: variant.imageUrl,
  imagePublicId: variant.imagePublicId,
  isDefault: variant.isDefault,
  isActive: variant.isActive,
});

const toPayload = (values: ProductVariantFormValues): ProductVariantPayload => ({
  productId: values.productId,
  sku: values.sku || undefined,
  barcode: values.barcode,
  selections: values.selections.map((entry) => ({
    optionId: entry.optionId || null,
    optionName: entry.optionName || undefined,
    value: entry.value,
  })),
  purchasePrice: Number(values.purchasePrice || 0),
  sellingPrice: Number(values.sellingPrice || 0),
  lowStockAlert: Number(values.lowStockAlert || 0),
  imageUrl: values.imageUrl,
  imagePublicId: values.imagePublicId,
  isDefault: values.isDefault,
  isActive: values.isActive,
});

export function VariantFormModal({ open, onOpenChange, variant }: VariantFormModalProps) {
  const isEdit = Boolean(variant);

  const [createVariant, { isLoading: isCreating }] = useCreateProductVariantMutation();
  const [updateVariant, { isLoading: isUpdating }] = useUpdateProductVariantMutation();
  const isSaving = isCreating || isUpdating;

  const { data: productOptions = [] } = useGetProductOptionsQuery();
  const { data: optionSets = [] } = useGetProductOptionChoicesQuery();

  const form = useForm<ProductVariantFormValues>({
    resolver: zodResolver(ProductVariantSchema),
    defaultValues: emptyValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "selections",
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(variant ? toFormValues(variant) : emptyValues());
  }, [open, variant, form]);

  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });
  const imagePublicId = useWatch({ control: form.control, name: "imagePublicId" });
  const selections = useWatch({ control: form.control, name: "selections" });

  const productChoices = React.useMemo(
    () =>
      productOptions.map((product) => ({
        label: `${product.name} (${product.sku})`,
        value: product._id,
      })),
    [productOptions]
  );

  const onSubmit = async (values: ProductVariantFormValues) => {
    try {
      const body = toPayload(values);

      if (variant) {
        const { productId: _productId, ...rest } = body;
        await updateVariant({ id: variant._id, body: rest }).unwrap();
        toast.success("Variant updated");
      } else {
        await createVariant(body).unwrap();
        toast.success("Variant created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the variant");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit variant" : "New variant"}</DialogTitle>
          <DialogDescription>
            One sellable combination of a product, such as a T-shirt in Medium and Blue.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormSelect
                control={form.control}
                name="productId"
                label="Product"
                placeholder="Pick the product this varies"
                options={productChoices}
                disabled={isEdit}
                description={
                  isEdit
                    ? "A variant stays with the product it was created against."
                    : "Variants inherit their pricing defaults from this product."
                }
              />

              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Option values</p>
                    <p className="text-xs text-muted-foreground">
                      Pick one value from each option set that defines this variant.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={fields.length >= 5}
                    onClick={() => append({ optionId: "", optionName: "", value: "" })}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add option
                  </Button>
                </div>

                {fields.map((field, index) => {
                  const optionId = selections?.[index]?.optionId ?? "";
                  const optionSet = optionSets.find((entry) => entry._id === optionId);

                  return (
                    <div key={field.id} className="flex flex-wrap items-end gap-2">
                      <div className="min-w-[9rem] flex-1">
                        <Select
                          value={optionId}
                          onValueChange={(value) => {
                            const picked = optionSets.find((entry) => entry._id === value);
                            form.setValue(`selections.${index}.optionId`, value, {
                              shouldDirty: true,
                            });
                            form.setValue(
                              `selections.${index}.optionName`,
                              picked?.name ?? "",
                              { shouldDirty: true }
                            );
                            form.setValue(`selections.${index}.value`, "", {
                              shouldDirty: true,
                            });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Option set" />
                          </SelectTrigger>
                          <SelectContent>
                            {optionSets.map((entry) => (
                              <SelectItem key={entry._id} value={entry._id}>
                                {entry.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="min-w-[9rem] flex-1">
                        <Select
                          value={selections?.[index]?.value ?? ""}
                          disabled={!optionSet}
                          onValueChange={(value) =>
                            form.setValue(`selections.${index}.value`, value, {
                              shouldDirty: true,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={optionSet ? "Value" : "Pick an option"} />
                          </SelectTrigger>
                          <SelectContent>
                            {(optionSet?.values ?? []).map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 shrink-0"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                        aria-label="Remove option"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}

                {optionSets.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No option sets yet. Create one on the Option sets tab first.
                  </p>
                )}

                {form.formState.errors.selections && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.selections.message ??
                      "Every option needs a value picked"}
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="sku"
                  label="Variant SKU"
                  placeholder="Left blank, we generate one"
                />
                <FormInput
                  control={form.control}
                  name="barcode"
                  label="Barcode"
                  placeholder="Scanned at the counter"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <FormInput
                  control={form.control}
                  name="purchasePrice"
                  label="Purchase price"
                  type="number"
                  step="0.01"
                />
                <FormInput
                  control={form.control}
                  name="sellingPrice"
                  label="Selling price"
                  type="number"
                  step="0.01"
                />
                <FormInput
                  control={form.control}
                  name="lowStockAlert"
                  label="Low stock alert"
                  type="number"
                />
              </div>

              <FileUploader
                value={imageUrl ?? undefined}
                publicId={imagePublicId ?? undefined}
                folder="products"
                label="Variant image"
                description="Shown wherever this exact combination is offered."
                onChange={(asset) => {
                  form.setValue("imageUrl", asset?.url ?? null, { shouldDirty: true });
                  form.setValue("imagePublicId", asset?.publicId ?? null, { shouldDirty: true });
                }}
              />

              <FormSwitch
                control={form.control}
                name="isDefault"
                label="Default variant"
                description="Picked first when someone chooses this product."
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive variants stay on past documents but are not offered on new ones."
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
                {isEdit ? "Save changes" : "Create variant"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
