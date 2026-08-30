import { FormDate, FormInput, FormSelect, FormTextarea } from "@/components/shared/form-fields";
import {
  QuantityItems,
  emptyQuantityLine,
  quantityLineError,
  type QuantityLine,
} from "@/components/shared/quantity-items";
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
import { useGetProductPricingOptionsQuery } from "@/redux/apis/productApis";
import {
  useCreateStockAdjustmentMutation,
  useUpdateStockAdjustmentMutation,
} from "@/redux/apis/stockAdjustmentApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  STOCK_ADJUSTMENT_REASONS,
  STOCK_ADJUSTMENT_REASON_LABELS,
  type StockAdjustment,
  type StockAdjustmentPayload,
  type StockAdjustmentReason,
} from "@/types/domain/stockAdjustment";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const AdjustmentSchema = z.object({
  warehouseId: z.string().min(1, "Pick the warehouse being corrected"),
  adjustmentDate: z.string().min(1, "An adjustment needs a date"),
  reason: z.enum(STOCK_ADJUSTMENT_REASONS),
  reference: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
});

type AdjustmentFormValues = z.infer<typeof AdjustmentSchema>;

interface StockAdjustmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adjustment?: StockAdjustment | null;
}

const REASON_OPTIONS = STOCK_ADJUSTMENT_REASONS.map((reason) => ({
  label: STOCK_ADJUSTMENT_REASON_LABELS[reason],
  value: reason,
}));

const emptyValues = (): AdjustmentFormValues => ({
  warehouseId: "",
  adjustmentDate: new Date().toISOString(),
  reason: "STOCK_COUNT" as StockAdjustmentReason,
  reference: "",
  notes: "",
});

export function StockAdjustmentFormModal({
  open,
  onOpenChange,
  adjustment,
}: StockAdjustmentFormModalProps) {
  const isEdit = Boolean(adjustment);

  const [createAdjustment, { isLoading: isCreating }] = useCreateStockAdjustmentMutation();
  const [updateAdjustment, { isLoading: isUpdating }] = useUpdateStockAdjustmentMutation();
  const isSaving = isCreating || isUpdating;

  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();
  const { data: products = [] } = useGetProductPricingOptionsQuery();

  const stockedProducts = React.useMemo(
    () => products.filter((product) => product.type === "STOCKED"),
    [products]
  );

  const warehouseChoices = React.useMemo(
    () =>
      warehouseOptions.map((warehouse) => ({
        label: `${warehouse.name} (${warehouse.code})`,
        value: warehouse._id,
      })),
    [warehouseOptions]
  );

  const [lines, setLines] = React.useState<QuantityLine[]>([emptyQuantityLine()]);
  const [linesError, setLinesError] = React.useState<string | null>(null);

  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(AdjustmentSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;

    setLinesError(null);

    if (adjustment) {
      form.reset({
        warehouseId: adjustment.warehouseId,
        adjustmentDate: adjustment.adjustmentDate,
        reason: adjustment.reason,
        reference: adjustment.reference,
        notes: adjustment.notes,
      });
      setLines(
        adjustment.items.length > 0
          ? adjustment.items.map((item) => ({
              key: item._id,
              productId: item.productId,
              quantity: String(item.quantity),
              direction: item.direction,
              note: item.note,
            }))
          : [emptyQuantityLine()]
      );
      return;
    }

    form.reset(emptyValues());
    setLines([emptyQuantityLine()]);
  }, [open, adjustment, form]);

  const onSubmit = async (values: AdjustmentFormValues) => {
    const problem = quantityLineError(lines);
    setLinesError(problem);
    if (problem) return;

    const body: StockAdjustmentPayload = {
      warehouseId: values.warehouseId,
      adjustmentDate: values.adjustmentDate,
      reason: values.reason,
      reference: values.reference,
      notes: values.notes,
      items: lines
        .filter((line) => line.productId)
        .map((line) => ({
          productId: line.productId,
          direction: line.direction,
          quantity: Number(line.quantity),
          note: line.note,
        })),
    };

    try {
      if (adjustment) {
        await updateAdjustment({ id: adjustment._id, body }).unwrap();
        toast.success("Adjustment updated");
      } else {
        await createAdjustment(body).unwrap();
        toast.success("Adjustment created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the adjustment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit adjustment" : "New stock adjustment"}</DialogTitle>
          <DialogDescription>
            Correct what the system thinks you hold. Stock only moves once the adjustment is
            approved.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="warehouseId"
                  label="Warehouse"
                  placeholder="Where the count happened"
                  options={warehouseChoices}
                  description={
                    warehouseChoices.length === 0
                      ? "No warehouses yet. Create one under Inventory · Warehouses."
                      : undefined
                  }
                />
                <FormSelect
                  control={form.control}
                  name="reason"
                  label="Reason"
                  options={REASON_OPTIONS}
                />
                <FormDate
                  control={form.control}
                  name="adjustmentDate"
                  label="Adjustment date"
                  dateOnly
                />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Count sheet or incident number"
                />
              </div>

              <QuantityItems
                lines={lines}
                onLinesChange={setLines}
                products={stockedProducts}
                showDirection
                error={linesError}
                hint="Stock in adds units, stock out removes them."
              />

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="What happened, and who signed it off"
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
                {isEdit ? "Save changes" : "Create adjustment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
