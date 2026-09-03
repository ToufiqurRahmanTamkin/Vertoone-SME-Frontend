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
  PAYMENT_METHOD_LABELS,
  toOptions,
} from "@/constant";
import { formatAmountValue } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useCreateExpenseMutation,
  useCreateIncomeMutation,
  useGetFinanceCategoriesQuery,
  useGetLinkableInvoicesQuery,
  useUpdateExpenseMutation,
  useUpdateIncomeMutation,
} from "@/redux/apis/financeApis";
import { useGetUserOptionsQuery } from "@/redux/apis/userApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { categoryRefId, type Expense, type Income } from "@/types/domain/finance";
import type { InvoiceStatus, LinkableInvoice } from "@/types/domain/invoice";
import type { UserOption } from "@/types/domain/userOption";
import {
  FinanceEntrySchema,
  type FinanceEntryFormValues,
  type FinanceEntryInvoiceMode,
} from "@/validations/finance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Settings } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FINANCE_ENTRY_COPY, type FinanceEntryKind } from "../finance-entry-copy";
import { FinanceCategoryFormModal } from "../categories/components/FinanceCategoryFormModal";

interface FinanceEntryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: FinanceEntryKind;
  entry?: Income | Expense | null;
  defaultCurrency?: string;
}

const PAYMENT_METHOD_OPTIONS = toOptions(PAYMENT_METHOD_LABELS);
const STATUS_OPTIONS = toOptions(INVOICE_STATUS_LABELS);

const toDateInput = (value: Date): string => {
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const emptyValues = (currency: string): FinanceEntryFormValues => ({
  title: "",
  categoryId: "",
  amount: 0,
  currency,
  date: toDateInput(new Date()),
  status: "PAID",
  paymentMethod: "CASH",
  party: "",
  partyUserId: "",
  reference: "",
  notes: "",
  invoiceMode: "GENERATE",
  invoiceId: "",
});

const toFormValues = (entry: Income | Expense, kind: FinanceEntryKind): FinanceEntryFormValues => ({
  title: entry.title,
  categoryId: categoryRefId(entry.categoryId),
  amount: entry.amount,
  currency: entry.currency,
  date: entry.date?.slice(0, 10) ?? "",
  status: entry.status,
  paymentMethod: entry.paymentMethod,
  party: (kind === "INCOME" ? (entry as Income).receivedFrom : (entry as Expense).paidTo) ?? "",
  partyUserId:
    (kind === "INCOME"
      ? (entry as Income).receivedFromUserId
      : (entry as Expense).paidToUserId) ?? "",
  reference: entry.reference ?? "",
  notes: entry.notes ?? "",
  invoiceMode: "GENERATE",
  invoiceId: entry.invoice?._id ?? "",
});

const invoiceLinkFields = (
  mode: FinanceEntryInvoiceMode,
  invoiceId: string
): { invoiceId?: string; raiseInvoice?: boolean } => {
  if (mode === "LINK") return { invoiceId };
  if (mode === "NONE") return { raiseInvoice: false };
  return {};
};

const partyOptionLabel = (user: UserOption): string =>
  `${user.name} · ${user.email} · ${user.companyName}`;

const invoiceOptionLabel = (invoice: LinkableInvoice): string =>
  `${invoice.invoiceNumber} · ${formatAmountValue(invoice.amount)} · ${
    INVOICE_STATUS_LABELS[invoice.status]
  } · ${formatDate(invoice.issueDate)}`;

export function FinanceEntryFormModal({
  open,
  onOpenChange,
  kind,
  entry,
  defaultCurrency = "BDT",
}: FinanceEntryFormModalProps) {
  const copy = FINANCE_ENTRY_COPY[kind];
  const isEdit = Boolean(entry);
  const isIncome = kind === "INCOME";

  const [categoryFormOpen, setCategoryFormOpen] = React.useState(false);

  const { data: categoryData } = useGetFinanceCategoriesQuery({
    limit: 100,
    type: kind,
    isActive: true as never,
  });

  const [createIncome, createIncomeState] = useCreateIncomeMutation();
  const [updateIncome, updateIncomeState] = useUpdateIncomeMutation();
  const [createExpense, createExpenseState] = useCreateExpenseMutation();
  const [updateExpense, updateExpenseState] = useUpdateExpenseMutation();

  const isSaving = isIncome
    ? createIncomeState.isLoading || updateIncomeState.isLoading
    : createExpenseState.isLoading || updateExpenseState.isLoading;

  const form = useForm<FinanceEntryFormValues>({
    resolver: zodResolver(FinanceEntrySchema),
    defaultValues: emptyValues(defaultCurrency),
  });

  const invoiceMode = useWatch({ control: form.control, name: "invoiceMode" });
  const status = useWatch({ control: form.control, name: "status" }) as InvoiceStatus;
  const entryCurrency = useWatch({ control: form.control, name: "currency" }) || defaultCurrency;
  const isLinking = invoiceMode === "LINK";

  const { data: linkableInvoices = [], isFetching: isLoadingInvoices } =
    useGetLinkableInvoicesQuery({ type: kind }, { skip: !open || isEdit });

  const { data: userOptions = [], isFetching: isLoadingUsers } = useGetUserOptionsQuery(
    { limit: 200 },
    { skip: !open }
  );

  React.useEffect(() => {
    if (!open) return;
    form.reset(entry ? toFormValues(entry, kind) : emptyValues(defaultCurrency));
  }, [open, entry, kind, defaultCurrency, form]);

  const categoryOptions = (categoryData?.data ?? []).map((category) => ({
    value: category._id,
    label: category.name,
  }));

  const invoiceOptions = React.useMemo(
    () =>
      linkableInvoices.map((invoice) => ({
        value: invoice._id,
        label: invoiceOptionLabel(invoice),
      })),
    [linkableInvoices]
  );

  const partyOptions = React.useMemo(
    () => userOptions.map((user) => ({ value: user._id, label: partyOptionLabel(user) })),
    [userOptions]
  );

  const onPartyChange = (nextId: string) => {
    const party = userOptions.find((candidate) => candidate._id === nextId);
    form.setValue("party", party?.name ?? "");
  };

  const onInvoiceChange = (nextId: string) => {
    const invoice = linkableInvoices.find((candidate) => candidate._id === nextId);
    if (!invoice) return;
    form.setValue("status", invoice.status, { shouldValidate: true });
    if (!form.getValues("title")) form.setValue("title", invoice.title);
    if (!form.getValues("amount")) form.setValue("amount", invoice.amount);
    if (!form.getValues("party")) form.setValue("party", invoice.party);
    if (!form.getValues("reference")) form.setValue("reference", invoice.reference);
    form.setValue("currency", invoice.currency);
  };

  const onModeChange = (mode: string) => {
    if (mode !== "LINK") form.setValue("invoiceId", "");
  };

  const onSubmit = async (values: FinanceEntryFormValues) => {
    const shared = {
      title: values.title,
      categoryId: values.categoryId,
      amount: values.amount,
      currency: values.currency.toUpperCase(),
      date: new Date(values.date).toISOString(),
      status: values.status,
      paymentMethod: values.paymentMethod,
      reference: values.reference,
      notes: values.notes,
      ...(entry ? {} : invoiceLinkFields(values.invoiceMode, values.invoiceId)),
    };

    try {
      if (isIncome) {
        const body = {
          ...shared,
          receivedFrom: values.party,
          receivedFromUserId: values.partyUserId || null,
        };
        if (entry) {
          await updateIncome({ id: entry._id, body }).unwrap();
        } else {
          await createIncome(body).unwrap();
        }
      } else {
        const body = {
          ...shared,
          paidTo: values.party,
          paidToUserId: values.partyUserId || null,
        };
        if (entry) {
          await updateExpense({ id: entry._id, body }).unwrap();
        } else {
          await createExpense(body).unwrap();
        }
      }
      toast.success(entry ? copy.updatedToast : copy.createdToast);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || copy.saveErrorToast);
    }
  };

  const hasNoCategories = categoryOptions.length === 0;

  const modeOptions = [
    { value: "GENERATE", label: "Raise a new invoice for it" },
    { value: "LINK", label: "Attach it to an invoice I already raised" },
    { value: "NONE", label: "Leave it unbilled for now" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? copy.editTitle : copy.createTitle}</DialogTitle>
          <DialogDescription>
            {hasNoCategories
              ? `No active ${copy.noun} categories yet. Create one under Finance then Category first.`
              : copy.formDescription}
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
                  placeholder={copy.titlePlaceholder}
                />

                <FormSelect
                  control={form.control}
                  name="categoryId"
                  label={
                    <div className="flex items-center gap-2">
                      <span>Category</span>
                      <Settings
                        className="h-3.5 w-3.5 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          setCategoryFormOpen(true);
                        }}
                      />
                    </div>
                  }
                  placeholder="Select a category"
                  options={categoryOptions}
                  searchable
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormInput
                  control={form.control}
                  name="amount"
                  label={`Amount (${entryCurrency})`}
                  type="number"
                  description={`Recorded in ${entryCurrency}, the currency set under System · Configuration.`}
                />
                <FormDate control={form.control} name="date" label="Date" dateOnly />
                <FormSelect
                  control={form.control}
                  name="paymentMethod"
                  label="Method"
                  options={PAYMENT_METHOD_OPTIONS}
                />
              </div>

              <FormSelect
                control={form.control}
                name="status"
                label="Status"
                options={STATUS_OPTIONS}
                description={`${INVOICE_STATUS_DESCRIPTIONS[status] ?? ""} Its invoice carries the same status.`}
              />

              {!isEdit && (
                <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
                  <FormSelect
                    control={form.control}
                    name="invoiceMode"
                    label="Invoice"
                    options={modeOptions}
                    onValueChange={onModeChange}
                    description={`Every ${copy.noun} entry carries exactly one invoice.`}
                  />

                  {isLinking && (
                    <FormSelect
                      control={form.control}
                      name="invoiceId"
                      label="Existing invoice"
                      placeholder={
                        isLoadingInvoices ? "Loading invoices..." : "Pick an unbilled invoice"
                      }
                      options={invoiceOptions}
                      onValueChange={onInvoiceChange}
                      searchable
                      description={
                        invoiceOptions.length === 0 && !isLoadingInvoices
                          ? "Every invoice on this side of the books already bills an entry."
                          : "Only invoices that do not yet bill an entry are listed. The entry adopts the invoice status."
                      }
                    />
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="partyUserId"
                  label={copy.partyLabel}
                  placeholder={isLoadingUsers ? "Loading users..." : "Pick a user (optional)"}
                  options={partyOptions}
                  onValueChange={onPartyChange}
                  searchable
                  clearable
                  description={copy.partyDescription}
                />
                <FormInput
                  control={form.control}
                  name="reference"
                  label="Reference"
                  placeholder="Voucher or transaction no."
                />
              </div>

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Anything worth recording about this entry."
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
              <Button type="submit" disabled={isSaving || hasNoCategories}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : copy.submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <FinanceCategoryFormModal
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
        defaultType={kind}
      />
    </Dialog>
  );
}
