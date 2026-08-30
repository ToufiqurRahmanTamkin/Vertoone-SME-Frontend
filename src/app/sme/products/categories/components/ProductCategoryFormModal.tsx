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
import {
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
} from "@/redux/apis/productCategoryApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DEFAULT_PRODUCT_CATEGORY_COLOR,
  type ProductCategory,
  type ProductCategoryPayload,
} from "@/types/domain/productCategory";
import {
  ProductCategorySchema,
  type ProductCategoryFormValues,
} from "@/validations/productCategory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ProductCategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ProductCategory | null;
}

const emptyValues = (): ProductCategoryFormValues => ({
  name: "",
  code: "",
  color: DEFAULT_PRODUCT_CATEGORY_COLOR,
  description: "",
  isActive: true,
});

const toFormValues = (category: ProductCategory): ProductCategoryFormValues => ({
  name: category.name,
  code: category.code,
  color: category.color,
  description: category.description,
  isActive: category.isActive,
});

const toPayload = (values: ProductCategoryFormValues): ProductCategoryPayload => ({
  name: values.name,
  code: values.code,
  color: values.color,
  description: values.description,
  isActive: values.isActive,
});

export function ProductCategoryFormModal({
  open,
  onOpenChange,
  category,
}: ProductCategoryFormModalProps) {
  const isEdit = Boolean(category);

  const [createCategory, { isLoading: isCreating }] = useCreateProductCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateProductCategoryMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<ProductCategoryFormValues>({
    resolver: zodResolver(ProductCategorySchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(category ? toFormValues(category) : emptyValues());
  }, [open, category, form]);

  const onSubmit = async (values: ProductCategoryFormValues) => {
    try {
      const body = toPayload(values);

      if (category) {
        await updateCategory({ id: category._id, body }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory(body).unwrap();
        toast.success("Category created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the category");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            The top level split of your catalogue. Sub categories sit under these.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormInput
                control={form.control}
                name="name"
                label="Category name"
                placeholder="Electronics"
              />
              <FormInput
                control={form.control}
                name="code"
                label="Code"
                placeholder="ELEC (optional)"
              />
              <FormColor control={form.control} name="color" label="Colour" />
              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What belongs in this category (optional)"
              />
              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive categories stay on existing products but are not offered on new ones."
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
                {isEdit ? "Save changes" : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
