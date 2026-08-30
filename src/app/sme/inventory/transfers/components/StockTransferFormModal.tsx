import {
  QuantityItems,
  emptyQuantityLine,
  quantityLineError,
  type QuantityLine,
} from "@/components/shared/quantity-items";
import { FormDate, FormInput, FormSelect, FormTextarea } from "@/components/shared/form-fields";
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
  useCreateStockTransferMutation,
  useUpdateStockTransferMutation,
} from "@/redux/apis/stockTransferApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { StockTransfer, StockTransferPayload } from "@/types/domain/stockTransfer";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const TransferSchema = z
  .object({
    fromWarehouseId: z.string().min(1, "Pick where the stock leaves from"),
    toWarehouseId: z.string().min(1, "Pick where the stock is going"),
    transferDate: z.string().min(1, "A transfer needs a date"),
    expectedDate: z.string(),
    reference: z.string().trim().max(80),
    notes: z.string().trim().max(2000),
  })
  .refine((values) => values.fromWarehouseId !== values.toWarehouseId, {
    message: "Pick two different warehouses",
    path: ["toWarehouseId"],
  });

type TransferFormValues = z.infer<typeof TransferSchema>;

interface StockTransferFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer?: StockTransfer | null;
}

const emptyValues = (): TransferFormValues => ({
  fromWarehouseId: "",
  toWarehouseId: "",
  transferDate: new Date().toISOString(),
  expectedDate: "",
  reference: "",
  notes: "",
});

export function StockTransferFormModal({
  open,
  onOpenChange,
  transfer,
}: StockTransferFormModalProps) {
  const isEdit = Boolean(transfer);

  const [createTransfer, { isLoading: isCreating }] = useCreateStockTransferMutation();
  const [updateTransfer, { isLoading: isUpdating }] = useUpdateStockTransferMutation();
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

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(TransferSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;

    setLinesError(null);

    if (transfer) {
      form.reset({
        fromWarehouseId: transfer.fromWarehouseId,
        toWarehouseId: transfer.toWarehouseId,
        transferDate: transfer.transferDate,
        expectedDate: transfer.expectedDate ?? "",
        reference: transfer.reference,
        notes: transfer.notes,
      });
      setLines(
        transfer.items.length > 0
          ? transfer.items.map((item) => ({
              key: item._id,
              productId: item.productId,
              quantity: String(item.quantity),
              direction: "IN" as const,
              note: item.note,
            }))
          : [emptyQuantityLine()]
      );
      return;
    }

    form.reset(emptyValues());
    setLines([emptyQuantityLine()]);
  }, [open, transfer, form]);

  const onSubmit = async (values: TransferFormValues) => {
    const problem = quantityLineError(lines);
    setLinesError(problem);
    if (problem) return;

    const body: StockTransferPayload = {
      fromWarehouseId: values.fromWarehouseId,
      toWarehouseId: values.toWarehouseId,
      transferDate: values.transferDate,
      expectedDate: values.expectedDate || null,
      reference: values.reference,
      notes: values.notes,
      items: lines
        .filter((line) => line.productId)
        .map((line) => ({
          productId: line.productId,
          quantity: Number(line.quantity),
          note: line.note,
        })),
    };

    try {
      if (transfer) {
        await updateTransfer({ id: transfer._id, body }).unwrap();
        toast.success("Transfer updated");
      } else {
        await createTransfer(body).unwrap();
        toast.success("Transfer created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the transfer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit transfer" : "New stock transfer"}</DialogTitle>
          <DialogDescription>
            Stock leaves the source warehouse when you dispatch, and lands in the destination when
            you receive.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="fromWarehouseId"
                  label="From warehouse"
                  placeholder="Where stock leaves"
                  options={warehouseChoices}
                  description={
                    warehouseChoices.length === 0
                      ? "No warehouses yet. Create one under Inventory · Warehouses."
                      : undefined
                  }
                />
                <FormSelect
                  control={form.control}
                  name="toWarehouseId"
                  label="To warehouse"
                  placeholder="Where stock arrives"
                  options={warehouseChoices}
                />
                <FormDate
                  control={form.control}
                  name="transferDate"
                  label="Transfer date"
                  dateOnly
                />
                <FormDate
                  control={form.control}
                  name="expectedDate"
                  label="Expected arrival"
                  dateOnly
                />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Delivery note or gate pass number"
                  className="sm:col-span-2"
                />
              </div>

              <QuantityItems
                lines={lines}
                onLinesChange={setLines}
                products={stockedProducts}
                error={linesError}
                hint="Only stocked products can move between warehouses."
              />

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Anything the receiving team should know"
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
                {isEdit ? "Save changes" : "Create transfer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
