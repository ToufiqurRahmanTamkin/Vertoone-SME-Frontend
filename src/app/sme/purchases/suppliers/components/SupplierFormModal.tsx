import {
  FormInput,
  FormMultiSelect,
  FormPhone,
  FormSelect,
  FormSwitch,
  FormTextarea,
  type MultiSelectOption,
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
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import { useGetConcernsQuery } from "@/redux/apis/concernApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { useCreateSupplierMutation, useUpdateSupplierMutation } from "@/redux/apis/supplierApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PAYMENT_TERM_LABELS,
  SUPPLIER_PAYMENT_TERMS,
  type Supplier,
  type SupplierPayload,
} from "@/types/domain/supplier";
import { SupplierSchema, type SupplierFormValues } from "@/validations/supplier";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface SupplierFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
}

const STEPS: readonly StepperStep[] = [
  { id: "business", label: "Business" },
  { id: "contact", label: "Contact" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

const STEP_FIELDS: readonly (keyof SupplierFormValues)[][] = [
  ["name", "code", "taxId", "concernId", "tagIds", "notes", "isActive"],
  [
    "contactPerson",
    "email",
    "phone",
    "alternatePhone",
    "website",
    "street",
    "city",
    "state",
    "postalCode",
    "country",
  ],
  [
    "paymentTerms",
    "creditLimit",
    "openingBalance",
    "bankName",
    "branchName",
    "accountName",
    "accountNumber",
    "routingNumber",
  ],
  [],
];

const LAST_STEP = STEPS.length - 1;

const PAYMENT_TERM_OPTIONS = SUPPLIER_PAYMENT_TERMS.map((term) => ({
  label: PAYMENT_TERM_LABELS[term],
  value: term,
}));

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.includes(field as keyof SupplierFormValues)
  );
  return index === -1 ? 0 : index;
};

const emptyValues = (): SupplierFormValues => ({
  name: "",
  code: "",
  contactPerson: "",
  email: "",
  phone: "",
  alternatePhone: "",
  website: "",
  taxId: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  paymentTerms: "CASH",
  creditLimit: "",
  openingBalance: "",
  bankName: "",
  branchName: "",
  accountName: "",
  accountNumber: "",
  routingNumber: "",
  tagIds: [],
  concernId: "",
  notes: "",
  isActive: true,
});

const toFormValues = (supplier: Supplier): SupplierFormValues => ({
  name: supplier.name,
  code: supplier.code,
  contactPerson: supplier.contactPerson,
  email: supplier.email,
  phone: supplier.phone,
  alternatePhone: supplier.alternatePhone,
  website: supplier.website,
  taxId: supplier.taxId,
  street: supplier.address.street,
  city: supplier.address.city,
  state: supplier.address.state,
  postalCode: supplier.address.postalCode,
  country: supplier.address.country,
  paymentTerms: supplier.paymentTerms,
  creditLimit: supplier.creditLimit || "",
  openingBalance: supplier.openingBalance || "",
  bankName: supplier.bankAccount.bankName,
  branchName: supplier.bankAccount.branchName,
  accountName: supplier.bankAccount.accountName,
  accountNumber: supplier.bankAccount.accountNumber,
  routingNumber: supplier.bankAccount.routingNumber,
  tagIds: supplier.tagIds,
  concernId: supplier.concernId ?? "",
  notes: supplier.notes,
  isActive: supplier.isActive,
});

const toPayload = (values: SupplierFormValues): SupplierPayload => ({
  name: values.name,
  code: values.code || undefined,
  contactPerson: values.contactPerson,
  email: values.email,
  phone: values.phone,
  alternatePhone: values.alternatePhone,
  website: values.website,
  taxId: values.taxId,
  address: {
    street: values.street,
    city: values.city,
    state: values.state,
    postalCode: values.postalCode,
    country: values.country,
  },
  paymentTerms: values.paymentTerms,
  creditLimit: values.creditLimit === "" ? 0 : values.creditLimit,
  openingBalance: values.openingBalance === "" ? 0 : values.openingBalance,
  bankAccount: {
    bankName: values.bankName,
    branchName: values.branchName,
    accountName: values.accountName,
    accountNumber: values.accountNumber,
    routingNumber: values.routingNumber,
  },
  tagIds: values.tagIds,
  concernId: values.concernId || null,
  notes: values.notes,
  isActive: values.isActive,
});

export function SupplierFormModal({ open, onOpenChange, supplier }: SupplierFormModalProps) {
  const isEdit = Boolean(supplier);

  const { data: tagOptions = [] } = useGetTagOptionsQuery();
  const { data: concernList } = useGetConcernsQuery({ limit: 100 });

  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(SupplierSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(supplier ? toFormValues(supplier) : emptyValues());
  }, [open, supplier, form]);

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);
  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (supplier?._id ?? "new") : null;

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setStep(0);
    setFurthestStep(seedKey !== null && supplier ? LAST_STEP : 0);
  }

  const tagChoices = React.useMemo<MultiSelectOption[]>(
    () => tagOptions.map((tag) => ({ value: tag._id, label: tag.name, color: tag.color })),
    [tagOptions]
  );

  const concernOptions = React.useMemo(
    () => [
      { value: "", label: "The organization" },
      ...(concernList?.data ?? []).map((concern) => ({
        value: concern._id,
        label: concern.code ? `${concern.name} (${concern.code})` : concern.name,
      })),
    ],
    [concernList]
  );

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const isValid = fields.length === 0 || (await form.trigger(fields, { shouldFocus: true }));
    if (!isValid) return;
    const next = Math.min(step + 1, LAST_STEP);
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      const body = toPayload(values);

      if (supplier) {
        await updateSupplier({ id: supplier._id, body }).unwrap();
        toast.success("Supplier updated");
      } else {
        await createSupplier(body).unwrap();
        toast.success("Supplier created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the supplier");
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstStep = Object.keys(errors)
      .map(stepOf)
      .sort((a, b) => a - b)[0];
    if (firstStep !== undefined) setStep(firstStep);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < LAST_STEP) {
      void goNext();
      return;
    }
    void form.handleSubmit(onSubmit, onInvalid)(event);
  };

  const summary = useWatch({ control: form.control });

  const concernLabel = React.useMemo(
    () => concernOptions.find((option) => option.value === (summary.concernId ?? ""))?.label,
    [concernOptions, summary.concernId]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit supplier" : "New supplier"}</DialogTitle>
          <DialogDescription>
            Who you buy from. Purchase orders, returns and payables are all tied back to a supplier.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleFormSubmit}>
            <DialogBody className="flex flex-col gap-4">
              <Stepper
                steps={STEPS}
                current={step}
                reachable={furthestStep}
                onStepSelect={setStep}
              />

              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="name"
                      label="Supplier name"
                      placeholder="Karim Trading House"
                    />
                    <FormInput
                      control={form.control}
                      name="code"
                      label="Code"
                      placeholder="Left blank, we generate one"
                    />
                    <FormInput
                      control={form.control}
                      name="taxId"
                      label="TIN / BIN"
                      placeholder="Tax identification number"
                    />
                    <FormSelect
                      control={form.control}
                      name="concernId"
                      label="Belongs to"
                      placeholder="The organization"
                      options={concernOptions}
                      searchable
                      description="Leave blank when the supplier serves the whole company."
                    />
                  </div>

                  <FormMultiSelect
                    control={form.control}
                    name="tagIds"
                    label="Tags"
                    placeholder="No tags"
                    options={tagChoices}
                    emptyText="No tags yet. Create them under CRM · Tags."
                  />

                  <FormTextarea
                    control={form.control}
                    name="notes"
                    label="Notes"
                    placeholder="What they supply, agreed terms, anything worth remembering"
                  />

                  <FormSwitch
                    control={form.control}
                    name="isActive"
                    label="Active"
                    description="Inactive suppliers stay on past orders but are not offered on new ones."
                  />
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="contactPerson"
                      label="Contact person"
                      placeholder="Who you deal with"
                    />
                    <FormInput
                      control={form.control}
                      name="email"
                      label="Email"
                      placeholder="sales@supplier.com"
                    />
                    <FormPhone control={form.control} name="phone" label="Phone" />
                    <FormPhone
                      control={form.control}
                      name="alternatePhone"
                      label="Alternate phone"
                    />
                  </div>

                  <FormInput
                    control={form.control}
                    name="website"
                    label="Website"
                    placeholder="https://supplier.com"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="street"
                      label="Street"
                      placeholder="House, road, area"
                      className="sm:col-span-2"
                    />
                    <FormInput
                      control={form.control}
                      name="city"
                      label="City"
                      placeholder="Dhaka"
                    />
                    <FormInput
                      control={form.control}
                      name="state"
                      label="State / Division"
                      placeholder="Dhaka"
                    />
                    <FormInput
                      control={form.control}
                      name="postalCode"
                      label="Postal code"
                      placeholder="1207"
                    />
                    <FormInput
                      control={form.control}
                      name="country"
                      label="Country"
                      placeholder="Bangladesh"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      control={form.control}
                      name="paymentTerms"
                      label="Payment terms"
                      options={PAYMENT_TERM_OPTIONS}
                    />
                    <FormInput
                      control={form.control}
                      name="creditLimit"
                      label="Credit limit"
                      type="number"
                      description="How much you may owe them at once. 0 means no limit set."
                    />
                    <FormInput
                      control={form.control}
                      name="openingBalance"
                      label="Opening balance"
                      type="number"
                      description="What you already owed when you started tracking them here."
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="bankName"
                      label="Bank"
                      placeholder="Bank name"
                    />
                    <FormInput
                      control={form.control}
                      name="branchName"
                      label="Branch"
                      placeholder="Branch name"
                    />
                    <FormInput
                      control={form.control}
                      name="accountName"
                      label="Account name"
                      placeholder="Name on the account"
                    />
                    <FormInput
                      control={form.control}
                      name="accountNumber"
                      label="Account number"
                      placeholder="Account number"
                    />
                    <FormInput
                      control={form.control}
                      name="routingNumber"
                      label="Routing number"
                      placeholder="Routing number"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    Check the supplier before you save it.
                  </p>
                  <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-4">
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Name</dt>
                      <dd className="truncate font-medium">{summary.name || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Code</dt>
                      <dd className="truncate font-medium">{summary.code || "Auto"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Contact</dt>
                      <dd className="truncate font-medium">{summary.contactPerson || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Status</dt>
                      <dd className="font-medium">{summary.isActive ? "Active" : "Inactive"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Phone</dt>
                      <dd className="truncate font-medium">{summary.phone || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Email</dt>
                      <dd className="truncate font-medium">{summary.email || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Belongs to</dt>
                      <dd className="truncate font-medium">{concernLabel || "The organization"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Terms</dt>
                      <dd className="font-medium">
                        {PAYMENT_TERM_LABELS[summary.paymentTerms ?? "CASH"]}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Credit limit</dt>
                      <dd className="font-medium tabular-nums">{summary.creditLimit || 0}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Opening balance</dt>
                      <dd className="font-medium tabular-nums">{summary.openingBalance || 0}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Tags</dt>
                      <dd className="font-medium">{summary.tagIds?.length ?? 0}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Bank</dt>
                      <dd className="truncate font-medium">{summary.bankName || "—"}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </DialogBody>

            <DialogFooter className="sm:justify-between">
              <span className="hidden text-xs text-muted-foreground sm:block">
                Step {step + 1} of {STEPS.length}
              </span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
                  disabled={isSaving}
                >
                  {step === 0 ? (
                    "Cancel"
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </>
                  )}
                </Button>
                {step < LAST_STEP ? (
                  <Button key="wizard-next" type="button" onClick={() => void goNext()}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button key="wizard-submit" type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? "Save changes" : "Create supplier"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
