import {
  FormDate,
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
  useCreateBatchMutation,
  useUpdateBatchMutation,
} from "@/redux/apis/inventoryBatchApis";
import { useGetProductPricingOptionsQuery } from "@/redux/apis/productApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { InventoryBatch, InventoryBatchPayload } from "@/types/domain/inventoryBatch";
import { InventoryBatchSchema, type InventoryBatchFormValues } from "@/validations/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface BatchFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch?: InventoryBatch | null;
}

const emptyValues = (): InventoryBatchFormValues => ({
  productId: "",
  warehouseId: "",
  supplierId: "",
  batchNumber: "",
  lotNumber: "",
  quantity: 0,
  unitCost: "",
  manufacturedAt: "",
  expiresAt: "",
  note: "",
  isActive: true,
});

const toFormValues = (batch: InventoryBatch): InventoryBatchFormValues => ({
  productId: batch.productId,
  warehouseId: batch.warehouseId,
  supplierId: batch.supplierId ?? "",
  batchNumber: batch.batchNumber,
  lotNumber: batch.lotNumber,
  quantity: batch.quantity,
  unitCost: batch.unitCost,
  manufacturedAt: batch.manufacturedAt ?? "",
  expiresAt: batch.expiresAt ?? "",
  note: batch.note,
  isActive: batch.isActive,
});

export function BatchFormModal({ open, onOpenChange, batch }: BatchFormModalProps) {
  const isEdit = Boolean(batch);

  const [createBatch, { isLoading: isCreating }] = useCreateBatchMutation();
  const [updateBatch, { isLoading: isUpdating }] = useUpdateBatchMutation();
  const isSaving = isCreating || isUpdating;

  const { data: products = [] } = useGetProductPricingOptionsQuery();
  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();
  const { data: suppliers = [] } = useGetSupplierOptionsQuery();

  const form = useForm<InventoryBatchFormValues>({
    resolver: zodResolver(InventoryBatchSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(batch ? toFormValues(batch) : emptyValues());
  }, [open, batch, form]);

  const productChoices = React.useMemo(
    () =>
      products.map((product) => ({
        label: `${product.name} (${product.sku})`,
        value: product._id,
      })),
    [products]
  );

  const warehouseChoices = React.useMemo(
    () => warehouses.map((warehouse) => ({ label: warehouse.name, value: warehouse._id })),
    [warehouses]
  );

  const supplierChoices = React.useMemo(
    () => [
      { label: "No supplier", value: "" },
      ...suppliers.map((supplier) => ({ label: supplier.name, value: supplier._id })),
    ],
    [suppliers]
  );

  const onSubmit = async (values: InventoryBatchFormValues) => {
    try {
      const body: InventoryBatchPayload = {
        productId: values.productId,
        warehouseId: values.warehouseId,
        supplierId: values.supplierId || null,
        batchNumber: values.batchNumber,
        lotNumber: values.lotNumber,
        quantity: values.quantity,
        unitCost: Number(values.unitCost || 0),
        manufacturedAt: values.manufacturedAt || null,
        expiresAt: values.expiresAt || null,
        note: values.note,
        isActive: values.isActive,
      };

      if (batch) {
        const { productId: _productId, ...rest } = body;
        await updateBatch({ id: batch._id, body: rest }).unwrap();
        toast.success("Batch updated");
      } else {
        await createBatch(body).unwrap();
        toast.success("Batch recorded");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the batch");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit batch" : "New batch"}</DialogTitle>
          <DialogDescription>
            A tracked run of stock with its own number, cost and expiry date.
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

              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="batchNumber"
                  label="Batch number"
                  placeholder="B-2026-04"
                />
                <FormInput
                  control={form.control}
                  name="lotNumber"
                  label="Lot number"
                  placeholder="Supplier's own reference"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="warehouseId"
                  label="Held at"
                  placeholder="Pick a warehouse"
                  options={warehouseChoices}
                />
                <FormSelect
                  control={form.control}
                  name="supplierId"
                  label="Supplier"
                  placeholder="No supplier"
                  options={supplierChoices}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="quantity"
                  label="Quantity"
                  type="number"
                  step="0.001"
                />
                <FormInput
                  control={form.control}
                  name="unitCost"
                  label="Unit cost"
                  type="number"
                  step="0.01"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormDate control={form.control} name="manufacturedAt" label="Made on" />
                <FormDate control={form.control} name="expiresAt" label="Expires" />
              </div>

              <FormTextarea
                control={form.control}
                name="note"
                label="Note"
                placeholder="Anything worth remembering about this batch (optional)"
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive batches stop being offered when picking stock."
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
                {isEdit ? "Save changes" : "Record batch"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
