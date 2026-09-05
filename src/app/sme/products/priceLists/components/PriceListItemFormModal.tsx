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
  useCreatePriceListItemMutation,
  useGetPriceListOptionsQuery,
  useUpdatePriceListItemMutation,
} from "@/redux/apis/priceListApis";
import { useGetProductPricingOptionsQuery } from "@/redux/apis/productApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { PriceListItem, PriceListItemPayload } from "@/types/domain/priceList";
import { PriceListItemSchema, type PriceListItemFormValues } from "@/validations/catalog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface PriceListItemFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: PriceListItem | null;
  defaultPriceListId?: string;
}

const emptyValues = (priceListId = ""): PriceListItemFormValues => ({
  priceListId,
  productId: "",
  minQuantity: 1,
  price: 0,
  discountPercent: "",
  note: "",
  isActive: true,
});

const toFormValues = (item: PriceListItem): PriceListItemFormValues => ({
  priceListId: item.priceListId,
  productId: item.productId,
  minQuantity: item.minQuantity,
  price: item.price,
  discountPercent: item.discountPercent,
  note: item.note,
  isActive: item.isActive,
});

export function PriceListItemFormModal({
  open,
  onOpenChange,
  item,
  defaultPriceListId,
}: PriceListItemFormModalProps) {
  const isEdit = Boolean(item);

  const [createItem, { isLoading: isCreating }] = useCreatePriceListItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdatePriceListItemMutation();
  const isSaving = isCreating || isUpdating;

  const { data: priceLists = [] } = useGetPriceListOptionsQuery();
  const { data: products = [] } = useGetProductPricingOptionsQuery();

  const form = useForm<PriceListItemFormValues>({
    resolver: zodResolver(PriceListItemSchema),
    defaultValues: emptyValues(defaultPriceListId),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(item ? toFormValues(item) : emptyValues(defaultPriceListId));
  }, [open, item, defaultPriceListId, form]);

  const productId = useWatch({ control: form.control, name: "productId" });
  const priceListId = useWatch({ control: form.control, name: "priceListId" });

  const listChoices = React.useMemo(
    () => priceLists.map((list) => ({ label: `${list.name} (${list.code})`, value: list._id })),
    [priceLists]
  );

  const productChoices = React.useMemo(
    () =>
      products.map((product) => ({
        label: `${product.name} (${product.sku})`,
        value: product._id,
      })),
    [products]
  );

  const selectedList = priceLists.find((list) => list._id === priceListId);
  const selectedProduct = products.find((product) => product._id === productId);

  const basePrice =
    selectedList?.type === "PURCHASE"
      ? (selectedProduct?.purchasePrice ?? 0)
      : (selectedProduct?.sellingPrice ?? 0);

  const onSubmit = async (values: PriceListItemFormValues) => {
    try {
      if (item) {
        await updateItem({
          id: item._id,
          body: {
            minQuantity: Number(values.minQuantity || 0),
            price: values.price,
            discountPercent: Number(values.discountPercent || 0),
            note: values.note,
            isActive: values.isActive,
          },
        }).unwrap();
        toast.success("Price updated");
      } else {
        const body: PriceListItemPayload = {
          priceListId: values.priceListId,
          productId: values.productId,
          minQuantity: Number(values.minQuantity || 0),
          price: values.price,
          discountPercent: Number(values.discountPercent || 0),
          note: values.note,
          isActive: values.isActive,
        };
        await createItem(body).unwrap();
        toast.success("Price added");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the price");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit price" : "Add a price"}</DialogTitle>
          <DialogDescription>
            What a product costs on this list, optionally from a minimum quantity.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormSelect
                control={form.control}
                name="priceListId"
                label="Price list"
                placeholder="Pick a price list"
                options={listChoices}
                disabled={isEdit}
              />

              <FormSelect
                control={form.control}
                name="productId"
                label="Product"
                placeholder="Pick a product"
                options={productChoices}
                disabled={isEdit}
                onValueChange={(value) => {
                  const product = products.find((entry) => entry._id === value);
                  if (!product) return;
                  form.setValue(
                    "price",
                    selectedList?.type === "PURCHASE"
                      ? (product.purchasePrice ?? 0)
                      : (product.sellingPrice ?? 0),
                    { shouldDirty: true }
                  );
                }}
              />

              {selectedProduct && (
                <p className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  The catalogue price for {selectedProduct.name} is{" "}
                  <span className="font-medium tabular-nums text-foreground">{basePrice}</span>.
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <FormInput
                  control={form.control}
                  name="minQuantity"
                  label="From quantity"
                  type="number"
                  description="Applies at or above this."
                />
                <FormInput
                  control={form.control}
                  name="price"
                  label="Price"
                  type="number"
                  step="0.01"
                />
                <FormInput
                  control={form.control}
                  name="discountPercent"
                  label="Extra discount (%)"
                  type="number"
                  step="0.01"
                />
              </div>

              <FormTextarea
                control={form.control}
                name="note"
                label="Note"
                placeholder="Why this price applies (optional)"
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive prices stay recorded but stop applying."
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
                {isEdit ? "Save changes" : "Add price"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
