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
  INVOICE_STATUS_DESCRIPTIONS,
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  toOptions,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useCreateInvoiceMutation,
  useGetFinanceCategoriesQuery,
  useGetLinkableEntriesQuery,
  useUpdateInvoiceMutation,
} from "@/redux/apis/financeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { categoryRefId } from "@/types/domain/finance";
import {
  invoiceEntryId,
  type Invoice,
  type InvoicePayload,
  type InvoiceStatus,
  type InvoiceType,
  type LinkableEntry,
} from "@/types/domain/invoice";
import { InvoiceSchema, type InvoiceFormValues } from "@/validations/finance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface InvoiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
  defaultCurrency?: string;
}

const TYPE_OPTIONS = toOptions(INVOICE_TYPE_LABELS);
const STATUS_OPTIONS = toOptions(INVOICE_STATUS_LABELS);
const PAYMENT_METHOD_OPTIONS = toOptions(PAYMENT_METHOD_LABELS);

const toDateInput = (value: Date): string => {
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const emptyValues = (currency: string): InvoiceFormValues => ({
  type: "INCOME",
  entryMode: "GENERATE",
  entryId: "",
  categoryId: "",
  status: "UNPAID",
  title: "",
  party: "",
  amount: 0,
  currency,
  paymentMethod: "CASH",
  issueDate: toDateInput(new Date()),
  dueDate: "",
  reference: "",
  notes: "",
});

const toFormValues = (invoice: Invoice): InvoiceFormValues => ({
  type: invoice.type,
  entryMode: invoiceEntryId(invoice) ? "LINK" : "NONE",
  entryId: invoiceEntryId(invoice) ?? "",
  categoryId: invoice.categoryId ? categoryRefId(invoice.categoryId) : "",
  status: invoice.status,
  title: invoice.title,
  party: invoice.party,
  amount: invoice.amount,
  currency: invoice.currency,
  paymentMethod: invoice.paymentMethod,
  issueDate: invoice.issueDate?.slice(0, 10) ?? "",
  dueDate: invoice.dueDate?.slice(0, 10) ?? "",
  reference: invoice.reference ?? "",
  notes: invoice.notes ?? "",
});

const entryOptionLabel = (entry: LinkableEntry): string =>
  `${entry.title} · ${formatAmount(entry.amount, entry.currency)} · ${formatDate(entry.date)}`;

export function InvoiceFormModal({
  open,
  onOpenChange,
  invoice,
  defaultCurrency = "BDT",
}: InvoiceFormModalProps) {
  const isEdit = Boolean(invoice);

  const [createInvoice, createState] = useCreateInvoiceMutation();
  const [updateInvoice, updateState] = useUpdateInvoiceMutation();
  const isSaving = createState.isLoading || updateState.isLoading;

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: emptyValues(defaultCurrency),
  });

  const type = useWatch({ control: form.control, name: "type" }) as InvoiceType;
  const entryMode = useWatch({ control: form.control, name: "entryMode" });
  const status = useWatch({ control: form.control, name: "status" }) as InvoiceStatus;
  const isLinking = entryMode === "LINK";

  const { data: linkable = [], isFetching: isLoadingEntries } = useGetLinkableEntriesQuery(
    { type, invoiceId: invoice?._id },
    { skip: !open }
  );

  const { data: categoryData } = useGetFinanceCategoriesQuery(
    { limit: 100, type, isActive: true as never },
    { skip: !open }
  );

  React.useEffect(() => {
    if (!open) return;
    form.reset(invoice ? toFormValues(invoice) : emptyValues(defaultCurrency));
  }, [open, invoice, defaultCurrency, form]);

  const entryOptions = React.useMemo(
    () => linkable.map((entry) => ({ value: entry._id, label: entryOptionLabel(entry) })),
    [linkable]
  );

  const categoryOptions = React.useMemo(
    () =>
      (categoryData?.data ?? []).map((category) => ({
        value: category._id,
        label: category.name,
      })),
    [categoryData]
  );

  const onEntryChange = (nextId: string) => {
    const entry = linkable.find((candidate) => candidate._id === nextId);
    if (!entry) return;
    form.setValue("title", entry.title, { shouldValidate: true });
    form.setValue("party", entry.party);
    form.setValue("amount", entry.amount);
    form.setValue("currency", entry.currency);
    form.setValue("paymentMethod", entry.paymentMethod);
    form.setValue("categoryId", entry.categoryId, { shouldValidate: true });
    form.setValue("issueDate", entry.date.slice(0, 10));
    form.setValue("status", entry.status, { shouldValidate: true });
    if (!form.getValues("reference")) {
      form.setValue("reference", entry.reference);
    }
  };

  const onModeChange = (mode: string) => {
    if (mode !== "LINK") {
      form.setValue("entryId", "");
    }
  };

  const onTypeChange = () => {
    form.setValue("entryId", "");
    form.setValue("categoryId", "");
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    const linked = values.entryMode === "LINK";
    const generating = values.entryMode === "GENERATE";

    const body: InvoicePayload = {
      type: values.type,
      entryId: linked ? values.entryId : null,
      generateEntry: generating,
      categoryId: values.categoryId || undefined,
      status: values.status,
      title: values.title,
      party: values.party,
      amount: values.amount,
      currency: values.currency.toUpperCase(),
      paymentMethod: values.paymentMethod,
      issueDate: values.issueDate,
      dueDate: values.dueDate || null,
      reference: values.reference,
      notes: values.notes,
    };

    try {
      if (invoice) {
        const { type: _type, generateEntry, ...rest } = body;
        void _type;
        await updateInvoice({
          id: invoice._id,
          body: { ...rest, ...(invoiceEntryId(invoice) ? {} : { generateEntry }) },
        }).unwrap();
        toast.success("Invoice updated");
      } else {
        await createInvoice(body).unwrap();
        toast.success(
          linked
            ? "Invoice created and linked"
            : generating
              ? "Invoice and its entry created"
              : "Invoice created"
        );
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the invoice");
    }
  };

  const entryNoun = type === "INCOME" ? "income" : "expense";

  const modeOptions = [
    { value: "GENERATE", label: `Generate a new ${entryNoun} entry from this invoice` },
    { value: "LINK", label: `Bill an existing ${entryNoun} entry` },
    { value: "NONE", label: `Raise it on its own and attach an ${entryNoun} entry later` },
  ];

  const hasNoCategories = categoryOptions.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit invoice" : "New invoice"}</DialogTitle>
          <DialogDescription>
            Every invoice sits against one {entryNoun} entry. Pick an entry you already recorded, or
            let the invoice create one for you. Whatever you change here flows through to that
            entry.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="type"
                  label="Kind"
                  options={TYPE_OPTIONS}
                  disabled={isEdit}
                  onValueChange={onTypeChange}
                  description={
                    isEdit
                      ? "An invoice keeps the side of the books it was raised on."
                      : "Receivable bills an income entry, payable an expense entry."
                  }
                />
                <FormSelect
                  control={form.control}
                  name="status"
                  label="Status"
                  options={STATUS_OPTIONS}
                  description={INVOICE_STATUS_DESCRIPTIONS[status]}
                />
              </div>

              <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
                <FormSelect
                  control={form.control}
                  name="entryMode"
                  label="Ledger entry"
                  options={modeOptions}
                  onValueChange={onModeChange}
                  disabled={isEdit && Boolean(invoiceEntryId(invoice as Invoice))}
                  description={
                    isEdit && invoiceEntryId(invoice as Invoice)
                      ? "This invoice already bills an entry. Change the link from the entry list if you need to."
                      : `Marking this invoice paid marks its ${entryNoun} entry paid too.`
                  }
                />

                {isLinking ? (
                  <FormSelect
                    control={form.control}
                    name="entryId"
                    label={`Existing ${entryNoun} entry`}
                    placeholder={
                      isLoadingEntries ? "Loading entries..." : `Pick an unbilled ${entryNoun} entry`
                    }
                    options={entryOptions}
                    onValueChange={onEntryChange}
                    searchable
                    description={
                      entryOptions.length === 0 && !isLoadingEntries
                        ? `Every ${entryNoun} entry already carries an invoice.`
                        : "Only entries without an invoice are listed."
                    }
                  />
                ) : (
                  <FormSelect
                    control={form.control}
                    name="categoryId"
                    label="Category for the generated entry"
                    placeholder={
                      hasNoCategories ? `No active ${entryNoun} categories` : "Select a category"
                    }
                    options={categoryOptions}
                    searchable
                    description={`The ${entryNoun} entry this invoice creates is filed under this category.`}
                  />
                )}
              </div>

              <FormInput
                control={form.control}
                name="title"
                label="Title"
                placeholder="What this invoice is for"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput control={form.control} name="amount" label="Amount" type="number" />
                <FormInput control={form.control} name="currency" label="Currency" />
                <FormDate control={form.control} name="issueDate" label="Issue date" dateOnly />
                <FormDate control={form.control} name="dueDate" label="Due date" dateOnly />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="party"
                  label={type === "INCOME" ? "Billed to" : "Billed from"}
                  placeholder={type === "INCOME" ? "Who owes this" : "Who invoiced you"}
                />
                <FormSelect
                  control={form.control}
                  name="paymentMethod"
                  label="Method"
                  options={PAYMENT_METHOD_OPTIONS}
                />
              </div>

              <FormInput
                control={form.control}
                name="reference"
                label="Reference"
                placeholder="Voucher or transaction no."
              />

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Payment terms, delivery details, anything worth recording."
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
                {isEdit ? "Save changes" : "Create invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
