import { FileUploader } from "@/components/shared/file-uploader";
import { FormColor, FormInput, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
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
import { useCreateBrandMutation, useUpdateBrandMutation } from "@/redux/apis/brandApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { DEFAULT_BRAND_COLOR, type Brand, type BrandPayload } from "@/types/domain/brand";
import { BrandSchema, type BrandFormValues } from "@/validations/brand";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface BrandFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
}

const emptyValues = (): BrandFormValues => ({
  name: "",
  color: DEFAULT_BRAND_COLOR,
  description: "",
  website: "",
  logoUrl: null,
  logoPublicId: null,
  isActive: true,
});

const toFormValues = (brand: Brand): BrandFormValues => ({
  name: brand.name,
  color: brand.color,
  description: brand.description,
  website: brand.website,
  logoUrl: brand.logoUrl,
  logoPublicId: brand.logoPublicId,
  isActive: brand.isActive,
});

const toPayload = (values: BrandFormValues): BrandPayload => ({
  name: values.name,
  color: values.color,
  description: values.description,
  website: values.website,
  logoUrl: values.logoUrl,
  logoPublicId: values.logoPublicId,
  isActive: values.isActive,
});

export function BrandFormModal({ open, onOpenChange, brand }: BrandFormModalProps) {
  const isEdit = Boolean(brand);

  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(BrandSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(brand ? toFormValues(brand) : emptyValues());
  }, [open, brand, form]);

  const logoUrl = useWatch({ control: form.control, name: "logoUrl" });
  const logoPublicId = useWatch({ control: form.control, name: "logoPublicId" });

  const onSubmit = async (values: BrandFormValues) => {
    try {
      const body = toPayload(values);

      if (brand) {
        await updateBrand({ id: brand._id, body }).unwrap();
        toast.success("Brand updated");
      } else {
        await createBrand(body).unwrap();
        toast.success("Brand created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the brand");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit brand" : "New brand"}</DialogTitle>
          <DialogDescription>
            Manufacturers and labels you stock. Every product can carry one.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormInput
                control={form.control}
                name="name"
                label="Brand name"
                placeholder="Walton"
              />

              <FileUploader
                value={logoUrl ?? undefined}
                publicId={logoPublicId ?? undefined}
                folder="brands"
                label="Logo"
                description="Shown next to the brand in lists and on receipts."
                onChange={(asset) => {
                  form.setValue("logoUrl", asset?.url ?? null, { shouldDirty: true });
                  form.setValue("logoPublicId", asset?.publicId ?? null, { shouldDirty: true });
                }}
              />

              <FormColor control={form.control} name="color" label="Colour" />

              <FormInput
                control={form.control}
                name="website"
                label="Website"
                placeholder="https://brand.com"
              />

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What this brand covers (optional)"
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive brands stay on existing products but are not offered on new ones."
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
                {isEdit ? "Save changes" : "Create brand"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
