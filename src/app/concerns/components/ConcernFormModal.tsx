import { AccessGrantEditor } from "@/components/permission/access-grant-editor";
import { useAccessGrant } from "@/hooks/use-access-grant";
import {
  FormInput,
  FormPassword,
  FormPhone,
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
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import {
  useCreateConcernMutation,
  useUpdateConcernHeadMutation,
  useUpdateConcernMutation,
} from "@/redux/apis/concernApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Concern } from "@/types/domain/concern";
import { ConcernSchema, type ConcernFormValues } from "@/validations/concern";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

export type ConcernFormStepId = "details" | "head" | "access";

interface ConcernFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  concern?: Concern | null;
  initialStep?: ConcernFormStepId;
}

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const STEPS: readonly StepperStep[] = [
  { id: "details", label: "Concern" },
  { id: "head", label: "Concern head" },
  { id: "access", label: "Menu access" },
];

const STEP_FIELDS: readonly (keyof ConcernFormValues)[][] = [
  ["name", "code", "industry", "email", "phone", "website", "address", "notes", "isActive"],
  ["headName", "headEmail", "headPhone", "headStatus", "headPassword"],
  [],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) => fields.includes(field as keyof ConcernFormValues));
  return index === -1 ? 0 : index;
};

const stepIndexOf = (id: ConcernFormStepId): number => {
  const index = STEPS.findIndex((step) => step.id === id);
  return index === -1 ? 0 : index;
};

const HEAD_STEP = stepIndexOf("head");

const emptyValues = (): ConcernFormValues => ({
  name: "",
  code: "",
  industry: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  notes: "",
  isActive: true,
  headName: "",
  headEmail: "",
  headPhone: "",
  headPassword: "",
  headStatus: "ACTIVE",
});

const toFormValues = (concern: Concern): ConcernFormValues => ({
  name: concern.name,
  code: concern.code,
  industry: concern.industry,
  email: concern.email,
  phone: concern.phone,
  website: concern.website,
  address: concern.address,
  notes: concern.notes,
  isActive: concern.isActive,
  headName: concern.head?.name ?? "",
  headEmail: concern.head?.email ?? "",
  headPhone: concern.head?.phone ?? "",
  headPassword: "",
  headStatus: concern.head?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
});

export function ConcernFormModal({
  open,
  onOpenChange,
  concern,
  initialStep = "details",
}: ConcernFormModalProps) {
  const isEdit = Boolean(concern);

  const [createConcern, { isLoading: isCreating }] = useCreateConcernMutation();
  const [updateConcern, { isLoading: isUpdating }] = useUpdateConcernMutation();
  const [updateHead, { isLoading: isUpdatingHead }] = useUpdateConcernHeadMutation();
  const isSaving = isCreating || isUpdating || isUpdatingHead;

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);

  const form = useForm<ConcernFormValues>({
    resolver: zodResolver(ConcernSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(concern ? toFormValues(concern) : emptyValues());
  }, [open, concern, form]);

  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? `${concern?._id ?? "new"}:${initialStep}` : null;
  const grant = useAccessGrant(seedKey, concern?.head);

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    const opening = seedKey === null ? 0 : stepIndexOf(initialStep);
    setStep(opening);
    setFurthestStep(seedKey !== null && concern ? LAST_STEP : opening);
  }

  const goToStep = (next: number) => {
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const isValid = fields.length === 0 || (await form.trigger(fields, { shouldFocus: true }));
    if (!isValid) return;
    if (step === HEAD_STEP && !isEdit && !form.getValues("headPassword")) {
      form.setError("headPassword", { message: "Set a sign-in password for the concern head" });
      return;
    }
    goToStep(Math.min(step + 1, LAST_STEP));
  };

  const onSubmit = async (values: ConcernFormValues) => {
    if (!isEdit && !values.headPassword) {
      setStep(HEAD_STEP);
      form.setError("headPassword", { message: "Set a sign-in password for the concern head" });
      return;
    }

    const details = {
      name: values.name,
      code: values.code || undefined,
      industry: values.industry,
      email: values.email,
      phone: values.phone,
      website: values.website,
      address: values.address,
      notes: values.notes,
      isActive: values.isActive,
    };

    try {
      if (concern) {
        await updateConcern({ id: concern._id, body: details }).unwrap();

        if (concern.head) {
          await updateHead({
            id: concern._id,
            body: {
              name: values.headName,
              phone: values.headPhone,
              status: values.headStatus,
              modulePermissions: grant.permissions,
              roleIds: grant.roleIds,
              ...(values.headPassword ? { password: values.headPassword } : {}),
            },
          }).unwrap();
        }

        toast.success("Concern updated");
      } else {
        await createConcern({
          ...details,
          head: {
            name: values.headName,
            email: values.headEmail,
            password: values.headPassword,
            phone: values.headPhone,
            status: values.headStatus,
            modulePermissions: grant.permissions,
            roleIds: grant.roleIds,
          },
        }).unwrap();
        toast.success("Concern created — the head can sign in with the email and password you set");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the concern");
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstStep = Object.keys(errors).map(stepOf).sort((a, b) => a - b)[0];
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

  const grantedMenuCount = React.useMemo(
    () => Object.values(grant).filter((permission) => permission.canView).length,
    [grant]
  );

  const summary = useWatch({ control: form.control });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit concern" : "New concern"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the concern and the access its head has to your workspace."
              : "Add a concern under your company and create the sign-in for the person who will run it."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleFormSubmit}>
            <DialogBody className="space-y-4">
              <Stepper
                steps={STEPS}
                current={step}
                reachable={furthestStep}
                onStepSelect={setStep}
              />

              {step === 0 && (
                <div className="grid grid-cols-6 gap-x-3 gap-y-3">
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Concern name"
                    placeholder="Vertoone Logistics Ltd."
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="code"
                    label="Code"
                    placeholder="Left blank, a code is generated from the name."
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="industry"
                    label="Industry"
                    placeholder="Freight & logistics"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="email"
                    label="Contact email"
                    placeholder="ops@concern.com"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormPhone
                    control={form.control}
                    name="phone"
                    label="Contact phone"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="website"
                    label="Website"
                    placeholder="https://concern.com"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="address"
                    label="Address"
                    placeholder="Plot 7, Tejgaon, Dhaka"
                    className="col-span-6"
                  />
                  <FormTextarea
                    control={form.control}
                    name="notes"
                    label="Notes"
                    placeholder="Anything worth remembering about this concern"
                    className="col-span-6"
                  />
                  <FormSwitch
                    control={form.control}
                    name="isActive"
                    label="Active"
                    description="Deactivating a concern also signs its head out."
                    className="col-span-6"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-6 gap-x-3 gap-y-3">
                  <FormInput
                    control={form.control}
                    name="headName"
                    label="Head's full name"
                    placeholder="Rahim Uddin"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="headEmail"
                    label="Sign-in email"
                    placeholder="rahim@concern.com"
                    disabled={isEdit}
                    description={isEdit ? "The sign-in email cannot be changed." : undefined}
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormPhone
                    control={form.control}
                    name="headPhone"
                    label="Phone"
                    description="The head is also registered as an employee of this concern."
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormSelect
                    control={form.control}
                    name="headStatus"
                    label="Sign-in status"
                    options={STATUS_OPTIONS}
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormPassword
                    control={form.control}
                    name="headPassword"
                    label={isEdit ? "New password" : "Password"}
                    description={
                      isEdit
                        ? "Leave blank to keep the current password. Changing it signs them out everywhere."
                        : "At least 8 characters. Share it with the head so they can sign in."
                    }
                    className="col-span-6 sm:col-span-3"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Pick the menus the concern head sees once they sign in. Only the menus your own
                    subscription includes can be handed out, and record caps stay with the plan.
                  </p>
                  <AccessGrantEditor
                    roleIds={grant.roleIds}
                    onRoleIdsChange={grant.setRoleIds}
                    permissions={grant.permissions}
                    onPermissionsChange={grant.setPermissions}
                    rolesHint="The concern head inherits every menu these roles grant."
                    permissionsHint="Extra menus granted only to this concern head."
                  />

                  <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-muted-foreground">Concern</dt>
                      <dd className="truncate font-medium">{summary.name || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Head</dt>
                      <dd className="truncate font-medium">{summary.headName || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Sign-in</dt>
                      <dd className="truncate font-medium">{summary.headEmail || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Menus</dt>
                      <dd className="font-medium">{grantedMenuCount} enabled</dd>
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
                    {isEdit ? "Save changes" : "Create concern"}
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
