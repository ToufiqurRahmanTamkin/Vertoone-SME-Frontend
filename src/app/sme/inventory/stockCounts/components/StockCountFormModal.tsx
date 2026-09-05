import {
  FormDate,
  FormInput,
  FormSelect,
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
import { Input } from "@/components/ui/input";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { useGetProductCategoryOptionsQuery } from "@/redux/apis/productCategoryApis";
import {
  useCreateStockCountMutation,
  useUpdateStockCountMutation,
} from "@/redux/apis/stockCountApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  STOCK_COUNT_SCOPES,
  STOCK_COUNT_SCOPE_LABELS,
  type StockCount,
} from "@/types/domain/stockCount";
import { StockCountSchema, type StockCountFormValues } from "@/validations/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface StockCountFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count?: StockCount | null;
}

const SCOPE_OPTIONS = STOCK_COUNT_SCOPES.filter((scope) => scope !== "SELECTED").map((scope) => ({
  label: STOCK_COUNT_SCOPE_LABELS[scope],
  value: scope,
}));

const emptyValues = (): StockCountFormValues => ({
  warehouseId: "",
  scope: "FULL",
  categoryId: "",
  countDate: new Date().toISOString(),
  reference: "",
  notes: "",
});

const toFormValues = (count: StockCount): StockCountFormValues => ({
  warehouseId: count.warehouseId,
  scope: count.scope,
  categoryId: count.categoryId ?? "",
  countDate: count.countDate,
  reference: count.reference,
  notes: count.notes,
});

export function StockCountFormModal({
  open,
  onOpenChange,
  count,
}: StockCountFormModalProps) {
  const isEdit = Boolean(count);

  const [createCount, { isLoading: isCreating }] = useCreateStockCountMutation();
  const [updateCount, { isLoading: isUpdating }] = useUpdateStockCountMutation();
  const isSaving = isCreating || isUpdating;

  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();
  const { data: categories = [] } = useGetProductCategoryOptionsQuery();

  const [counted, setCounted] = React.useState<Record<string, string>>({});

  const form = useForm<StockCountFormValues>({
    resolver: zodResolver(StockCountSchema),
    defaultValues: emptyValues(),
  });

  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (count?._id ?? "new") : null;

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setCounted(
      count
        ? Object.fromEntries(
            count.items.map((item) => [item.productId, String(item.countedQuantity)])
          )
        : {}
    );
  }

  React.useEffect(() => {
    if (!open) return;
    form.reset(count ? toFormValues(count) : emptyValues());
  }, [open, count, form]);

  const scope = useWatch({ control: form.control, name: "scope" });

  const warehouseChoices = React.useMemo(
    () => warehouses.map((warehouse) => ({ label: warehouse.name, value: warehouse._id })),
    [warehouses]
  );

  const categoryChoices = React.useMemo(
    () => categories.map((category) => ({ label: category.name, value: category._id })),
    [categories]
  );

  const onSubmit = async (values: StockCountFormValues) => {
    try {
      if (count) {
        await updateCount({
          id: count._id,
          body: {
            warehouseId: values.warehouseId,
            scope: values.scope,
            categoryId: values.scope === "CATEGORY" ? values.categoryId || null : null,
            countDate: values.countDate,
            reference: values.reference,
            notes: values.notes,
            items: count.items.map((item) => ({
              productId: item.productId,
              countedQuantity: Number(counted[item.productId] ?? item.countedQuantity),
              note: item.note,
            })),
          },
        }).unwrap();
        toast.success("Stock count updated");
      } else {
        await createCount({
          warehouseId: values.warehouseId,
          scope: values.scope,
          categoryId: values.scope === "CATEGORY" ? values.categoryId || null : null,
          countDate: values.countDate,
          reference: values.reference,
          notes: values.notes,
        }).unwrap();
        toast.success("Stock count started with every product in scope");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the stock count");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Count ${count?.countNumber}` : "New stock count"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Type in what you actually counted. Closing the count posts the difference to stock."
              : "Pick a warehouse and we will list everything in scope at its current figure."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="warehouseId"
                  label="Warehouse"
                  placeholder="Pick a warehouse"
                  options={warehouseChoices}
                />
                <FormDate control={form.control} name="countDate" label="Count date" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="scope"
                  label="Covers"
                  options={SCOPE_OPTIONS}
                  disabled={isEdit}
                />
                {scope === "CATEGORY" && (
                  <FormSelect
                    control={form.control}
                    name="categoryId"
                    label="Category"
                    placeholder="Pick a category"
                    options={categoryChoices}
                    disabled={isEdit}
                  />
                )}
              </div>

              <FormInput
                control={form.control}
                name="reference"
                label="Reference"
                placeholder="Your own reference (optional)"
              />

              {isEdit && count && count.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Counted figures</p>
                  <div className="max-h-80 overflow-auto rounded-lg border">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead className="sticky top-0 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Product</th>
                          <th className="w-24 px-2 py-2 text-right font-medium">System</th>
                          <th className="w-28 px-2 py-2 text-right font-medium">Counted</th>
                          <th className="w-24 px-2 py-2 text-right font-medium">Variance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {count.items.map((item) => {
                          const value = counted[item.productId] ?? String(item.countedQuantity);
                          const variance = Number(value || 0) - item.systemQuantity;

                          return (
                            <tr key={item._id}>
                              <td className="px-3 py-2">
                                <p className="truncate font-medium">{item.name}</p>
                                <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                                  {item.sku}
                                </p>
                              </td>
                              <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                                {formatNumber(item.systemQuantity)}
                              </td>
                              <td className="px-2 py-2">
                                <Input
                                  type="number"
                                  className="h-8 text-right"
                                  value={value}
                                  onChange={(event) =>
                                    setCounted((previous) => ({
                                      ...previous,
                                      [item.productId]: event.target.value,
                                    }))
                                  }
                                />
                              </td>
                              <td
                                className={
                                  variance === 0
                                    ? "px-2 py-2 text-right tabular-nums text-muted-foreground"
                                    : variance > 0
                                      ? "px-2 py-2 text-right font-medium tabular-nums text-emerald-600 dark:text-emerald-400"
                                      : "px-2 py-2 text-right font-medium tabular-nums text-red-600 dark:text-red-400"
                                }
                              >
                                {variance > 0 ? "+" : ""}
                                {formatNumber(variance)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Variance value so far {formatAmountValue(count.varianceValue)}.
                  </p>
                </div>
              )}

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Who counted, and anything unusual (optional)"
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
                {isEdit ? "Save figures" : "Start count"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
