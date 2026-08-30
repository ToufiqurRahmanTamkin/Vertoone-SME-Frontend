import {
  FormColor,
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
import { useGetProductCategoryOptionsQuery } from "@/redux/apis/productCategoryApis";
import {
  useCreateProductSubCategoryMutation,
  useUpdateProductSubCategoryMutation,
} from "@/redux/apis/productSubCategoryApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DEFAULT_PRODUCT_SUB_CATEGORY_COLOR,
  type ProductSubCategory,
  type ProductSubCategoryPayload,
} from "@/types/domain/productSubCategory";
import {
  ProductSubCategorySchema,
  type ProductSubCategoryFormValues,
} from "@/validations/productCategory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ProductSubCategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subCategory?: ProductSubCategory | null;
  defaultCategoryId?: string;
}

const emptyValues = (categoryId = ""): ProductSubCategoryFormValues => ({
  categoryId,
  name: "",
  code: "",
  color: DEFAULT_PRODUCT_SUB_CATEGORY_COLOR,
  description: "",
  isActive: true,
});

const toFormValues = (subCategory: ProductSubCategory): ProductSubCategoryFormValues => ({
  categoryId: subCategory.categoryId,
  name: subCategory.name,
  code: subCategory.code,
  color: subCategory.color,
  description: subCategory.description,
  isActive: subCategory.isActive,
});

const toPayload = (values: ProductSubCategoryFormValues): ProductSubCategoryPayload => ({
  categoryId: values.categoryId,
  name: values.name,
  code: values.code,
  color: values.color,
  description: values.description,
  isActive: values.isActive,
});

export function ProductSubCategoryFormModal({
  open,
  onOpenChange,
  subCategory,
  defaultCategoryId,
}: ProductSubCategoryFormModalProps) {
  const isEdit = Boolean(subCategory);

  const { data: categoryOptions = [] } = useGetProductCategoryOptionsQuery();

  const [createSubCategory, { isLoading: isCreating }] = useCreateProductSubCategoryMutation();
  const [updateSubCategory, { isLoading: isUpdating }] = useUpdateProductSubCategoryMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<ProductSubCategoryFormValues>({
    resolver: zodResolver(ProductSubCategorySchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(
      subCategory ? toFormValues(subCategory) : emptyValues(defaultCategoryId ?? "")
    );
  }, [open, subCategory, defaultCategoryId, form]);

  const categoryChoices = React.useMemo(
    () => categoryOptions.map((category) => ({ label: category.name, value: category._id })),
    [categoryOptions]
  );

  const onSubmit = async (values: ProductSubCategoryFormValues) => {
    try {
      const body = toPayload(values);

      if (subCategory) {
        await updateSubCategory({ id: subCategory._id, body }).unwrap();
        toast.success("Sub category updated");
      } else {
        await createSubCategory(body).unwrap();
        toast.success("Sub category created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the sub category");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit sub category" : "New sub category"}</DialogTitle>
          <DialogDescription>
            Pick the category this sits under, then name the finer split.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormSelect
                control={form.control}
                name="categoryId"
                label="Category"
                placeholder="Pick a category"
                options={categoryChoices}
                description={
                  categoryChoices.length === 0
                    ? "No categories yet. Create one under Products · Categories first."
                    : undefined
                }
              />
              <FormInput
                control={form.control}
                name="name"
                label="Sub category name"
                placeholder="Mobile phones"
              />
              <FormInput
                control={form.control}
                name="code"
                label="Code"
                placeholder="MOB (optional)"
              />
              <FormColor control={form.control} name="color" label="Colour" />
              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What belongs in this sub category (optional)"
              />
              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive sub categories stay on existing products but are not offered on new ones."
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
                {isEdit ? "Save changes" : "Create sub category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
