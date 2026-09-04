import {
  FormDate,
  FormInput,
  FormSelect,
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
  useCreateAssetMutation,
  useGetAssetCategoriesQuery,
  useUpdateAssetMutation,
} from "@/redux/apis/assetApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  ASSET_CONDITIONS,
  ASSET_CONDITION_LABELS,
  ASSET_STATUSES,
  ASSET_STATUS_LABELS,
  type Asset,
} from "@/types/domain/asset";
import { AssetSchema, type AssetFormValues } from "@/validations/asset";
import { toNumber } from "@/validations/hrmsSettings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AssetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: Asset | null;
  currency: string;
}

const STATUS_OPTIONS = ASSET_STATUSES.filter(
  (value) => value !== "ASSIGNED" && value !== "UNDER_MAINTENANCE"
).map((value) => ({ value, label: ASSET_STATUS_LABELS[value] }));

const CONDITION_OPTIONS = ASSET_CONDITIONS.map((value) => ({
  value,
  label: ASSET_CONDITION_LABELS[value],
}));

const emptyValues = (): AssetFormValues => ({
  name: "",
  assetCode: "",
  description: "",
  categoryId: "",
  brand: "",
  modelNumber: "",
  serialNumber: "",
  status: "AVAILABLE",
  condition: "NEW",
  location: "",
  purchaseDate: "",
  purchaseCost: 0,
  supplierName: "",
  invoiceNumber: "",
  warrantyExpiresAt: "",
  usefulLifeMonths: 36,
  salvageValue: 0,
  notes: "",
});

const toFormValues = (asset: Asset): AssetFormValues => ({
  name: asset.name,
  assetCode: asset.assetCode,
  description: asset.description,
  categoryId: asset.categoryId ?? "",
  brand: asset.brand,
  modelNumber: asset.modelNumber,
  serialNumber: asset.serialNumber,
  status: asset.status,
  condition: asset.condition,
  location: asset.location,
  purchaseDate: asset.purchaseDate ? asset.purchaseDate.slice(0, 10) : "",
  purchaseCost: asset.purchaseCost,
  supplierName: asset.supplierName,
  invoiceNumber: asset.invoiceNumber,
  warrantyExpiresAt: asset.warrantyExpiresAt ? asset.warrantyExpiresAt.slice(0, 10) : "",
  usefulLifeMonths: asset.usefulLifeMonths,
  salvageValue: asset.salvageValue,
  notes: asset.notes,
});

export function AssetFormModal({ open, onOpenChange, asset, currency }: AssetFormModalProps) {
  const [createAsset, { isLoading: isCreating }] = useCreateAssetMutation();
  const [updateAsset, { isLoading: isUpdating }] = useUpdateAssetMutation();
  const isSaving = isCreating || isUpdating;

  const { data: categories } = useGetAssetCategoriesQuery({ limit: 100, isActive: true });

  const categoryOptions = React.useMemo(
    () => (categories?.data ?? []).map((row) => ({ value: row._id, label: row.name })),
    [categories]
  );

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(AssetSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(asset ? toFormValues(asset) : emptyValues());
  }, [open, asset, form]);

  const isHeld = Boolean(asset?.holderType);

  const onSubmit = async (values: AssetFormValues) => {
    const body = {
      name: values.name,
      description: values.description,
      categoryId: values.categoryId || null,
      brand: values.brand,
      modelNumber: values.modelNumber,
      serialNumber: values.serialNumber,
      condition: values.condition,
      location: values.location,
      purchaseDate: values.purchaseDate || null,
      purchaseCost: toNumber(values.purchaseCost),
      supplierName: values.supplierName,
      invoiceNumber: values.invoiceNumber,
      warrantyExpiresAt: values.warrantyExpiresAt || null,
      usefulLifeMonths: toNumber(values.usefulLifeMonths),
      salvageValue: toNumber(values.salvageValue),
      notes: values.notes,
      ...(isHeld ? {} : { status: values.status }),
      ...(values.assetCode ? { assetCode: values.assetCode } : {}),
    };

    try {
      if (asset) {
        await updateAsset({ id: asset._id, body }).unwrap();
        toast.success("Asset updated");
      } else {
        await createAsset(body).unwrap();
        toast.success("Asset added");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the asset");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{asset ? "Edit asset" : "New asset"}</DialogTitle>
              <DialogDescription>
                Everything the company owns and hands out, with what it cost and how long it lasts.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput control={form.control} name="name" label="Name" />
                <FormInput
                  control={form.control}
                  name="assetCode"
                  label="Asset code"
                  placeholder="Left blank, one is generated"
                />
                <FormSelect
                  control={form.control}
                  name="categoryId"
                  label="Category"
                  options={categoryOptions}
                  placeholder="Uncategorised"
                  clearable
                />
                <FormInput control={form.control} name="location" label="Where it lives" />
                <FormInput control={form.control} name="brand" label="Brand" />
                <FormInput control={form.control} name="modelNumber" label="Model" />
                <FormInput control={form.control} name="serialNumber" label="Serial number" />
                <FormSelect
                  control={form.control}
                  name="condition"
                  label="Condition"
                  options={CONDITION_OPTIONS}
                />
                <FormSelect
                  control={form.control}
                  name="status"
                  label="Status"
                  options={STATUS_OPTIONS}
                  disabled={isHeld}
                  description={
                    isHeld ? "Take it back from its holder before changing this." : undefined
                  }
                />
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What this asset is"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormDate control={form.control} name="purchaseDate" label="Bought on" />
                <FormInput
                  control={form.control}
                  name="purchaseCost"
                  label={`Purchase cost (${currency})`}
                  type="number"
                  step="0.01"
                />
                <FormInput control={form.control} name="supplierName" label="Bought from" />
                <FormInput control={form.control} name="invoiceNumber" label="Invoice number" />
                <FormDate
                  control={form.control}
                  name="warrantyExpiresAt"
                  label="Warranty ends"
                />
                <FormInput
                  control={form.control}
                  name="usefulLifeMonths"
                  label="Useful life (months)"
                  type="number"
                />
                <FormInput
                  control={form.control}
                  name="salvageValue"
                  label={`Salvage value (${currency})`}
                  type="number"
                  step="0.01"
                  description="What it is still worth once its life is up."
                />
              </div>

              <FormTextarea control={form.control} name="notes" label="Notes" />
            </DialogBody>

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
                {asset ? "Save changes" : "Add asset"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
