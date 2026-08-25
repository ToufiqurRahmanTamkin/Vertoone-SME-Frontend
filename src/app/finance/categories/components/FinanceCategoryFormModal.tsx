import { FormInput, FormSelect, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
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
import { FINANCE_CATEGORY_TYPE_LABELS, toOptions } from "@/constant";
import {
  useCreateFinanceCategoryMutation,
  useUpdateFinanceCategoryMutation,
} from "@/redux/apis/financeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { FinanceCategory, FinanceCategoryType } from "@/types/domain/finance";
import {
  FinanceCategorySchema,
  type FinanceCategoryFormValues,
} from "@/validations/finance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FinanceCategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: FinanceCategory | null;
  defaultType?: FinanceCategoryType;
}

const TYPE_OPTIONS = toOptions(FINANCE_CATEGORY_TYPE_LABELS);

const emptyValues = (type: FinanceCategoryType): FinanceCategoryFormValues => ({
  name: "",
  type,
  description: "",
  isActive: true,
});

const toFormValues = (category: FinanceCategory): FinanceCategoryFormValues => ({
  name: category.name,
  type: category.type,
  description: category.description ?? "",
  isActive: category.isActive,
});

export function FinanceCategoryFormModal({
  open,
  onOpenChange,
  category,
  defaultType = "INCOME",
}: FinanceCategoryFormModalProps) {
  const isEdit = Boolean(category);
  const [createCategory, { isLoading: isCreating }] = useCreateFinanceCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateFinanceCategoryMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<FinanceCategoryFormValues>({
    resolver: zodResolver(FinanceCategorySchema),
    defaultValues: emptyValues(defaultType),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(category ? toFormValues(category) : emptyValues(defaultType));
  }, [open, category, defaultType, form]);

  const onSubmit = async (values: FinanceCategoryFormValues) => {
    try {
      if (category) {
        await updateCategory({ id: category._id, body: values }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory(values).unwrap();
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
          <DialogTitle>{isEdit ? "Edit category" : "New finance category"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Income and expense entries already filed under this category keep their link."
              : "A category is either income or expense. Entries can only use a matching category."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <FormInput
                control={form.control}
                name="name"
                label="Name"
                placeholder="Office Rent"
              />

              <FormSelect
                control={form.control}
                name="type"
                label="Type"
                options={TYPE_OPTIONS}
                disabled={category?.isSystem}
                description={
                  category?.isSystem
                    ? "This category is managed by the system."
                    : "Changing the type is blocked once entries exist."
                }
              />

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What belongs under this category."
                showCharCount={false}
                rows={3}
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive categories cannot be picked on new entries"
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
