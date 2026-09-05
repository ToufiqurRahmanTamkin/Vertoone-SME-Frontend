import {
  EstimateItems,
  emptyEstimateLine,
  estimateLineError,
  type EstimateLine,
} from "@/components/shared/estimate-items";
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
import { toNumber } from "@/lib/trade";
import { useGetDepartmentOptionsQuery } from "@/redux/apis/departmentApis";
import { useGetProductPricingOptionsQuery } from "@/redux/apis/productApis";
import {
  useCreatePurchaseRequisitionMutation,
  useUpdatePurchaseRequisitionMutation,
} from "@/redux/apis/purchaseRequisitionApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PURCHASE_REQUISITION_PRIORITIES,
  PURCHASE_REQUISITION_PRIORITY_LABELS,
  type PurchaseRequisition,
  type PurchaseRequisitionPayload,
  type PurchaseRequisitionPriority,
} from "@/types/domain/purchaseRequisition";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const RequisitionSchema = z.object({
  title: z.string().trim().min(2, "Give this requisition a title").max(120),
  warehouseId: z.string().min(1, "Pick where the stock should land"),
  departmentId: z.string(),
  suggestedSupplierId: z.string(),
  priority: z.enum(PURCHASE_REQUISITION_PRIORITIES),
  requisitionDate: z.string().min(1, "A requisition needs a date"),
  requiredBy: z.string(),
  reference: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
});

type RequisitionFormValues = z.infer<typeof RequisitionSchema>;

interface RequisitionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition?: PurchaseRequisition | null;
}

const emptyValues = (): RequisitionFormValues => ({
  title: "",
  warehouseId: "",
  departmentId: "",
  suggestedSupplierId: "",
  priority: "NORMAL",
  requisitionDate: new Date().toISOString(),
  requiredBy: "",
  reference: "",
  notes: "",
});

export function RequisitionFormModal({
  open,
  onOpenChange,
  requisition,
}: RequisitionFormModalProps) {
  const isEdit = Boolean(requisition);

  const [createRequisition, { isLoading: isCreating }] = useCreatePurchaseRequisitionMutation();
  const [updateRequisition, { isLoading: isUpdating }] = useUpdatePurchaseRequisitionMutation();
  const isSaving = isCreating || isUpdating;

  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();
  const { data: departmentOptions = [] } = useGetDepartmentOptionsQuery();
  const { data: supplierOptions = [] } = useGetSupplierOptionsQuery();
  const { data: products = [] } = useGetProductPricingOptionsQuery();

  const [lines, setLines] = React.useState<EstimateLine[]>([emptyEstimateLine()]);
  const [linesError, setLinesError] = React.useState<string | null>(null);

  const form = useForm<RequisitionFormValues>({
    resolver: zodResolver(RequisitionSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;

    setLinesError(null);

    if (requisition) {
      form.reset({
        title: requisition.title,
        warehouseId: requisition.warehouseId,
        departmentId: requisition.departmentId ?? "",
        suggestedSupplierId: requisition.suggestedSupplierId ?? "",
        priority: requisition.priority,
        requisitionDate: requisition.requisitionDate,
        requiredBy: requisition.requiredBy ?? "",
        reference: requisition.reference,
        notes: requisition.notes,
      });
      setLines(
        requisition.items.length > 0
          ? requisition.items.map((item) => ({
              key: item._id,
              productId: item.productId,
              quantity: String(item.quantity),
              unitPrice: item.estimatedUnitPrice ? String(item.estimatedUnitPrice) : "",
              note: item.note,
            }))
          : [emptyEstimateLine()]
      );
      return;
    }

    form.reset(emptyValues());
    setLines([emptyEstimateLine()]);
  }, [open, requisition, form]);

  const onSubmit = async (values: RequisitionFormValues) => {
    const problem = estimateLineError(lines);
    setLinesError(problem);
    if (problem) return;

    const body: PurchaseRequisitionPayload = {
      title: values.title,
      warehouseId: values.warehouseId,
      departmentId: values.departmentId || null,
      suggestedSupplierId: values.suggestedSupplierId || null,
      priority: values.priority as PurchaseRequisitionPriority,
      requisitionDate: values.requisitionDate,
      requiredBy: values.requiredBy || null,
      items: lines
        .filter((line) => line.productId)
        .map((line) => ({
          productId: line.productId,
          quantity: toNumber(line.quantity),
          estimatedUnitPrice: toNumber(line.unitPrice),
          note: line.note,
        })),
      reference: values.reference,
      notes: values.notes,
    };

    try {
      if (requisition) {
        await updateRequisition({ id: requisition._id, body }).unwrap();
        toast.success("Requisition updated");
      } else {
        await createRequisition(body).unwrap();
        toast.success("Requisition created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the requisition");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit requisition" : "New purchase requisition"}</DialogTitle>
          <DialogDescription>
            What someone in the business needs bought. Nothing is ordered until it is approved and
            turned into a purchase order.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="title"
                  label="Title"
                  placeholder="Packaging for the December run"
                  className="sm:col-span-2"
                />
                <FormSelect
                  control={form.control}
                  name="warehouseId"
                  label="Deliver into"
                  placeholder="Where the stock should land"
                  options={warehouseOptions.map((warehouse) => ({
                    label: `${warehouse.name} (${warehouse.code})`,
                    value: warehouse._id,
                  }))}
                  description={
                    warehouseOptions.length === 0
                      ? "No warehouses yet. Create one under Inventory · Warehouses."
                      : undefined
                  }
                />
                <FormSelect
                  control={form.control}
                  name="departmentId"
                  label="Raised for"
                  placeholder="Which department needs this"
                  clearable
                  clearLabel="No department"
                  options={departmentOptions.map((department) => ({
                    label: department.name,
                    value: department._id,
                  }))}
                />
                <FormSelect
                  control={form.control}
                  name="priority"
                  label="Priority"
                  options={PURCHASE_REQUISITION_PRIORITIES.map((priority) => ({
                    label: PURCHASE_REQUISITION_PRIORITY_LABELS[priority],
                    value: priority,
                  }))}
                />
                <FormSelect
                  control={form.control}
                  name="suggestedSupplierId"
                  label="Suggested supplier"
                  placeholder="Who you would normally buy this from"
                  clearable
                  clearLabel="No preference"
                  options={supplierOptions.map((supplier) => ({
                    label: `${supplier.name} (${supplier.code})`,
                    value: supplier._id,
                  }))}
                />
                <FormDate
                  control={form.control}
                  name="requisitionDate"
                  label="Raised on"
                  dateOnly
                />
                <FormDate control={form.control} name="requiredBy" label="Needed by" dateOnly />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Project or job this belongs to"
                  className="sm:col-span-2"
                />
              </div>

              <EstimateItems
                lines={lines}
                onLinesChange={setLines}
                products={products}
                error={linesError}
                hint="Prices are only an estimate. The real price is agreed on the order."
              />

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Anything the approver should know"
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
                {isEdit ? "Save changes" : "Create requisition"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
