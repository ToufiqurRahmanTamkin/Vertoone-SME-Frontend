import { FormDate, FormSelect } from "@/components/shared/form-fields";
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
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { useConvertRequisitionToOrderMutation } from "@/redux/apis/purchaseRequisitionApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { PurchaseRequisition } from "@/types/domain/purchaseRequisition";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ConvertSchema = z.object({
  supplierId: z.string().min(1, "Pick who you are buying from"),
  warehouseId: z.string().min(1, "Pick where the stock will land"),
  expectedDate: z.string(),
});

type ConvertFormValues = z.infer<typeof ConvertSchema>;

interface ConvertRequisitionDialogProps {
  requisition: PurchaseRequisition | null;
  onOpenChange: (open: boolean) => void;
}

export function ConvertRequisitionDialog({
  requisition,
  onOpenChange,
}: ConvertRequisitionDialogProps) {
  const [convert, { isLoading }] = useConvertRequisitionToOrderMutation();
  const { data: supplierOptions = [] } = useGetSupplierOptionsQuery();
  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();

  const form = useForm<ConvertFormValues>({
    resolver: zodResolver(ConvertSchema),
    defaultValues: { supplierId: "", warehouseId: "", expectedDate: "" },
  });

  React.useEffect(() => {
    if (!requisition) return;
    form.reset({
      supplierId: requisition.suggestedSupplierId ?? "",
      warehouseId: requisition.warehouseId,
      expectedDate: requisition.requiredBy ?? "",
    });
  }, [requisition, form]);

  const pending = (requisition?.items ?? []).filter((item) => item.pendingQuantity > 0);

  const onSubmit = async (values: ConvertFormValues) => {
    if (!requisition) return;

    try {
      await convert({
        id: requisition._id,
        body: {
          supplierId: values.supplierId,
          warehouseId: values.warehouseId,
          expectedDate: values.expectedDate || null,
        },
      }).unwrap();
      toast.success(`Purchase order raised from ${requisition.requisitionNumber}`);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not raise the purchase order");
    }
  };

  return (
    <Dialog open={Boolean(requisition)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Raise an order from {requisition?.requisitionNumber ?? ""}</DialogTitle>
          <DialogDescription>
            Every line still waiting to be ordered goes onto one purchase order at its estimated
            price. You can change the prices on the order itself.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="supplierId"
                  label="Supplier"
                  placeholder="Who you are buying from"
                  options={supplierOptions.map((supplier) => ({
                    label: `${supplier.name} (${supplier.code})`,
                    value: supplier._id,
                  }))}
                />
                <FormSelect
                  control={form.control}
                  name="warehouseId"
                  label="Receive into"
                  placeholder="Where the stock will land"
                  options={warehouseOptions.map((warehouse) => ({
                    label: `${warehouse.name} (${warehouse.code})`,
                    value: warehouse._id,
                  }))}
                />
                <FormDate
                  control={form.control}
                  name="expectedDate"
                  label="Expected delivery"
                  dateOnly
                  className="sm:col-span-2"
                />
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Product</th>
                      <th className="w-24 px-2 py-2 text-right font-medium">Qty</th>
                      <th className="w-28 px-3 py-2 text-right font-medium">Estimated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((item) => (
                      <tr key={item._id} className="border-t">
                        <td className="px-3 py-2">
                          <p className="truncate font-medium">{item.name}</p>
                          <p className="truncate font-mono text-[10px] uppercase text-muted-foreground">
                            {item.sku}
                          </p>
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {formatNumber(item.pendingQuantity)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatAmountValue(item.pendingQuantity * item.estimatedUnitPrice)}
                        </td>
                      </tr>
                    ))}
                    {pending.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-6 text-center text-sm text-muted-foreground"
                        >
                          Every line here has already been ordered.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || pending.length === 0}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Raise purchase order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
