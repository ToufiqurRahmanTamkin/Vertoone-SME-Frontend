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
import { useGetProductOptionsQuery } from "@/redux/apis/productApis";
import {
  useCreateBarcodeMutation,
  useUpdateBarcodeMutation,
} from "@/redux/apis/productBarcodeApis";
import { useGetProductVariantsQuery } from "@/redux/apis/productVariantApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  BARCODE_LENGTHS,
  BARCODE_SYMBOLOGIES,
  BARCODE_SYMBOLOGY_LABELS,
  type ProductBarcode,
  type ProductBarcodePayload,
} from "@/types/domain/productBarcode";
import { ProductBarcodeSchema, type ProductBarcodeFormValues } from "@/validations/catalog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface BarcodeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barcode?: ProductBarcode | null;
}

const SYMBOLOGY_OPTIONS = BARCODE_SYMBOLOGIES.map((symbology) => ({
  label: BARCODE_SYMBOLOGY_LABELS[symbology],
  value: symbology,
}));

const emptyValues = (): ProductBarcodeFormValues => ({
  productId: "",
  variantId: "",
  code: "",
  symbology: "EAN13",
  packSize: 1,
  isPrimary: false,
  note: "",
  isActive: true,
});

const toFormValues = (barcode: ProductBarcode): ProductBarcodeFormValues => ({
  productId: barcode.productId,
  variantId: barcode.variantId ?? "",
  code: barcode.code,
  symbology: barcode.symbology,
  packSize: barcode.packSize,
  isPrimary: barcode.isPrimary,
  note: barcode.note,
  isActive: barcode.isActive,
});

export function BarcodeFormModal({ open, onOpenChange, barcode }: BarcodeFormModalProps) {
  const isEdit = Boolean(barcode);

  const [createBarcode, { isLoading: isCreating }] = useCreateBarcodeMutation();
  const [updateBarcode, { isLoading: isUpdating }] = useUpdateBarcodeMutation();
  const isSaving = isCreating || isUpdating;

  const { data: products = [] } = useGetProductOptionsQuery();

  const form = useForm<ProductBarcodeFormValues>({
    resolver: zodResolver(ProductBarcodeSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(barcode ? toFormValues(barcode) : emptyValues());
  }, [open, barcode, form]);

  const productId = useWatch({ control: form.control, name: "productId" });
  const symbology = useWatch({ control: form.control, name: "symbology" });

  const { data: variants } = useGetProductVariantsQuery(
    { productId, limit: 100 },
    { skip: !productId }
  );

  const productChoices = React.useMemo(
    () =>
      products.map((product) => ({
        label: `${product.name} (${product.sku})`,
        value: product._id,
      })),
    [products]
  );

  const variantChoices = React.useMemo(
    () => [
      { label: "The product itself", value: "" },
      ...(variants?.data ?? []).map((variant) => ({
        label: variant.name || variant.sku,
        value: variant._id,
      })),
    ],
    [variants]
  );

  const expectedLength = BARCODE_LENGTHS[symbology];

  const onSubmit = async (values: ProductBarcodeFormValues) => {
    try {
      const body: ProductBarcodePayload = {
        productId: values.productId,
        variantId: values.variantId || null,
        code: values.code || undefined,
        symbology: values.symbology,
        packSize: Number(values.packSize || 1),
        isPrimary: values.isPrimary,
        note: values.note,
        isActive: values.isActive,
      };

      if (barcode) {
        const { productId: _productId, ...rest } = body;
        await updateBarcode({ id: barcode._id, body: rest }).unwrap();
        toast.success("Barcode updated");
      } else {
        await createBarcode(body).unwrap();
        toast.success("Barcode created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the barcode");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit barcode" : "New barcode"}</DialogTitle>
          <DialogDescription>
            A scannable code for a product or one of its variants. Leave the code blank and we
            generate a valid one.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormSelect
                control={form.control}
                name="productId"
                label="Product"
                placeholder="Pick a product"
                options={productChoices}
                disabled={isEdit}
                onValueChange={() => form.setValue("variantId", "", { shouldDirty: true })}
              />

              <FormSelect
                control={form.control}
                name="variantId"
                label="Variant"
                placeholder="The product itself"
                options={variantChoices}
                disabled={!productId}
                description={
                  productId && (variants?.data ?? []).length === 0
                    ? "This product has no variants yet."
                    : undefined
                }
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="symbology"
                  label="Format"
                  options={SYMBOLOGY_OPTIONS}
                />
                <FormInput
                  control={form.control}
                  name="packSize"
                  label="Units per scan"
                  type="number"
                  description="Use this for cases and cartons."
                />
              </div>

              <FormInput
                control={form.control}
                name="code"
                label="Code"
                placeholder="Leave blank and we generate one"
                description={
                  expectedLength
                    ? `${BARCODE_SYMBOLOGY_LABELS[symbology]} codes are ${expectedLength} digits long.`
                    : "Letters and digits are both allowed for this format."
                }
              />

              <FormSwitch
                control={form.control}
                name="isPrimary"
                label="Primary barcode"
                description="The primary code is the one written back onto the product."
              />

              <FormTextarea
                control={form.control}
                name="note"
                label="Note"
                placeholder="Where this code came from (optional)"
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive codes stop being recognised at the counter."
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
                {isEdit ? "Save changes" : "Create barcode"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
