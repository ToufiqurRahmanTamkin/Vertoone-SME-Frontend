import { DocumentItems } from "@/components/shared/document-items";
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
import {
  emptyCharges,
  emptyLine,
  lineError,
  toItemPayload,
  type DocumentCharges,
  type DocumentLine,
} from "@/lib/trade";
import { useCreateDebitNoteMutation, useUpdateDebitNoteMutation } from "@/redux/apis/debitNoteApis";
import { useGetProductPricingOptionsQuery } from "@/redux/apis/productApis";
import { useGetPurchaseReturnsQuery } from "@/redux/apis/purchaseReturnApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DEBIT_NOTE_REASONS,
  DEBIT_NOTE_REASON_LABELS,
  type DebitNote,
  type DebitNotePayload,
  type DebitNoteReason,
} from "@/types/domain/debitNote";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const DebitNoteSchema = z.object({
  supplierId: z.string().min(1, "Pick who you are claiming from"),
  purchaseReturnId: z.string(),
  reason: z.enum(DEBIT_NOTE_REASONS),
  noteDate: z.string().min(1, "A debit note needs a date"),
  reference: z.string().trim().max(80),
  notes: z.string().trim().max(2000),
});

type DebitNoteFormValues = z.infer<typeof DebitNoteSchema>;

interface DebitNoteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: DebitNote | null;
  presetSupplierId?: string | null;
  presetPurchaseReturnId?: string | null;
}

const emptyValues = (): DebitNoteFormValues => ({
  supplierId: "",
  purchaseReturnId: "",
  reason: "RETURNED_GOODS",
  noteDate: new Date().toISOString(),
  reference: "",
  notes: "",
});

export function DebitNoteFormModal({
  open,
  onOpenChange,
  note,
  presetSupplierId,
  presetPurchaseReturnId,
}: DebitNoteFormModalProps) {
  const isEdit = Boolean(note);

  const [createNote, { isLoading: isCreating }] = useCreateDebitNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateDebitNoteMutation();
  const isSaving = isCreating || isUpdating;

  const { data: supplierOptions = [] } = useGetSupplierOptionsQuery();
  const { data: products = [] } = useGetProductPricingOptionsQuery();

  const [lines, setLines] = React.useState<DocumentLine[]>([emptyLine()]);
  const [charges, setCharges] = React.useState<DocumentCharges>(emptyCharges());
  const [linesError, setLinesError] = React.useState<string | null>(null);

  const form = useForm<DebitNoteFormValues>({
    resolver: zodResolver(DebitNoteSchema),
    defaultValues: emptyValues(),
  });

  const supplierId = form.watch("supplierId");
  const purchaseReturnId = form.watch("purchaseReturnId");
  const fromReturn = Boolean(purchaseReturnId) && !isEdit;

  const { data: returnResult } = useGetPurchaseReturnsQuery(
    { supplierId, status: "CONFIRMED", limit: 100 },
    { skip: !supplierId || isEdit }
  );

  const returns = (returnResult?.data ?? []).filter(
    (entry) => !entry.debitNoteId || entry._id === presetPurchaseReturnId
  );

  React.useEffect(() => {
    if (!open) return;

    setLinesError(null);

    if (note) {
      form.reset({
        supplierId: note.supplierId,
        purchaseReturnId: note.purchaseReturnId ?? "",
        reason: note.reason,
        noteDate: note.noteDate,
        reference: note.reference,
        notes: note.notes,
      });
      setLines(
        note.items.length > 0
          ? note.items.map((item) => ({
              key: item._id,
              productId: item.productId,
              quantity: String(item.quantity),
              unitPrice: String(item.unitPrice),
              discount: item.discount ? String(item.discount) : "",
              taxRate: item.taxRate ? String(item.taxRate) : "",
            }))
          : [emptyLine()]
      );
      setCharges({
        discountAmount: note.discountAmount ? String(note.discountAmount) : "",
        shippingCost: note.shippingCost ? String(note.shippingCost) : "",
        roundOff: note.roundOff ? String(note.roundOff) : "",
      });
      return;
    }

    form.reset({
      ...emptyValues(),
      supplierId: presetSupplierId ?? "",
      purchaseReturnId: presetPurchaseReturnId ?? "",
    });
    setLines([emptyLine()]);
    setCharges(emptyCharges());
  }, [open, note, presetSupplierId, presetPurchaseReturnId, form]);

  const onSubmit = async (values: DebitNoteFormValues, issue: boolean) => {
    const useReturn = Boolean(values.purchaseReturnId) && !isEdit;

    if (!useReturn) {
      const problem = lineError(lines);
      setLinesError(problem);
      if (problem) return;
    } else {
      setLinesError(null);
    }

    const body: DebitNotePayload = {
      supplierId: values.supplierId,
      reason: values.reason as DebitNoteReason,
      noteDate: values.noteDate,
      reference: values.reference,
      notes: values.notes,
      issue,
      ...(useReturn
        ? { purchaseReturnId: values.purchaseReturnId }
        : {
            items: toItemPayload(lines),
            discountAmount: Number(charges.discountAmount) || 0,
            shippingCost: Number(charges.shippingCost) || 0,
            roundOff: Number(charges.roundOff) || 0,
          }),
    };

    try {
      if (note) {
        await updateNote({ id: note._id, body }).unwrap();
        toast.success("Debit note updated");
      } else {
        await createNote(body).unwrap();
        toast.success(issue ? "Debit note issued" : "Draft debit note saved");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the debit note");
    }
  };

  const linesLocked = Boolean(note?.purchaseReturnId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit debit note" : "New debit note"}</DialogTitle>
          <DialogDescription>
            What you are claiming back from a supplier. Set it against their bills so you pay the
            right amount.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit((values) => onSubmit(values, true))}
          >
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="supplierId"
                  label="Supplier"
                  placeholder="Who owes you this"
                  disabled={isEdit}
                  options={supplierOptions.map((supplier) => ({
                    label: `${supplier.name} (${supplier.code})`,
                    value: supplier._id,
                  }))}
                />
                <FormSelect
                  control={form.control}
                  name="reason"
                  label="Why"
                  options={DEBIT_NOTE_REASONS.map((reason) => ({
                    label: DEBIT_NOTE_REASON_LABELS[reason],
                    value: reason,
                  }))}
                />
                {!isEdit && (
                  <FormSelect
                    control={form.control}
                    name="purchaseReturnId"
                    label="From a purchase return"
                    placeholder="Claim a confirmed return back"
                    clearable
                    clearLabel="Enter the lines by hand"
                    options={returns.map((entry) => ({
                      label: `${entry.returnNumber} · ${entry.totalQuantity} units`,
                      value: entry._id,
                    }))}
                    description="The return's lines and values are copied across."
                    className="sm:col-span-2"
                  />
                )}
                <FormDate control={form.control} name="noteDate" label="Note date" dateOnly />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Their credit note or claim reference"
                />
              </div>

              {fromReturn ? (
                <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                  The lines come straight from the purchase return you picked.
                </p>
              ) : (
                <DocumentItems
                  lines={lines}
                  onLinesChange={setLines}
                  products={products}
                  priceField="purchasePrice"
                  charges={charges}
                  onChargesChange={setCharges}
                  error={linesError}
                  lockProducts={linesLocked}
                  emptyHint="What you are charging back, at the price you were billed."
                />
              )}

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="What went wrong and what you agreed with the supplier"
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
              {!isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={form.handleSubmit((values) => onSubmit(values, false))}
                >
                  Save as draft
                </Button>
              )}
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Issue to supplier"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
