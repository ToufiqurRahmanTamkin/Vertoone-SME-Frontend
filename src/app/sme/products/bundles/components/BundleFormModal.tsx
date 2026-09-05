import { FileUploader } from "@/components/shared/file-uploader";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
import {
  QuantityItems,
  emptyQuantityLine,
  quantityLineError,
  type QuantityLine,
} from "@/components/shared/quantity-items";
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
import { formatAmountValue } from "@/lib/amount";
import { useGetProductPricingOptionsQuery } from "@/redux/apis/productApis";
import {
  useCreateBundleMutation,
  useUpdateBundleMutation,
} from "@/redux/apis/productBundleApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  BUNDLE_PRICING_LABELS,
  BUNDLE_PRICING_MODES,
  BUNDLE_TYPES,
  BUNDLE_TYPE_LABELS,
  type ProductBundle,
  type ProductBundlePayload,
} from "@/types/domain/productBundle";
import { ProductBundleSchema, type ProductBundleFormValues } from "@/validations/catalog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface BundleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle?: ProductBundle | null;
}

const TYPE_OPTIONS = BUNDLE_TYPES.map((type) => ({
  label: BUNDLE_TYPE_LABELS[type],
  value: type,
}));

const PRICING_OPTIONS = BUNDLE_PRICING_MODES.map((mode) => ({
  label: BUNDLE_PRICING_LABELS[mode],
  value: mode,
}));

const emptyValues = (): ProductBundleFormValues => ({
  name: "",
  code: "",
  type: "BUNDLE",
  description: "",
  pricingMode: "FIXED",
  sellingPrice: "",
  taxRate: "",
  posEnabled: true,
  shopEnabled: false,
  imageUrl: null,
  imagePublicId: null,
  notes: "",
  isActive: true,
});

const toFormValues = (bundle: ProductBundle): ProductBundleFormValues => ({
  name: bundle.name,
  code: bundle.code,
  type: bundle.type,
  description: bundle.description,
  pricingMode: bundle.pricingMode,
  sellingPrice: bundle.sellingPrice,
  taxRate: bundle.taxRate,
  posEnabled: bundle.channels.pos,
  shopEnabled: bundle.channels.shop,
  imageUrl: bundle.imageUrl,
  imagePublicId: bundle.imagePublicId,
  notes: bundle.notes,
  isActive: bundle.isActive,
});

const toLines = (bundle: ProductBundle): QuantityLine[] =>
  bundle.components.length === 0
    ? [emptyQuantityLine()]
    : bundle.components.map((component) => ({
        key: component._id,
        productId: component.productId,
        quantity: String(component.quantity),
        direction: "IN" as const,
        note: "",
      }));

export function BundleFormModal({ open, onOpenChange, bundle }: BundleFormModalProps) {
  const isEdit = Boolean(bundle);

  const [createBundle, { isLoading: isCreating }] = useCreateBundleMutation();
  const [updateBundle, { isLoading: isUpdating }] = useUpdateBundleMutation();
  const isSaving = isCreating || isUpdating;

  const { data: products = [] } = useGetProductPricingOptionsQuery();

  const [lines, setLines] = React.useState<QuantityLine[]>([emptyQuantityLine()]);
  const [lineError, setLineError] = React.useState<string | null>(null);

  const form = useForm<ProductBundleFormValues>({
    resolver: zodResolver(ProductBundleSchema),
    defaultValues: emptyValues(),
  });

  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (bundle?._id ?? "new") : null;

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setLines(bundle ? toLines(bundle) : [emptyQuantityLine()]);
    setLineError(null);
  }

  React.useEffect(() => {
    if (!open) return;
    form.reset(bundle ? toFormValues(bundle) : emptyValues());
  }, [open, bundle, form]);

  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });
  const imagePublicId = useWatch({ control: form.control, name: "imagePublicId" });
  const pricingMode = useWatch({ control: form.control, name: "pricingMode" });

  const componentsTotal = React.useMemo(
    () =>
      lines.reduce((sum, line) => {
        const product = products.find((entry) => entry._id === line.productId);
        if (!product) return sum;
        return sum + Number(line.quantity || 0) * (product.sellingPrice ?? 0);
      }, 0),
    [lines, products]
  );

  const onSubmit = async (values: ProductBundleFormValues) => {
    const error = quantityLineError(lines);
    if (error) {
      setLineError(error);
      return;
    }
    setLineError(null);

    const body: ProductBundlePayload = {
      name: values.name,
      code: values.code || undefined,
      type: values.type,
      description: values.description,
      components: lines
        .filter((line) => line.productId)
        .map((line) => ({
          productId: line.productId,
          quantity: Number(line.quantity || 0),
        })),
      pricingMode: values.pricingMode,
      sellingPrice: Number(values.sellingPrice || 0),
      taxRate: Number(values.taxRate || 0),
      channels: { pos: values.posEnabled, shop: values.shopEnabled },
      imageUrl: values.imageUrl,
      imagePublicId: values.imagePublicId,
      notes: values.notes,
      isActive: values.isActive,
    };

    try {
      if (bundle) {
        await updateBundle({ id: bundle._id, body }).unwrap();
        toast.success("Bundle updated");
      } else {
        await createBundle(body).unwrap();
        toast.success("Bundle created");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const error = err as ApiErrorResponse;
      toast.error(error?.data?.message || "Could not save the bundle");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit bundle" : "New bundle"}</DialogTitle>
          <DialogDescription>
            Several products grouped and sold together as one item, at one price.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Bundle name"
                  placeholder="Back to school pack"
                />
                <FormInput
                  control={form.control}
                  name="code"
                  label="Code"
                  placeholder="Left blank, we generate one"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="type"
                  label="Kind"
                  options={TYPE_OPTIONS}
                  description="A kit is assembled, a bundle is simply sold together."
                />
                <FormSelect
                  control={form.control}
                  name="pricingMode"
                  label="Pricing"
                  options={PRICING_OPTIONS}
                />
              </div>

              <QuantityItems
                lines={lines}
                onLinesChange={setLines}
                products={products}
                error={lineError}
                hint="Pick the products that go into the bundle, and how many of each."
              />

              <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Parts add up to</span>
                  <span className="font-medium tabular-nums">
                    {formatAmountValue(componentsTotal)}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="sellingPrice"
                  label="Bundle price"
                  type="number"
                  step="0.01"
                  disabled={pricingMode === "SUM_OF_COMPONENTS"}
                  description={
                    pricingMode === "SUM_OF_COMPONENTS"
                      ? "Taken from the parts above."
                      : "What the customer pays for the whole bundle."
                  }
                />
                <FormInput
                  control={form.control}
                  name="taxRate"
                  label="Tax rate (%)"
                  type="number"
                  step="0.01"
                />
              </div>

              <FileUploader
                value={imageUrl ?? undefined}
                publicId={imagePublicId ?? undefined}
                folder="products"
                label="Bundle image"
                description="Shown wherever the bundle is offered."
                onChange={(asset) => {
                  form.setValue("imageUrl", asset?.url ?? null, { shouldDirty: true });
                  form.setValue("imagePublicId", asset?.publicId ?? null, { shouldDirty: true });
                }}
              />

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What the bundle contains and who it suits (optional)"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <FormSwitch
                  control={form.control}
                  name="posEnabled"
                  label="Point of Sale"
                  description="Offered at the counter."
                />
                <FormSwitch
                  control={form.control}
                  name="shopEnabled"
                  label="Online shop"
                  description="Listed on your public shop."
                />
              </div>

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive bundles are hidden from every channel."
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
                {isEdit ? "Save changes" : "Create bundle"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
