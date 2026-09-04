import {
  FormColor,
  FormInput,
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
  useCreateAssetCategoryMutation,
  useUpdateAssetCategoryMutation,
} from "@/redux/apis/assetApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { AssetCategory } from "@/types/domain/asset";
import { AssetCategorySchema, type AssetCategoryFormValues } from "@/validations/asset";
import { toNumber } from "@/validations/hrmsSettings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AssetCategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: AssetCategory | null;
}

const emptyValues = (): AssetCategoryFormValues => ({
  name: "",
  code: "",
  description: "",
  color: "#0ea5e9",
  usefulLifeMonths: 36,
  isActive: true,
});

export function AssetCategoryFormModal({
  open,
  onOpenChange,
  category,
}: AssetCategoryFormModalProps) {
  const [createCategory, { isLoading: isCreating }] = useCreateAssetCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateAssetCategoryMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<AssetCategoryFormValues>({
    resolver: zodResolver(AssetCategorySchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(
      category
        ? {
            name: category.name,
            code: category.code,
            description: category.description,
            color: category.color,
            usefulLifeMonths: category.usefulLifeMonths,
            isActive: category.isActive,
          }
        : emptyValues()
    );
  }, [open, category, form]);

  const onSubmit = async (values: AssetCategoryFormValues) => {
    const body = {
      name: values.name,
      description: values.description,
      color: values.color,
      usefulLifeMonths: toNumber(values.usefulLifeMonths),
      isActive: values.isActive,
      ...(values.code ? { code: values.code } : {}),
    };

    try {
      if (category) {
        await updateCategory({ id: category._id, body }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory(body).unwrap();
        toast.success("Category added");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the category");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{category ? "Edit category" : "New asset category"}</DialogTitle>
              <DialogDescription>
                How you group assets — laptops, vehicles, furniture and so on.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <FormInput control={form.control} name="name" label="Name" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="code"
                  label="Code"
                  placeholder="Generated from the name"
                />
                <FormInput
                  control={form.control}
                  name="usefulLifeMonths"
                  label="Useful life (months)"
                  type="number"
                />
              </div>
              <FormColor control={form.control} name="color" label="Colour" />
              <FormTextarea control={form.control} name="description" label="Description" />
              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive categories cannot be picked on new assets."
              />
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
                {category ? "Save changes" : "Add category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
