import {
  EstimateItems,
  emptyEstimateLine,
  estimateLineError,
  type EstimateLine,
} from "@/components/shared/estimate-items";
import {
  FormDate,
  FormInput,
  FormMultiSelect,
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
import { toNumber } from "@/lib/trade";
import { useGetProductPricingOptionsQuery } from "@/redux/apis/productApis";
import { useGetPurchaseRequisitionsQuery } from "@/redux/apis/purchaseRequisitionApis";
import {
  useCreateRequestForQuoteMutation,
  useUpdateRequestForQuoteMutation,
} from "@/redux/apis/requestForQuoteApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type {
  RequestForQuote,
  RequestForQuotePayload,
} from "@/types/domain/requestForQuote";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const RfqSchema = z.object({
  title: z.string().trim().min(2, "Give this request a title").max(120),
  warehouseId: z.string().min(1, "Pick where the stock would land"),
  requisitionId: z.string(),
  issueDate: z.string().min(1, "A request needs a date"),
  responseDeadline: z.string(),
  supplierIds: z.array(z.string()).min(1, "Invite at least one supplier"),
  reference: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
  terms: z.string().trim().max(2000),
});

type RfqFormValues = z.infer<typeof RfqSchema>;

interface RfqFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfq?: RequestForQuote | null;
}

const emptyValues = (): RfqFormValues => ({
  title: "",
  warehouseId: "",
  requisitionId: "",
  issueDate: new Date().toISOString(),
  responseDeadline: "",
  supplierIds: [],
  reference: "",
  notes: "",
  terms: "",
});

export function RfqFormModal({ open, onOpenChange, rfq }: RfqFormModalProps) {
  const isEdit = Boolean(rfq);

  const [createRfq, { isLoading: isCreating }] = useCreateRequestForQuoteMutation();
  const [updateRfq, { isLoading: isUpdating }] = useUpdateRequestForQuoteMutation();
  const isSaving = isCreating || isUpdating;

  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();
  const { data: supplierOptions = [] } = useGetSupplierOptionsQuery();
  const { data: products = [] } = useGetProductPricingOptionsQuery();
  const { data: requisitionResult } = useGetPurchaseRequisitionsQuery({
    status: "APPROVED",
    limit: 100,
  });

  const requisitions = requisitionResult?.data ?? [];

  const [lines, setLines] = React.useState<EstimateLine[]>([emptyEstimateLine()]);
  const [linesError, setLinesError] = React.useState<string | null>(null);

  const form = useForm<RfqFormValues>({
    resolver: zodResolver(RfqSchema),
    defaultValues: emptyValues(),
  });

  const requisitionId = form.watch("requisitionId");
  const fromRequisition = Boolean(requisitionId) && !isEdit;

  React.useEffect(() => {
    if (!open) return;

    setLinesError(null);

    if (rfq) {
      form.reset({
        title: rfq.title,
        warehouseId: rfq.warehouseId,
        requisitionId: rfq.requisitionId ?? "",
        issueDate: rfq.issueDate,
        responseDeadline: rfq.responseDeadline ?? "",
        supplierIds: rfq.suppliers.map((supplier) => supplier.supplierId),
        reference: rfq.reference,
        notes: rfq.notes,
        terms: rfq.terms,
      });
      setLines(
        rfq.items.length > 0
          ? rfq.items.map((item) => ({
              key: item._id,
              productId: item.productId,
              quantity: String(item.quantity),
              unitPrice: item.targetUnitPrice ? String(item.targetUnitPrice) : "",
              note: item.note,
            }))
          : [emptyEstimateLine()]
      );
      return;
    }

    form.reset(emptyValues());
    setLines([emptyEstimateLine()]);
  }, [open, rfq, form]);

  const onSubmit = async (values: RfqFormValues) => {
    const useRequisition = Boolean(values.requisitionId) && !isEdit;

    if (!useRequisition) {
      const problem = estimateLineError(lines);
      setLinesError(problem);
      if (problem) return;
    } else {
      setLinesError(null);
    }

    const body: RequestForQuotePayload = {
      title: values.title,
      warehouseId: values.warehouseId,
      issueDate: values.issueDate,
      responseDeadline: values.responseDeadline || null,
      supplierIds: values.supplierIds,
      reference: values.reference,
      notes: values.notes,
      terms: values.terms,
      ...(useRequisition
        ? { requisitionId: values.requisitionId }
        : {
            items: lines
              .filter((line) => line.productId)
              .map((line) => ({
                productId: line.productId,
                quantity: toNumber(line.quantity),
                targetUnitPrice: toNumber(line.unitPrice),
                note: line.note,
              })),
          }),
    };

    try {
      if (rfq) {
        await updateRfq({ id: rfq._id, body }).unwrap();
        toast.success("Request updated");
      } else {
        await createRfq(body).unwrap();
        toast.success("Request for quote created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the request");
    }
  };

  const linesLocked = Boolean(rfq && rfq.respondedCount > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit request" : "New request for quote"}</DialogTitle>
          <DialogDescription>
            Ask a handful of suppliers what they would charge, then award the one you like and it
            becomes a purchase order.
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
                  placeholder="Q1 packaging supply"
                  className="sm:col-span-2"
                />
                {!isEdit && (
                  <FormSelect
                    control={form.control}
                    name="requisitionId"
                    label="From a requisition"
                    placeholder="Start from an approved requisition"
                    clearable
                    clearLabel="Enter the lines by hand"
                    options={requisitions.map((requisition) => ({
                      label: `${requisition.requisitionNumber} · ${requisition.title}`,
                      value: requisition._id,
                    }))}
                    description="Its lines that are still waiting to be ordered are copied across."
                    className="sm:col-span-2"
                  />
                )}
                <FormSelect
                  control={form.control}
                  name="warehouseId"
                  label="Deliver into"
                  placeholder="Where the stock would land"
                  options={warehouseOptions.map((warehouse) => ({
                    label: `${warehouse.name} (${warehouse.code})`,
                    value: warehouse._id,
                  }))}
                />
                <FormDate control={form.control} name="issueDate" label="Raised on" dateOnly />
                <FormDate
                  control={form.control}
                  name="responseDeadline"
                  label="Replies by"
                  dateOnly
                />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Tender or project reference"
                />
                <FormMultiSelect
                  control={form.control}
                  name="supplierIds"
                  label="Ask these suppliers"
                  placeholder="Pick the suppliers to invite"
                  options={supplierOptions.map((supplier) => ({
                    label: supplier.name,
                    value: supplier._id,
                    hint: supplier.code,
                  }))}
                  className="sm:col-span-2"
                  description={
                    linesLocked
                      ? "A supplier who has already quoted cannot be taken off."
                      : undefined
                  }
                />
              </div>

              {fromRequisition ? (
                <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                  The lines come straight from the requisition you picked.
                </p>
              ) : (
                <EstimateItems
                  lines={lines}
                  onLinesChange={setLines}
                  products={products}
                  disabled={linesLocked}
                  error={linesError}
                  priceLabel="Target price"
                  hint="Target prices are only for comparison. What the suppliers quote is what counts."
                />
              )}

              {linesLocked && (
                <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
                  A supplier has already priced these lines, so they are locked. Close this request
                  and raise a new one if the requirement changed.
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormTextarea
                  control={form.control}
                  name="terms"
                  label="Terms"
                  placeholder="Delivery and payment terms you expect"
                />
                <FormTextarea
                  control={form.control}
                  name="notes"
                  label="Notes"
                  placeholder="Anything internal worth remembering"
                />
              </div>
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
                {isEdit ? "Save changes" : "Create request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
