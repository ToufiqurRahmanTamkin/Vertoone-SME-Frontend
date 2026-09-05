import {
  FormChips,
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
  useCreateProductOptionSetMutation,
  useUpdateProductOptionSetMutation,
} from "@/redux/apis/productVariantApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PRODUCT_OPTION_DISPLAY_LABELS,
  PRODUCT_OPTION_DISPLAY_TYPES,
  type ProductOption,
  type ProductOptionPayload,
} from "@/types/domain/productVariant";
import { ProductOptionSchema, type ProductOptionFormValues } from "@/validations/catalog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface OptionSetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  option?: ProductOption | null;
}

const DISPLAY_OPTIONS = PRODUCT_OPTION_DISPLAY_TYPES.map((type) => ({
  label: PRODUCT_OPTION_DISPLAY_LABELS[type],
  value: type,
}));

const emptyValues = (): ProductOptionFormValues => ({
  name: "",
  values: [],
  displayType: "SELECT",
  description: "",
  isActive: true,
});

const toFormValues = (option: ProductOption): ProductOptionFormValues => ({
  name: option.name,
  values: option.values,
  displayType: option.displayType,
  description: option.description,
  isActive: option.isActive,
});

const toPayload = (values: ProductOptionFormValues): ProductOptionPayload => ({
  name: values.name,
  values: values.values,
  displayType: values.displayType,
  description: values.description,
  isActive: values.isActive,
});

export function OptionSetFormModal({ open, onOpenChange, option }: OptionSetFormModalProps) {
  const isEdit = Boolean(option);

  const [createOption, { isLoading: isCreating }] = useCreateProductOptionSetMutation();
  const [updateOption, { isLoading: isUpdating }] = useUpdateProductOptionSetMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<ProductOptionFormValues>({
    resolver: zodResolver(ProductOptionSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(option ? toFormValues(option) : emptyValues());
  }, [open, option, form]);

  const onSubmit = async (values: ProductOptionFormValues) => {
    try {
      const body = toPayload(values);

      if (option) {
        await updateOption({ id: option._id, body }).unwrap();
        toast.success("Option set updated");
      } else {
        await createOption(body).unwrap();
        toast.success("Option set created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the option set");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit option set" : "New option set"}</DialogTitle>
          <DialogDescription>
            An option and the values it can take, such as Size with Small, Medium and Large.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormInput
                control={form.control}
                name="name"
                label="Option name"
                placeholder="Size"
              />

              <FormChips
                control={form.control}
                name="values"
                label="Values"
                placeholder="Type a value and press Enter"
                description="Each value can be picked when building a variant."
                max={40}
              />

              <FormSelect
                control={form.control}
                name="displayType"
                label="Shown as"
                options={DISPLAY_OPTIONS}
              />

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What this option covers (optional)"
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive option sets stay on existing variants but are not offered on new ones."
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
                {isEdit ? "Save changes" : "Create option set"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
