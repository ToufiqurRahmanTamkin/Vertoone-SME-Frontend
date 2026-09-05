import {
  FormDate,
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
import { useGetBrandOptionsQuery } from "@/redux/apis/brandApis";
import { useGetProductOptionsQuery } from "@/redux/apis/productApis";
import { useGetProductCategoryOptionsQuery } from "@/redux/apis/productCategoryApis";
import {
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
} from "@/redux/apis/promotionApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PROMOTION_SCOPES,
  PROMOTION_SCOPE_LABELS,
  PROMOTION_TYPES,
  PROMOTION_TYPE_LABELS,
  type Promotion,
  type PromotionPayload,
} from "@/types/domain/promotion";
import { PromotionSchema, type PromotionFormValues } from "@/validations/catalog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface PromotionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: Promotion | null;
}

const TYPE_OPTIONS = PROMOTION_TYPES.map((type) => ({
  label: PROMOTION_TYPE_LABELS[type],
  value: type,
}));

const SCOPE_OPTIONS = PROMOTION_SCOPES.map((scope) => ({
  label: PROMOTION_SCOPE_LABELS[scope],
  value: scope,
}));

const emptyValues = (): PromotionFormValues => ({
  name: "",
  couponCode: "",
  type: "PERCENTAGE",
  value: "",
  maxDiscountAmount: "",
  appliesTo: "ALL",
  productIds: [],
  categoryIds: [],
  brandIds: [],
  minOrderAmount: "",
  minQuantity: "",
  buyQuantity: "",
  getQuantity: "",
  startsAt: new Date().toISOString(),
  endsAt: "",
  usageLimit: "",
  perCustomerLimit: "",
  posEnabled: true,
  shopEnabled: true,
  description: "",
  isActive: true,
});

const toFormValues = (promotion: Promotion): PromotionFormValues => ({
  name: promotion.name,
  couponCode: promotion.couponCode,
  type: promotion.type,
  value: promotion.value,
  maxDiscountAmount: promotion.maxDiscountAmount,
  appliesTo: promotion.appliesTo,
  productIds: promotion.productIds,
  categoryIds: promotion.categoryIds,
  brandIds: promotion.brandIds,
  minOrderAmount: promotion.minOrderAmount,
  minQuantity: promotion.minQuantity,
  buyQuantity: promotion.buyQuantity,
  getQuantity: promotion.getQuantity,
  startsAt: promotion.startsAt,
  endsAt: promotion.endsAt ?? "",
  usageLimit: promotion.usageLimit ?? "",
  perCustomerLimit: promotion.perCustomerLimit ?? "",
  posEnabled: promotion.channels.pos,
  shopEnabled: promotion.channels.shop,
  description: promotion.description,
  isActive: promotion.isActive,
});

const toPayload = (values: PromotionFormValues): PromotionPayload => ({
  name: values.name,
  couponCode: values.couponCode,
  type: values.type,
  value: Number(values.value || 0),
  maxDiscountAmount: Number(values.maxDiscountAmount || 0),
  appliesTo: values.appliesTo,
  productIds: values.appliesTo === "PRODUCTS" ? values.productIds : [],
  categoryIds: values.appliesTo === "CATEGORIES" ? values.categoryIds : [],
  brandIds: values.appliesTo === "BRANDS" ? values.brandIds : [],
  minOrderAmount: Number(values.minOrderAmount || 0),
  minQuantity: Number(values.minQuantity || 0),
  buyQuantity: Number(values.buyQuantity || 0),
  getQuantity: Number(values.getQuantity || 0),
  startsAt: values.startsAt,
  endsAt: values.endsAt || null,
  usageLimit: values.usageLimit === "" ? null : Number(values.usageLimit),
  perCustomerLimit: values.perCustomerLimit === "" ? null : Number(values.perCustomerLimit),
  channels: { pos: values.posEnabled, shop: values.shopEnabled },
  description: values.description,
  isActive: values.isActive,
});

export function PromotionFormModal({
  open,
  onOpenChange,
  promotion,
}: PromotionFormModalProps) {
  const isEdit = Boolean(promotion);

  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] = useUpdatePromotionMutation();
  const isSaving = isCreating || isUpdating;

  const { data: products = [] } = useGetProductOptionsQuery();
  const { data: categories = [] } = useGetProductCategoryOptionsQuery();
  const { data: brands = [] } = useGetBrandOptionsQuery();

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(PromotionSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(promotion ? toFormValues(promotion) : emptyValues());
  }, [open, promotion, form]);

  const type = useWatch({ control: form.control, name: "type" });
  const appliesTo = useWatch({ control: form.control, name: "appliesTo" });

  const productChoices = React.useMemo<MultiSelectOption[]>(
    () => products.map((product) => ({ label: product.name, value: product._id, hint: product.sku })),
    [products]
  );

  const categoryChoices = React.useMemo<MultiSelectOption[]>(
    () => categories.map((category) => ({ label: category.name, value: category._id })),
    [categories]
  );

  const brandChoices = React.useMemo<MultiSelectOption[]>(
    () => brands.map((brand) => ({ label: brand.name, value: brand._id })),
    [brands]
  );

  const onSubmit = async (values: PromotionFormValues) => {
    try {
      const body = toPayload(values);

      if (promotion) {
        await updatePromotion({ id: promotion._id, body }).unwrap();
        toast.success("Promotion updated");
      } else {
        await createPromotion(body).unwrap();
        toast.success("Promotion created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the promotion");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit promotion" : "New promotion"}</DialogTitle>
          <DialogDescription>
            A time-boxed offer, applied automatically or unlocked with a coupon code.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Promotion name"
                  placeholder="Eid weekend sale"
                />
                <FormInput
                  control={form.control}
                  name="couponCode"
                  label="Coupon code"
                  placeholder="Leave blank to apply automatically"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="type"
                  label="Offer"
                  options={TYPE_OPTIONS}
                />
                {type === "BUY_X_GET_Y" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      control={form.control}
                      name="buyQuantity"
                      label="Buy"
                      type="number"
                    />
                    <FormInput
                      control={form.control}
                      name="getQuantity"
                      label="Get free"
                      type="number"
                    />
                  </div>
                ) : type === "FREE_SHIPPING" ? (
                  <FormInput
                    control={form.control}
                    name="minOrderAmount"
                    label="Minimum order"
                    type="number"
                    step="0.01"
                  />
                ) : (
                  <FormInput
                    control={form.control}
                    name="value"
                    label={type === "PERCENTAGE" ? "Percent off" : "Amount off"}
                    type="number"
                    step="0.01"
                  />
                )}
              </div>

              {type === "PERCENTAGE" && (
                <FormInput
                  control={form.control}
                  name="maxDiscountAmount"
                  label="Cap the discount at"
                  type="number"
                  step="0.01"
                  description="Leave at zero for no cap."
                />
              )}

              <FormSelect
                control={form.control}
                name="appliesTo"
                label="Covers"
                options={SCOPE_OPTIONS}
              />

              {appliesTo === "PRODUCTS" && (
                <FormMultiSelect
                  control={form.control}
                  name="productIds"
                  label="Products"
                  placeholder="Pick the products on offer"
                  options={productChoices}
                />
              )}

              {appliesTo === "CATEGORIES" && (
                <FormMultiSelect
                  control={form.control}
                  name="categoryIds"
                  label="Categories"
                  placeholder="Pick the categories on offer"
                  options={categoryChoices}
                />
              )}

              {appliesTo === "BRANDS" && (
                <FormMultiSelect
                  control={form.control}
                  name="brandIds"
                  label="Brands"
                  placeholder="Pick the brands on offer"
                  options={brandChoices}
                />
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <FormDate control={form.control} name="startsAt" label="Starts" />
                <FormDate control={form.control} name="endsAt" label="Ends" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="minOrderAmount"
                  label="Minimum order value"
                  type="number"
                  step="0.01"
                />
                <FormInput
                  control={form.control}
                  name="minQuantity"
                  label="Minimum quantity"
                  type="number"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="usageLimit"
                  label="Total redemptions"
                  type="number"
                  description="Leave blank for unlimited."
                />
                <FormInput
                  control={form.control}
                  name="perCustomerLimit"
                  label="Per customer"
                  type="number"
                  description="Leave blank for unlimited."
                />
              </div>

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
                  description="Offered on your public shop."
                />
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="The terms customers should know (optional)"
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Pause a promotion to stop it without losing its setup."
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
                {isEdit ? "Save changes" : "Create promotion"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
