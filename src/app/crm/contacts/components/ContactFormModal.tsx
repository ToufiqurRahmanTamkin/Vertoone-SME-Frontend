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
import { ColorLabelFormModal, type ColorLabel } from "@/components/shared/color-label-form-modal";
import { QuickCreateButton } from "@/components/shared/quick-create-button";
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
import { useModulePermission } from "@/hooks/use-permission";
import { useGetContactTypeOptionsQuery } from "@/redux/apis/contactTypeApis";
import { useCreateContactMutation, useUpdateContactMutation } from "@/redux/apis/contactApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetLeadSourceOptionsQuery } from "@/redux/apis/leadSourceApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  CONTACT_CHANNEL_LABELS,
  CONTACT_PREFERRED_CHANNELS,
  CONTACT_STATUS_LABELS,
  CONTACT_STATUSES,
  type Contact,
  type ContactPayload,
} from "@/types/domain/contact";
import { ContactSchema, type ContactFormValues } from "@/validations/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
}

type QuickCreateKind = "contactType" | "leadSource" | "tag";

const CONTACT_TYPES_MODULE = "/crm/settings/contact-types";
const LEAD_SOURCES_MODULE = "/crm/settings/lead-sources";
const TAGS_MODULE = "/crm/settings/tags";

const STEPS: readonly StepperStep[] = [
  { id: "person", label: "Person" },
  { id: "reach", label: "Reach" },
  { id: "crm", label: "CRM" },
  { id: "review", label: "Review" },
];

const STEP_FIELDS: readonly (keyof ContactFormValues)[][] = [
  ["firstName", "lastName", "jobTitle", "companyName", "department", "birthday"],
  [
    "email",
    "phone",
    "alternatePhone",
    "website",
    "preferredChannel",
    "street",
    "city",
    "state",
    "postalCode",
    "country",
  ],
  [
    "contactTypeId",
    "leadSourceId",
    "ownerId",
    "tagIds",
    "status",
    "lastContactedAt",
    "notes",
    "isActive",
  ],
  [],
];

const LAST_STEP = STEPS.length - 1;

const CHANNEL_OPTIONS = CONTACT_PREFERRED_CHANNELS.map((channel) => ({
  label: CONTACT_CHANNEL_LABELS[channel],
  value: channel,
}));

const STATUS_OPTIONS = CONTACT_STATUSES.map((status) => ({
  label: CONTACT_STATUS_LABELS[status],
  value: status,
}));

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.includes(field as keyof ContactFormValues)
  );
  return index === -1 ? 0 : index;
};

const emptyValues = (): ContactFormValues => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  alternatePhone: "",
  jobTitle: "",
  companyName: "",
  department: "",
  website: "",
  contactTypeId: "",
  leadSourceId: "",
  ownerId: "",
  tagIds: [],
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  preferredChannel: "EMAIL",
  status: "ACTIVE",
  birthday: "",
  lastContactedAt: "",
  notes: "",
  isActive: true,
});

const toFormValues = (contact: Contact): ContactFormValues => ({
  firstName: contact.firstName,
  lastName: contact.lastName,
  email: contact.email,
  phone: contact.phone,
  alternatePhone: contact.alternatePhone,
  jobTitle: contact.jobTitle,
  companyName: contact.companyName,
  department: contact.department,
  website: contact.website,
  contactTypeId: contact.contactTypeId ?? "",
  leadSourceId: contact.leadSourceId ?? "",
  ownerId: contact.ownerId ?? "",
  tagIds: contact.tagIds,
  street: contact.address.street,
  city: contact.address.city,
  state: contact.address.state,
  postalCode: contact.address.postalCode,
  country: contact.address.country,
  preferredChannel: contact.preferredChannel,
  status: contact.status,
  birthday: contact.birthday ?? "",
  lastContactedAt: contact.lastContactedAt ?? "",
  notes: contact.notes,
  isActive: contact.isActive,
});

const toPayload = (values: ContactFormValues): ContactPayload => ({
  firstName: values.firstName,
  lastName: values.lastName,
  email: values.email,
  phone: values.phone,
  alternatePhone: values.alternatePhone,
  jobTitle: values.jobTitle,
  companyName: values.companyName,
  department: values.department,
  website: values.website,
  contactTypeId: values.contactTypeId || null,
  leadSourceId: values.leadSourceId || null,
  ownerId: values.ownerId || null,
  tagIds: values.tagIds,
  address: {
    street: values.street,
    city: values.city,
    state: values.state,
    postalCode: values.postalCode,
    country: values.country,
  },
  preferredChannel: values.preferredChannel,
  status: values.status,
  birthday: values.birthday || null,
  lastContactedAt: values.lastContactedAt || null,
  notes: values.notes,
  isActive: values.isActive,
});

export function ContactFormModal({ open, onOpenChange, contact }: ContactFormModalProps) {
  const isEdit = Boolean(contact);

  const { data: contactTypeOptions = [] } = useGetContactTypeOptionsQuery();
  const { data: leadSourceOptions = [] } = useGetLeadSourceOptionsQuery();
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: tagOptions = [] } = useGetTagOptionsQuery();

  const [createContact, { isLoading: isCreating }] = useCreateContactMutation();
  const [updateContact, { isLoading: isUpdating }] = useUpdateContactMutation();
  const isSaving = isCreating || isUpdating;

  const canCreateContactType = useModulePermission(CONTACT_TYPES_MODULE).canCreate;
  const canCreateLeadSource = useModulePermission(LEAD_SOURCES_MODULE).canCreate;
  const canCreateTag = useModulePermission(TAGS_MODULE).canCreate;

  const [quickCreate, setQuickCreate] = React.useState<QuickCreateKind | null>(null);
  const closeQuickCreate = () => setQuickCreate(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(contact ? toFormValues(contact) : emptyValues());
  }, [open, contact, form]);

  const selectCreated = React.useCallback(
    (field: "contactTypeId" | "leadSourceId", id: string) => {
      form.setValue(field, id, { shouldDirty: true, shouldValidate: true });
    },
    [form]
  );

  const selectCreatedTag = React.useCallback(
    (id: string) => {
      const current = form.getValues("tagIds") ?? [];
      if (current.includes(id)) return;
      form.setValue("tagIds", [...current, id], { shouldDirty: true, shouldValidate: true });
    },
    [form]
  );

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);
  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (contact?._id ?? "new") : null;

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setStep(0);
    setFurthestStep(seedKey !== null && contact ? LAST_STEP : 0);
    setQuickCreate(null);
  }

  const contactTypeChoices = React.useMemo(
    () => [
      { label: "No type", value: "" },
      ...contactTypeOptions.map((type) => ({ label: type.name, value: type._id })),
    ],
    [contactTypeOptions]
  );

  const leadSourceChoices = React.useMemo(
    () => [
      { label: "No source", value: "" },
      ...leadSourceOptions.map((source) => ({ label: source.name, value: source._id })),
    ],
    [leadSourceOptions]
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

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const body = toPayload(values);

      if (contact) {
        await updateContact({ id: contact._id, body }).unwrap();
        toast.success("Contact updated");
      } else {
        await createContact(body).unwrap();
        toast.success("Contact created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the contact");
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

  const summaryTypeName =
    contactTypeOptions.find((type) => type._id === summary.contactTypeId)?.name ?? "—";
  const summaryOwnerName =
    employeeOptions.find((employee) => employee._id === summary.ownerId)?.name ?? "Unassigned";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit contact" : "New contact"}</DialogTitle>
            <DialogDescription>
              The people you deal with. Leads, deals and campaigns all point back at a contact.
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
                        name="jobTitle"
                        label="Job title"
                        placeholder="Procurement manager"
                      />
                      <FormInput
                        control={form.control}
                        name="companyName"
                        label="Company"
                        placeholder="Where they work"
                      />
                      <FormInput
                        control={form.control}
                        name="department"
                        label="Department"
                        placeholder="Operations"
                      />
                      <FormDate
                        control={form.control}
                        name="birthday"
                        label="Birthday"
                        dateOnly
                        disableFuture
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput
                        control={form.control}
                        name="email"
                        label="Email"
                        placeholder="ayesha@company.com"
                      />
                      <FormSelect
                        control={form.control}
                        name="preferredChannel"
                        label="Preferred channel"
                        options={CHANNEL_OPTIONS}
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
                      placeholder="https://company.com"
                    />

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
                        name="contactTypeId"
                        label="Contact type"
                        placeholder="No type"
                        options={contactTypeChoices}
                        labelAction={
                          canCreateContactType && (
                            <QuickCreateButton
                              label="Create a contact type"
                              onClick={() => setQuickCreate("contactType")}
                            />
                          )
                        }
                      />
                      <FormSelect
                        control={form.control}
                        name="leadSourceId"
                        label="Lead source"
                        placeholder="No source"
                        options={leadSourceChoices}
                        labelAction={
                          canCreateLeadSource && (
                            <QuickCreateButton
                              label="Create a lead source"
                              onClick={() => setQuickCreate("leadSource")}
                            />
                          )
                        }
                      />
                      <FormSelect
                        control={form.control}
                        name="ownerId"
                        label="Owner"
                        placeholder="Unassigned"
                        options={ownerChoices}
                      />
                      <FormSelect
                        control={form.control}
                        name="status"
                        label="Status"
                        options={STATUS_OPTIONS}
                      />
                      <FormDate
                        control={form.control}
                        name="lastContactedAt"
                        label="Last contacted"
                        dateOnly
                        disableFuture
                      />
                    </div>

                    <FormMultiSelect
                      control={form.control}
                      name="tagIds"
                      label="Tags"
                      placeholder="No tags"
                      options={tagChoices}
                      emptyText={
                        canCreateTag
                          ? "No tags yet. Use the gear icon to create one."
                          : "No tags yet. Create them under CRM · Settings · Tags."
                      }
                      labelAction={
                        canCreateTag && (
                          <QuickCreateButton
                            label="Create a tag"
                            onClick={() => setQuickCreate("tag")}
                          />
                        )
                      }
                    />

                    <FormTextarea
                      control={form.control}
                      name="notes"
                      label="Notes"
                      placeholder="How you know them, what they need, anything worth remembering"
                    />

                    <FormSwitch
                      control={form.control}
                      name="isActive"
                      label="Active"
                      description="Inactive contacts stay on past records but are not offered on new ones."
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground">
                      Check the contact before you save it.
                    </p>
                    <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-4">
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Name</dt>
                        <dd className="truncate font-medium">
                          {[summary.firstName, summary.lastName].filter(Boolean).join(" ") || "—"}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Company</dt>
                        <dd className="truncate font-medium">{summary.companyName || "—"}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Job title</dt>
                        <dd className="truncate font-medium">{summary.jobTitle || "—"}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Type</dt>
                        <dd className="truncate font-medium">{summaryTypeName}</dd>
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
                        <dd className="font-medium">
                          {CONTACT_STATUS_LABELS[summary.status ?? "ACTIVE"]}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Channel</dt>
                        <dd className="font-medium">
                          {CONTACT_CHANNEL_LABELS[summary.preferredChannel ?? "EMAIL"]}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Tags</dt>
                        <dd className="font-medium">{summary.tagIds?.length ?? 0}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Active</dt>
                        <dd className="font-medium">{summary.isActive ? "Yes" : "No"}</dd>
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
                      {isEdit ? "Save changes" : "Create contact"}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {open && canCreateContactType && (
        <ColorLabelFormModal
          kind="contactType"
          open={quickCreate === "contactType"}
          onOpenChange={(next) => !next && closeQuickCreate()}
          onSaved={(type: ColorLabel) => selectCreated("contactTypeId", type._id)}
        />
      )}

      {open && canCreateLeadSource && (
        <ColorLabelFormModal
          kind="leadSource"
          open={quickCreate === "leadSource"}
          onOpenChange={(next) => !next && closeQuickCreate()}
          onSaved={(source: ColorLabel) => selectCreated("leadSourceId", source._id)}
        />
      )}

      {open && canCreateTag && (
        <ColorLabelFormModal
          kind="tag"
          open={quickCreate === "tag"}
          onOpenChange={(next) => !next && closeQuickCreate()}
          onSaved={(tag: ColorLabel) => selectCreatedTag(tag._id)}
        />
      )}
    </>
  );
}
