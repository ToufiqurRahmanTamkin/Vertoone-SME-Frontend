import { FormInput, FormSelect, FormTextarea } from "@/components/shared/form-fields";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { useUpdateShopSettingsMutation } from "@/redux/apis/shopApis";
import type { ShopSettings, ShopSettingsPayload } from "@/types/domain/shop";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Phone, Store, Truck } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ShopSchema = z.object({
  name: z.string().trim().min(1, "Your shop needs a name").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "A shop link needs at least 3 characters")
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  tagline: z.string().trim().max(160),
  description: z.string().trim().max(2000),
  warehouseId: z.string().min(1, "Pick the warehouse online orders ship from"),
  contactEmail: z.union([z.literal(""), z.string().trim().email("A valid email is required")]),
  contactPhone: z.string().trim().max(30),
  address: z.string().trim().max(300),
  currency: z.string().trim().length(3, "Use a 3-letter currency code"),
  deliveryCharge: z.string().trim(),
  minimumOrderValue: z.string().trim(),
  orderInstructions: z.string().trim().max(1000),
});

type ShopFormValues = z.infer<typeof ShopSchema>;

interface ShopSettingsFormProps {
  shop: ShopSettings;
  canEdit: boolean;
}

const toNumeric = (value: string): number => {
  const parsed = Number(value);
  return isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export function ShopSettingsForm({ shop, canEdit }: ShopSettingsFormProps) {
  const [updateShop, { isLoading }] = useUpdateShopSettingsMutation();
  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();

  const warehouseChoices = React.useMemo(
    () =>
      warehouseOptions.map((warehouse) => ({
        label: `${warehouse.name} (${warehouse.code})`,
        value: warehouse._id,
      })),
    [warehouseOptions]
  );

  const form = useForm<ShopFormValues>({
    resolver: zodResolver(ShopSchema),
    defaultValues: {
      name: shop.name,
      slug: shop.slug,
      tagline: shop.tagline,
      description: shop.description,
      warehouseId: shop.warehouseId ?? "",
      contactEmail: shop.contactEmail,
      contactPhone: shop.contactPhone,
      address: shop.address,
      currency: shop.currency,
      deliveryCharge: shop.deliveryCharge ? String(shop.deliveryCharge) : "",
      minimumOrderValue: shop.minimumOrderValue ? String(shop.minimumOrderValue) : "",
      orderInstructions: shop.orderInstructions,
    },
  });

  const onSubmit = async (values: ShopFormValues) => {
    const body: ShopSettingsPayload = {
      name: values.name,
      slug: values.slug,
      tagline: values.tagline,
      description: values.description,
      warehouseId: values.warehouseId,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone,
      address: values.address,
      currency: values.currency.toUpperCase(),
      deliveryCharge: toNumeric(values.deliveryCharge),
      minimumOrderValue: toNumeric(values.minimumOrderValue),
      orderInstructions: values.orderInstructions,
    };

    try {
      await updateShop(body).unwrap();
      toast.success("Shop settings saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the shop settings");
    }
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <SectionCard
          icon={Store}
          title="Storefront"
          description="How your shop introduces itself to customers."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              control={form.control}
              name="name"
              label="Shop name"
              placeholder="What customers see at the top"
              disabled={!canEdit}
            />
            <FormInput
              control={form.control}
              name="slug"
              label="Shop link"
              placeholder="my-shop"
              description="This becomes the web address people visit."
              disabled={!canEdit}
            />
            <FormInput
              control={form.control}
              name="tagline"
              label="Tagline"
              placeholder="One line about what you sell"
              className="sm:col-span-2"
              disabled={!canEdit}
            />
            <FormTextarea
              control={form.control}
              name="description"
              label="About the shop"
              placeholder="Delivery areas, opening hours, anything worth knowing"
              className="sm:col-span-2"
              disabled={!canEdit}
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={Truck}
          title="Orders"
          description="Where online orders are fulfilled from, and the rules they follow."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect
              control={form.control}
              name="warehouseId"
              label="Fulfil orders from"
              placeholder="Pick a warehouse"
              options={warehouseChoices}
              description="Online stock availability is read from this warehouse."
              disabled={!canEdit}
            />
            <FormInput
              control={form.control}
              name="currency"
              label="Currency"
              placeholder="BDT"
              disabled={!canEdit}
            />
            <FormInput
              control={form.control}
              name="deliveryCharge"
              label="Delivery charge"
              placeholder="0"
              description="Added to every online order."
              disabled={!canEdit}
            />
            <FormInput
              control={form.control}
              name="minimumOrderValue"
              label="Minimum order"
              placeholder="0"
              description="Leave blank for no minimum."
              disabled={!canEdit}
            />
            <FormTextarea
              control={form.control}
              name="orderInstructions"
              label="Payment instructions"
              placeholder="Shown on the confirmation page. Orders are cash on delivery."
              className="sm:col-span-2"
              disabled={!canEdit}
            />
          </div>
        </SectionCard>

        <SectionCard icon={Phone} title="Contact" description="How customers reach you about an order.">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              control={form.control}
              name="contactEmail"
              label="Email"
              placeholder="orders@example.com"
              disabled={!canEdit}
            />
            <FormInput
              control={form.control}
              name="contactPhone"
              label="Phone"
              placeholder="Contact number"
              disabled={!canEdit}
            />
            <FormTextarea
              control={form.control}
              name="address"
              label="Address"
              placeholder="Where you trade from"
              className="sm:col-span-2"
              disabled={!canEdit}
            />
          </div>
        </SectionCard>

        {canEdit && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save shop settings
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
