import { ModulePermissionMatrix } from "@/components/permission/module-permission-matrix";
import { FormInput, FormPassword, FormSelect } from "@/components/shared/form-fields";
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
import { usePermissions } from "@/hooks/use-permission";
import { useGetModuleCatalogueQuery } from "@/redux/apis/permissionApis";
import {
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
} from "@/redux/apis/teamMemberApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { permissionFor, type ModulePermissionMap } from "@/types/domain/permission";
import type { TeamMember } from "@/types/domain/teamMember";
import { TeamMemberSchema, type TeamMemberFormValues } from "@/validations/teamMember";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface TeamMemberFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember | null;
}

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const STEPS: readonly StepperStep[] = [
  { id: "details", label: "Member details" },
  { id: "access", label: "Menu access" },
  { id: "review", label: "Review" },
];

const STEP_FIELDS: readonly (keyof TeamMemberFormValues)[][] = [
  ["name", "email", "phone", "status", "password"],
  [],
  [],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.includes(field as keyof TeamMemberFormValues)
  );
  return index === -1 ? 0 : index;
};

const emptyValues = (): TeamMemberFormValues => ({
  name: "",
  email: "",
  phone: "",
  password: "",
  status: "ACTIVE",
});

const toFormValues = (member: TeamMember): TeamMemberFormValues => ({
  name: member.name,
  email: member.email,
  phone: member.phone ?? "",
  password: "",
  status: member.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
});

export function TeamMemberFormModal({ open, onOpenChange, member }: TeamMemberFormModalProps) {
  const isEdit = Boolean(member);
  const { modules: entitlement } = usePermissions();

  const [createMember, { isLoading: isCreating }] = useCreateTeamMemberMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateTeamMemberMutation();
  const isSaving = isCreating || isUpdating;

  const { data: catalogue = [] } = useGetModuleCatalogueQuery();

  const assignableModules = React.useMemo(
    () =>
      catalogue.filter(
        (definition) =>
          definition.scope === "COMPANY" &&
          !definition.ownerOnly &&
          permissionFor(entitlement, definition.key).canView
      ),
    [catalogue, entitlement]
  );

  const [grant, setGrant] = React.useState<ModulePermissionMap>({});
  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(TeamMemberSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(member ? toFormValues(member) : emptyValues());
  }, [open, member, form]);

  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (member?._id ?? "new") : null;

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setGrant(seedKey === null ? {} : (member?.modulePermissions ?? {}));
    setStep(0);
    setFurthestStep(seedKey !== null && member ? LAST_STEP : 0);
  }

  const goToStep = (next: number) => {
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const goNext = async () => {
    const isValid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!isValid) return;
    if (step === 0 && !isEdit && !form.getValues("password")) {
      form.setError("password", { message: "Set a password for the new team member" });
      return;
    }
    goToStep(Math.min(step + 1, LAST_STEP));
  };

  const onSubmit = async (values: TeamMemberFormValues) => {
    if (!isEdit && !values.password) {
      form.setError("password", { message: "Set a password for the new team member" });
      setStep(0);
      return;
    }

    try {
      if (member) {
        await updateMember({
          id: member._id,
          body: {
            name: values.name,
            phone: values.phone,
            status: values.status,
            modulePermissions: grant,
            ...(values.password ? { password: values.password } : {}),
          },
        }).unwrap();
        toast.success("Team member updated");
      } else {
        await createMember({
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          status: values.status,
          modulePermissions: grant,
        }).unwrap();
        toast.success("Team member added");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the team member");
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
          <DialogTitle>{isEdit ? "Edit team member" : "New team member"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Permission changes apply immediately — a revoked menu disappears from their sidebar straight away."
              : "Create a sign-in for someone in your company and choose which menus they can reach."}
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
                    label="Full name"
                    placeholder="Rahim Uddin"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="email"
                    label="Email"
                    placeholder="rahim@company.com"
                    disabled={isEdit}
                    description={isEdit ? "The sign-in email cannot be changed." : undefined}
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="phone"
                    label="Phone"
                    placeholder="+8801XXXXXXXXX"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormSelect
                    control={form.control}
                    name="status"
                    label="Status"
                    options={STATUS_OPTIONS}
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormPassword
                    control={form.control}
                    name="password"
                    label={isEdit ? "New password" : "Password"}
                    description={
                      isEdit
                        ? "Leave blank to keep the current password. Changing it signs them out everywhere."
                        : "At least 8 characters."
                    }
                    className="col-span-6 sm:col-span-3"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Only the menus your subscription includes can be handed out. Record caps stay
                    with the plan and are shared across everyone in the company.
                  </p>
                  <ModulePermissionMatrix
                    modules={assignableModules}
                    value={grant}
                    onChange={setGrant}
                    ceiling={entitlement}
                    emptyMessage="Your current plan does not include any assignable menus."
                  />
                </div>
              )}

              {step === 2 && (
                <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-4">
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Name</dt>
                    <dd className="truncate font-medium">{summary.name || "—"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Email</dt>
                    <dd className="truncate font-medium">{summary.email || "—"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Status</dt>
                    <dd className="font-medium">
                      {summary.status === "INACTIVE" ? "Inactive" : "Active"}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Menus</dt>
                    <dd className="font-medium">{grantedMenuCount} granted</dd>
                  </div>
                </dl>
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
                  className="cursor-pointer"
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
                  <Button
                    key="wizard-next"
                    type="button"
                    className="cursor-pointer"
                    onClick={() => void goNext()}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    key="wizard-submit"
                    type="submit"
                    className="cursor-pointer"
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? "Save changes" : "Add member"}
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
