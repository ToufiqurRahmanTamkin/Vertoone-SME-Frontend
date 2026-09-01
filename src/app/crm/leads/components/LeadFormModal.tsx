import {
  FormDate,
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
import { useGetContactTypeOptionsQuery } from "@/redux/apis/contactTypeApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useCreateLeadMutation, useUpdateLeadMutation } from "@/redux/apis/leadApis";
import { useGetLeadSourceOptionsQuery } from "@/redux/apis/leadSourceApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
  type Lead,
  type LeadPayload,
} from "@/types/domain/lead";
import { LeadSchema, type LeadFormValues } from "@/validations/lead";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
}

const STEPS: readonly StepperStep[] = [
  { id: "lead", label: "Lead" },
  { id: "person", label: "Person" },
  { id: "pipeline", label: "Pipeline" },
  { id: "review", label: "Review" },
];

const STEP_FIELDS: readonly (keyof LeadFormValues)[][] = [
  ["title", "code", "companyName", "website", "leadSourceId", "contactTypeId", "tagIds"],
  [
    "firstName",
    "lastName",
    "email",
    "phone",
    "jobTitle",
    "street",
    "city",
    "state",
    "postalCode",
    "country",
  ],
  [
    "status",
    "priority",
    "estimatedValue",
    "expectedCloseDate",
    "lastContactedAt",
    "ownerId",
    "lostReason",
    "notes",
    "isActive",
  ],
  [],
];

const LAST_STEP = STEPS.length - 1;

const STATUS_OPTIONS = LEAD_STATUSES.map((status) => ({
  label: LEAD_STATUS_LABELS[status],
  value: status,
}));

const PRIORITY_OPTIONS = LEAD_PRIORITIES.map((priority) => ({
  label: LEAD_PRIORITY_LABELS[priority],
  value: priority,
}));

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) => fields.includes(field as keyof LeadFormValues));
  return index === -1 ? 0 : index;
};

const emptyValues = (): LeadFormValues => ({
  title: "",
  code: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  companyName: "",
  website: "",
  leadSourceId: "",
  contactTypeId: "",
  ownerId: "",
  tagIds: [],
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  status: "NEW",
  priority: "MEDIUM",
  estimatedValue: "",
  expectedCloseDate: "",
  lastContactedAt: "",
  lostReason: "",
  notes: "",
  isActive: true,
});

const toFormValues = (lead: Lead): LeadFormValues => ({
  title: lead.title,
  code: lead.code,
  firstName: lead.firstName,
  lastName: lead.lastName,
  email: lead.email,
  phone: lead.phone,
  jobTitle: lead.jobTitle,
  companyName: lead.companyName,
  website: lead.website,
  leadSourceId: lead.leadSourceId ?? "",
  contactTypeId: lead.contactTypeId ?? "",
  ownerId: lead.ownerId ?? "",
  tagIds: lead.tagIds,
  street: lead.address.street,
  city: lead.address.city,
  state: lead.address.state,
  postalCode: lead.address.postalCode,
  country: lead.address.country,
  status: lead.status,
  priority: lead.priority,
  estimatedValue: lead.estimatedValue || "",
  expectedCloseDate: lead.expectedCloseDate ?? "",
  lastContactedAt: lead.lastContactedAt ?? "",
  lostReason: lead.lostReason,
  notes: lead.notes,
  isActive: lead.isActive,
});

const toPayload = (values: LeadFormValues): LeadPayload => ({
  title: values.title,
  code: values.code || undefined,
  firstName: values.firstName,
  lastName: values.lastName,
  email: values.email,
  phone: values.phone,
  jobTitle: values.jobTitle,
  companyName: values.companyName,
  website: values.website,
  leadSourceId: values.leadSourceId || null,
  contactTypeId: values.contactTypeId || null,
  ownerId: values.ownerId || null,
  tagIds: values.tagIds,
  address: {
    street: values.street,
    city: values.city,
    state: values.state,
    postalCode: values.postalCode,
    country: values.country,
  },
  status: values.status,
  priority: values.priority,
  estimatedValue: values.estimatedValue === "" ? 0 : values.estimatedValue,
  expectedCloseDate: values.expectedCloseDate || null,
  lastContactedAt: values.lastContactedAt || null,
  lostReason: values.lostReason,
  notes: values.notes,
  isActive: values.isActive,
});

export function LeadFormModal({ open, onOpenChange, lead }: LeadFormModalProps) {
  const isEdit = Boolean(lead);

  const { data: leadSourceOptions = [] } = useGetLeadSourceOptionsQuery();
  const { data: contactTypeOptions = [] } = useGetContactTypeOptionsQuery();
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: tagOptions = [] } = useGetTagOptionsQuery();

  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(LeadSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(lead ? toFormValues(lead) : emptyValues());
  }, [open, lead, form]);

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);
  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (lead?._id ?? "new") : null;

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setStep(0);
    setFurthestStep(seedKey !== null && lead ? LAST_STEP : 0);
  }

  const leadSourceChoices = React.useMemo(
    () => [
      { label: "No source", value: "" },
      ...leadSourceOptions.map((source) => ({ label: source.name, value: source._id })),
    ],
    [leadSourceOptions]
  );

  const contactTypeChoices = React.useMemo(
    () => [
      { label: "No type", value: "" },
      ...contactTypeOptions.map((type) => ({ label: type.name, value: type._id })),
    ],
    [contactTypeOptions]
  );

  const ownerChoices = React.useMemo(
    () => [
      { label: "Unassigned", value: "" },
      ...employeeOptions.map((employee) => ({ label: employee.name, value: employee._id })),
    ],
    [employeeOptions]
  );

  const tagChoices = React.useMemo<MultiSelectOption[]>(
    () => tagOptions.map((tag) => ({ value: tag._id, label: tag.name, color: tag.color })),
    [tagOptions]
  );

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const isValid = fields.length === 0 || (await form.trigger(fields, { shouldFocus: true }));
    if (!isValid) return;
    const next = Math.min(step + 1, LAST_STEP);
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const onSubmit = async (values: LeadFormValues) => {
    try {
      const body = toPayload(values);

      if (lead) {
        await updateLead({ id: lead._id, body }).unwrap();
        toast.success("Lead updated");
      } else {
        await createLead(body).unwrap();
        toast.success("Lead created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the lead");
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

  const summarySourceName =
    leadSourceOptions.find((source) => source._id === summary.leadSourceId)?.name ?? "—";
  const summaryOwnerName =
    employeeOptions.find((employee) => employee._id === summary.ownerId)?.name ?? "Unassigned";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit lead" : "New lead"}</DialogTitle>
          <DialogDescription>
            Unqualified interest captured from any channel, tracked until it is won, lost or
            converted into a contact.
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
                      name="title"
                      label="Lead title"
                      placeholder="Office furniture enquiry"
                      className="sm:col-span-2"
                    />
                    <FormInput
                      control={form.control}
                      name="code"
                      label="Code"
                      placeholder="Left blank, we generate one"
                    />
                    <FormInput
                      control={form.control}
                      name="companyName"
                      label="Company"
                      placeholder="Who the enquiry is from"
                    />
                    <FormInput
                      control={form.control}
                      name="website"
                      label="Website"
                      placeholder="https://company.com"
                    />
                    <FormSelect
                      control={form.control}
                      name="leadSourceId"
                      label="Lead source"
                      placeholder="No source"
                      options={leadSourceChoices}
                    />
                    <FormSelect
                      control={form.control}
                      name="contactTypeId"
                      label="Contact type"
                      placeholder="No type"
                      options={contactTypeChoices}
                    />
                    <FormMultiSelect
                      control={form.control}
                      name="tagIds"
                      label="Tags"
                      placeholder="No tags"
                      options={tagChoices}
                      emptyText="No tags yet. Create them under CRM · Settings · Tags."
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="firstName"
                      label="First name"
                      placeholder="Ayesha"
                    />
                    <FormInput
                      control={form.control}
                      name="lastName"
                      label="Last name"
                      placeholder="Rahman"
                    />
                    <FormInput
                      control={form.control}
                      name="email"
                      label="Email"
                      placeholder="ayesha@company.com"
                    />
                    <FormPhone control={form.control} name="phone" label="Phone" />
                    <FormInput
                      control={form.control}
                      name="jobTitle"
                      label="Job title"
                      placeholder="Procurement manager"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="street"
                      label="Street"
                      placeholder="House, road, area"
                      className="sm:col-span-2"
                    />
                    <FormInput control={form.control} name="city" label="City" placeholder="Dhaka" />
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
                      name="status"
                      label="Status"
                      options={STATUS_OPTIONS}
                    />
                    <FormSelect
                      control={form.control}
                      name="priority"
                      label="Priority"
                      options={PRIORITY_OPTIONS}
                    />
                    <FormInput
                      control={form.control}
                      name="estimatedValue"
                      label="Estimated value"
                      type="number"
                      description="What the deal is worth if it closes."
                    />
                    <FormSelect
                      control={form.control}
                      name="ownerId"
                      label="Owner"
                      placeholder="Unassigned"
                      options={ownerChoices}
                    />
                    <FormDate
                      control={form.control}
                      name="expectedCloseDate"
                      label="Expected close date"
                      dateOnly
                    />
                    <FormDate
                      control={form.control}
                      name="lastContactedAt"
                      label="Last contacted"
                      dateOnly
                      disableFuture
                    />
                  </div>

                  <FormInput
                    control={form.control}
                    name="lostReason"
                    label="Lost reason"
                    placeholder="Only needed when the lead is marked lost"
                  />

                  <FormTextarea
                    control={form.control}
                    name="notes"
                    label="Notes"
                    placeholder="What they asked for, what was promised, next steps"
                  />

                  <FormSwitch
                    control={form.control}
                    name="isActive"
                    label="Active"
                    description="Inactive leads drop out of the working list but stay on record."
                  />
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    Check the lead before you save it.
                  </p>
                  <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-4">
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Title</dt>
                      <dd className="truncate font-medium">{summary.title || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Code</dt>
                      <dd className="truncate font-medium">{summary.code || "Auto"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Company</dt>
                      <dd className="truncate font-medium">{summary.companyName || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Source</dt>
                      <dd className="truncate font-medium">{summarySourceName}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Person</dt>
                      <dd className="truncate font-medium">
                        {[summary.firstName, summary.lastName].filter(Boolean).join(" ") || "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Email</dt>
                      <dd className="truncate font-medium">{summary.email || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Phone</dt>
                      <dd className="truncate font-medium">{summary.phone || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Owner</dt>
                      <dd className="truncate font-medium">{summaryOwnerName}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Status</dt>
                      <dd className="font-medium">{LEAD_STATUS_LABELS[summary.status ?? "NEW"]}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Priority</dt>
                      <dd className="font-medium">
                        {LEAD_PRIORITY_LABELS[summary.priority ?? "MEDIUM"]}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Value</dt>
                      <dd className="font-medium tabular-nums">{summary.estimatedValue || 0}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Tags</dt>
                      <dd className="font-medium">{summary.tagIds?.length ?? 0}</dd>
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
                    {isEdit ? "Save changes" : "Create lead"}
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
