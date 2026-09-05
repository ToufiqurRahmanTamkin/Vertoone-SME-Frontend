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
import { useGetProductOptionsQuery } from "@/redux/apis/productApis";
import {
  useCreateReorderRuleMutation,
  useUpdateReorderRuleMutation,
} from "@/redux/apis/reorderRuleApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  REORDER_STRATEGIES,
  REORDER_STRATEGY_LABELS,
  type ReorderRule,
  type ReorderRulePayload,
} from "@/types/domain/reorderRule";
import { ReorderRuleSchema, type ReorderRuleFormValues } from "@/validations/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface ReorderRuleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: ReorderRule | null;
}

const STRATEGY_OPTIONS = REORDER_STRATEGIES.map((strategy) => ({
  label: REORDER_STRATEGY_LABELS[strategy],
  value: strategy,
}));

const emptyValues = (): ReorderRuleFormValues => ({
  productId: "",
  warehouseId: "",
  minimumQuantity: 0,
  reorderQuantity: "",
  maximumQuantity: "",
  strategy: "FIXED_QUANTITY",
  preferredSupplierId: "",
  leadTimeDays: "",
  note: "",
  isActive: true,
});

const toFormValues = (rule: ReorderRule): ReorderRuleFormValues => ({
  productId: rule.productId,
  warehouseId: rule.warehouseId ?? "",
  minimumQuantity: rule.minimumQuantity,
  reorderQuantity: rule.reorderQuantity,
  maximumQuantity: rule.maximumQuantity,
  strategy: rule.strategy,
  preferredSupplierId: rule.preferredSupplierId ?? "",
  leadTimeDays: rule.leadTimeDays,
  note: rule.note,
  isActive: rule.isActive,
});

export function ReorderRuleFormModal({
  open,
  onOpenChange,
  rule,
}: ReorderRuleFormModalProps) {
  const isEdit = Boolean(rule);

  const [createRule, { isLoading: isCreating }] = useCreateReorderRuleMutation();
  const [updateRule, { isLoading: isUpdating }] = useUpdateReorderRuleMutation();
  const isSaving = isCreating || isUpdating;

  const { data: products = [] } = useGetProductOptionsQuery();
  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();
  const { data: suppliers = [] } = useGetSupplierOptionsQuery();

  const form = useForm<ReorderRuleFormValues>({
    resolver: zodResolver(ReorderRuleSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(rule ? toFormValues(rule) : emptyValues());
  }, [open, rule, form]);

  const strategy = useWatch({ control: form.control, name: "strategy" });

  const productChoices = React.useMemo(
    () =>
      products.map((product) => ({
        label: `${product.name} (${product.sku})`,
        value: product._id,
      })),
    [products]
  );

  const warehouseChoices = React.useMemo(
    () => [
      { label: "Every warehouse", value: "" },
      ...warehouses.map((warehouse) => ({ label: warehouse.name, value: warehouse._id })),
    ],
    [warehouses]
  );

  const supplierChoices = React.useMemo(
    () => [
      { label: "No preference", value: "" },
      ...suppliers.map((supplier) => ({ label: supplier.name, value: supplier._id })),
    ],
    [suppliers]
  );

  const onSubmit = async (values: ReorderRuleFormValues) => {
    try {
      const body: ReorderRulePayload = {
        productId: values.productId,
        warehouseId: values.warehouseId || null,
        minimumQuantity: values.minimumQuantity,
        reorderQuantity: Number(values.reorderQuantity || 0),
        maximumQuantity: Number(values.maximumQuantity || 0),
        strategy: values.strategy,
        preferredSupplierId: values.preferredSupplierId || null,
        leadTimeDays: Number(values.leadTimeDays || 0),
        note: values.note,
        isActive: values.isActive,
      };

      if (rule) {
        const { productId: _productId, ...rest } = body;
        await updateRule({ id: rule._id, body: rest }).unwrap();
        toast.success("Reorder rule updated");
      } else {
        await createRule(body).unwrap();
        toast.success("Reorder rule created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the reorder rule");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit reorder rule" : "New reorder rule"}</DialogTitle>
          <DialogDescription>
            The level a product must not fall below, and how much to buy when it does.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <FormSelect
                control={form.control}
                name="productId"
                label="Product"
                placeholder="Pick a product"
                options={productChoices}
                disabled={isEdit}
              />

              <FormSelect
                control={form.control}
                name="warehouseId"
                label="Applies at"
                placeholder="Every warehouse"
                options={warehouseChoices}
                description="Leave on every warehouse to watch the total on hand."
              />

              <FormSelect
                control={form.control}
                name="strategy"
                label="When it runs low"
                options={STRATEGY_OPTIONS}
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <FormInput
                  control={form.control}
                  name="minimumQuantity"
                  label="Minimum"
                  type="number"
                />
                <FormInput
                  control={form.control}
                  name="reorderQuantity"
                  label="Order quantity"
                  type="number"
                  disabled={strategy === "TOP_UP_TO_MAXIMUM"}
                />
                <FormInput
                  control={form.control}
                  name="maximumQuantity"
                  label="Maximum"
                  type="number"
                  disabled={strategy === "FIXED_QUANTITY"}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="preferredSupplierId"
                  label="Buy from"
                  placeholder="No preference"
                  options={supplierChoices}
                />
                <FormInput
                  control={form.control}
                  name="leadTimeDays"
                  label="Lead time (days)"
                  type="number"
                />
              </div>

              <FormTextarea
                control={form.control}
                name="note"
                label="Note"
                placeholder="Anything the buyer should know (optional)"
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive rules stop suggesting purchases."
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
                {isEdit ? "Save changes" : "Create rule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
