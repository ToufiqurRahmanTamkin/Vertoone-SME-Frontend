import { FileUploader } from "@/components/shared/file-uploader";
import {
  FormInput,
  FormMultiSelect,
  FormSelect,
  FormSwitch,
  FormTextarea,
  type MultiSelectOption,
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
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import { useCreateProductMutation, useUpdateProductMutation } from "@/redux/apis/productApis";
import { useGetBrandOptionsQuery } from "@/redux/apis/brandApis";
import { useGetUnitOptionsQuery } from "@/redux/apis/unitOfMeasureApis";
import { useGetProductCategoryOptionsQuery } from "@/redux/apis/productCategoryApis";
import { useGetProductSubCategoryOptionsQuery } from "@/redux/apis/productSubCategoryApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  type Product,
  type ProductPayload,
} from "@/types/domain/product";
import { ProductSchema, type ProductFormValues } from "@/validations/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

const STEPS: readonly StepperStep[] = [
  { id: "basics", label: "Basics" },
  { id: "pricing", label: "Pricing & stock" },
  { id: "channels", label: "Channels" },
  { id: "review", label: "Review" },
];

const STEP_FIELDS: readonly (keyof ProductFormValues)[][] = [
  [
    "name",
    "sku",
    "barcode",
    "type",
    "categoryId",
    "subCategoryId",
    "brandId",
    "unitId",
    "description",
  ],
  ["purchasePrice", "sellingPrice", "taxRate", "openingStock", "lowStockAlert"],
  ["posEnabled", "shopEnabled", "imageUrl", "tagIds", "notes", "isActive"],
  [],
];

const LAST_STEP = STEPS.length - 1;

const TYPE_OPTIONS = PRODUCT_TYPES.map((type) => ({
  label: PRODUCT_TYPE_LABELS[type],
  value: type,
}));

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) => fields.includes(field as keyof ProductFormValues));
  return index === -1 ? 0 : index;
};

const emptyValues = (): ProductFormValues => ({
  name: "",
  sku: "",
  barcode: "",
  type: "STOCKED",
  categoryId: "",
  subCategoryId: "",
  brandId: "",
  unitId: "",
  description: "",
  purchasePrice: "",
  sellingPrice: "",
  taxRate: "",
  openingStock: "",
  lowStockAlert: "",
  posEnabled: true,
  shopEnabled: false,
  imageUrl: null,
  imagePublicId: null,
  tagIds: [],
  notes: "",
  isActive: true,
});

const toFormValues = (product: Product): ProductFormValues => ({
  name: product.name,
  sku: product.sku,
  barcode: product.barcode,
  type: product.type,
  categoryId: product.categoryId,
  subCategoryId: product.subCategoryId ?? "",
  brandId: product.brandId ?? "",
  unitId: product.unitId ?? "",
  description: product.description,
  purchasePrice: product.purchasePrice || "",
  sellingPrice: product.sellingPrice || "",
  taxRate: product.taxRate || "",
  openingStock: product.openingStock || "",
  lowStockAlert: product.lowStockAlert || "",
  posEnabled: product.channels.pos,
  shopEnabled: product.channels.shop,
  imageUrl: product.imageUrl,
  imagePublicId: product.imagePublicId,
  tagIds: product.tagIds,
  notes: product.notes,
  isActive: product.isActive,
});

const toPayload = (values: ProductFormValues): ProductPayload => ({
  name: values.name,
  sku: values.sku || undefined,
  barcode: values.barcode,
  type: values.type,
  categoryId: values.categoryId,
  subCategoryId: values.subCategoryId || null,
  brandId: values.brandId || null,
  unitId: values.unitId || null,
  description: values.description,
  purchasePrice: values.purchasePrice === "" ? 0 : values.purchasePrice,
  sellingPrice: values.sellingPrice === "" ? 0 : values.sellingPrice,
  taxRate: values.taxRate === "" ? 0 : values.taxRate,
  openingStock: values.openingStock === "" ? 0 : values.openingStock,
  lowStockAlert: values.lowStockAlert === "" ? 0 : values.lowStockAlert,
  channels: { pos: values.posEnabled, shop: values.shopEnabled },
  imageUrl: values.imageUrl,
  imagePublicId: values.imagePublicId,
  tagIds: values.tagIds,
  notes: values.notes,
  isActive: values.isActive,
});

export function ProductFormModal({ open, onOpenChange, product }: ProductFormModalProps) {
  const isEdit = Boolean(product);

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(product ? toFormValues(product) : emptyValues());
  }, [open, product, form]);

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);
  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (product?._id ?? "new") : null;

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setStep(0);
    setFurthestStep(seedKey !== null && product ? LAST_STEP : 0);
  }

  const categoryId = useWatch({ control: form.control, name: "categoryId" });

  const { data: categoryOptions = [] } = useGetProductCategoryOptionsQuery();
  const { data: brandOptions = [] } = useGetBrandOptionsQuery();
  const { data: unitOptions = [] } = useGetUnitOptionsQuery();
  const { data: tagOptions = [] } = useGetTagOptionsQuery();
  const { data: subCategoryOptions = [] } = useGetProductSubCategoryOptionsQuery(
    { categoryId },
    { skip: !categoryId }
  );

  const categoryChoices = React.useMemo(
    () => categoryOptions.map((category) => ({ label: category.name, value: category._id })),
    [categoryOptions]
  );

  const subCategoryChoices = React.useMemo(
    () => [
      { label: "No sub category", value: "" },
      ...subCategoryOptions.map((sub) => ({ label: sub.name, value: sub._id })),
    ],
    [subCategoryOptions]
  );

  const brandChoices = React.useMemo(
    () => [
      { label: "No brand", value: "" },
      ...brandOptions.map((brand) => ({ label: brand.name, value: brand._id })),
    ],
    [brandOptions]
  );

  const unitChoices = React.useMemo(
    () => [
      { label: "No unit", value: "" },
      ...unitOptions.map((unit) => ({ label: `${unit.name} (${unit.code})`, value: unit._id })),
    ],
    [unitOptions]
  );

  const tagChoices = React.useMemo<MultiSelectOption[]>(
    () => tagOptions.map((tag) => ({ value: tag._id, label: tag.name, color: tag.color })),
    [tagOptions]
  );

  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });
  const imagePublicId = useWatch({ control: form.control, name: "imagePublicId" });

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const isValid = fields.length === 0 || (await form.trigger(fields, { shouldFocus: true }));
    if (!isValid) return;
    const next = Math.min(step + 1, LAST_STEP);
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const body = toPayload(values);

      if (product) {
        await updateProduct({ id: product._id, body }).unwrap();
        toast.success("Product updated");
      } else {
        await createProduct(body).unwrap();
        toast.success("Product created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the product");
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstStep = Object.keys(errors)
      .map(stepOf)
      .sort((a, b) => a - b)[0];
    if (firstStep !== undefined) setStep(firstStep);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < LAST_STEP) {
      void goNext();
      return;
    }
    void form.handleSubmit(onSubmit, onInvalid)(event);
  };

  const summary = useWatch({ control: form.control });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "New product"}</DialogTitle>
          <DialogDescription>
            Everything you buy, stock or sell. Pick a category and sub category so the catalogue
            stays tidy.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleFormSubmit}>
            <DialogBody className="flex flex-col gap-4">
              <Stepper
                steps={STEPS}
                current={step}
                reachable={furthestStep}
                onStepSelect={setStep}
              />

              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="name"
                      label="Product name"
                      placeholder="Walton 32 inch LED TV"
                      className="sm:col-span-2"
                    />
                    <FormInput
                      control={form.control}
                      name="sku"
                      label="SKU"
                      placeholder="Left blank, we generate one"
                    />
                    <FormInput
                      control={form.control}
                      name="barcode"
                      label="Barcode"
                      placeholder="Scanned at the counter"
                    />
                    <FormSelect
                      control={form.control}
                      name="type"
                      label="Type"
                      options={TYPE_OPTIONS}
                    />
                    <FormSelect
                      control={form.control}
                      name="brandId"
                      label="Brand"
                      placeholder="No brand"
                      options={brandChoices}
                      description={
                        brandOptions.length === 0
                          ? "No brands yet. Create them under Products · Brands."
                          : undefined
                      }
                    />
                    <FormSelect
                      control={form.control}
                      name="categoryId"
                      label="Category"
                      placeholder="Pick a category"
                      options={categoryChoices}
                      onValueChange={() =>
                        form.setValue("subCategoryId", "", { shouldDirty: true })
                      }
                      description={
                        categoryChoices.length === 0
                          ? "No categories yet. Create one under Products · Categories."
                          : undefined
                      }
                    />
                    <FormSelect
                      control={form.control}
                      name="subCategoryId"
                      label="Sub category"
                      placeholder={categoryId ? "No sub category" : "Pick a category first"}
                      options={subCategoryChoices}
                      disabled={!categoryId}
                      description={
                        categoryId && subCategoryOptions.length === 0
                          ? "This category has no sub categories yet."
                          : undefined
                      }
                    />
                    <FormSelect
                      control={form.control}
                      name="unitId"
                      label="Unit of measure"
                      placeholder="No unit"
                      options={unitChoices}
                      description={
                        unitOptions.length === 0
                          ? "No units yet. Create them under Products · Units of Measure."
                          : "How this product is counted, priced and stocked."
                      }
                    />
                  </div>

                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="What this product is, in the words a customer would use"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    control={form.control}
                    name="purchasePrice"
                    label="Purchase price"
                    type="number"
                    description="What you pay your supplier for one unit."
                  />
                  <FormInput
                    control={form.control}
                    name="sellingPrice"
                    label="Selling price"
                    type="number"
                    description="What a customer pays for one unit."
                  />
                  <FormInput
                    control={form.control}
                    name="taxRate"
                    label="Tax rate (%)"
                    type="number"
                    description="VAT or sales tax applied at checkout."
                  />
                  <FormInput
                    control={form.control}
                    name="openingStock"
                    label="Opening stock"
                    type="number"
                    description="Units on hand when you started tracking this here."
                  />
                  <FormInput
                    control={form.control}
                    name="lowStockAlert"
                    label="Low stock alert"
                    type="number"
                    description="Warn once stock falls to this level. 0 means no warning."
                  />
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <FileUploader
                    value={imageUrl ?? undefined}
                    publicId={imagePublicId ?? undefined}
                    folder="products"
                    label="Product image"
                    description="Shown on the point of sale grid and the online shop."
                    onChange={(asset) => {
                      form.setValue("imageUrl", asset?.url ?? null, { shouldDirty: true });
                      form.setValue("imagePublicId", asset?.publicId ?? null, {
                        shouldDirty: true,
                      });
                    }}
                  />

                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium">Sales channels</p>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Where this product can be sold. Point of Sale is on by default.
                    </p>
                    <div className="flex flex-col gap-3">
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
                        description="Listed on your storefront."
                      />
                    </div>
                  </div>

                  <FormMultiSelect
                    control={form.control}
                    name="tagIds"
                    label="Tags"
                    placeholder="No tags"
                    options={tagChoices}
                    emptyText="No tags yet. Create them under CRM · Tags."
                  />

                  <FormTextarea
                    control={form.control}
                    name="notes"
                    label="Notes"
                    placeholder="Anything internal worth remembering about this product"
                  />

                  <FormSwitch
                    control={form.control}
                    name="isActive"
                    label="Active"
                    description="Inactive products stay on past records but are not offered on new ones."
                  />
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    Check the product before you save it.
                  </p>
                  <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-4">
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Name</dt>
                      <dd className="truncate font-medium">{summary.name || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">SKU</dt>
                      <dd className="truncate font-medium">{summary.sku || "Auto"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Category</dt>
                      <dd className="truncate font-medium">
                        {categoryChoices.find((option) => option.value === summary.categoryId)
                          ?.label ?? "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Sub category</dt>
                      <dd className="truncate font-medium">
                        {subCategoryChoices.find(
                          (option) => option.value === summary.subCategoryId
                        )?.label ?? "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Brand</dt>
                      <dd className="truncate font-medium">
                        {brandChoices.find((option) => option.value === summary.brandId)?.label ??
                          "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Unit</dt>
                      <dd className="truncate font-medium">
                        {unitChoices.find((option) => option.value === summary.unitId)?.label ??
                          "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Purchase price</dt>
                      <dd className="font-medium tabular-nums">{summary.purchasePrice || 0}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Selling price</dt>
                      <dd className="font-medium tabular-nums">{summary.sellingPrice || 0}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Opening stock</dt>
                      <dd className="font-medium tabular-nums">{summary.openingStock || 0}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Channels</dt>
                      <dd className="font-medium">
                        {[summary.posEnabled && "POS", summary.shopEnabled && "Shop"]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Tags</dt>
                      <dd className="font-medium">{summary.tagIds?.length ?? 0}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Status</dt>
                      <dd className="font-medium">{summary.isActive ? "Active" : "Inactive"}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </DialogBody>

            <DialogFooter className="sm:justify-between">
              <span className="hidden text-xs text-muted-foreground sm:block">
                Step {step + 1} of {STEPS.length}
              </span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
                  disabled={isSaving}
                >
                  {step === 0 ? (
                    "Cancel"
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </>
                  )}
                </Button>
                {step < LAST_STEP ? (
                  <Button key="wizard-next" type="button" onClick={() => void goNext()}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button key="wizard-submit" type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? "Save changes" : "Create product"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
