import { AccessGrantEditor } from "@/components/permission/access-grant-editor";
import { useAccessGrant } from "@/hooks/use-access-grant";
import { useModulePermission } from "@/hooks/use-permission";
import { FormInput, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
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
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
} from "@/redux/apis/designationApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Designation, DesignationPayload } from "@/types/domain/designation";
import { DesignationSchema, type DesignationFormValues } from "@/validations/designation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface DesignationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designation?: Designation | null;
  onSaved?: (designation: Designation) => void;
}

const DETAILS_STEP: StepperStep = { id: "details", label: "Details" };
const ACCESS_STEP: StepperStep = { id: "access", label: "Menu access" };
const REVIEW_STEP: StepperStep = { id: "review", label: "Review" };

const DETAIL_FIELDS: readonly (keyof DesignationFormValues)[] = [
  "name",
  "code",
  "description",
  "level",
  "isActive",
];

const emptyValues = (): DesignationFormValues => ({
  name: "",
  code: "",
  description: "",
  level: 0,
  isActive: true,
});

const toFormValues = (designation: Designation): DesignationFormValues => ({
  name: designation.name,
  code: designation.code ?? "",
  description: designation.description ?? "",
  level: designation.level ?? 0,
  isActive: designation.isActive,
});

const toPayload = (
  values: DesignationFormValues,
  grant: Pick<DesignationPayload, "modulePermissions" | "roleIds">
): DesignationPayload => ({
  name: values.name,
  code: values.code || undefined,
  description: values.description,
  level: values.level === "" ? 0 : values.level,
  isActive: values.isActive,
  ...grant,
});

export function DesignationFormModal({
  open,
  onOpenChange,
  designation,
  onSaved,
}: DesignationFormModalProps) {
  const isEdit = Boolean(designation);

  const [createDesignation, { isLoading: isCreating }] = useCreateDesignationMutation();
  const [updateDesignation, { isLoading: isUpdating }] = useUpdateDesignationMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<DesignationFormValues>({
    resolver: zodResolver(DesignationSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(designation ? toFormValues(designation) : emptyValues());
  }, [open, designation, form]);

  const seedKey = open ? (designation?._id ?? "new") : null;
  const grant = useAccessGrant(seedKey, designation);
  const canManageAccess = useModulePermission(
    "/settings/users-and-roles/roles-and-permissions"
  ).canEdit;

  const steps = React.useMemo<StepperStep[]>(
    () =>
      canManageAccess ? [DETAILS_STEP, ACCESS_STEP, REVIEW_STEP] : [DETAILS_STEP, REVIEW_STEP],
    [canManageAccess]
  );

  const lastStep = steps.length - 1;
  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);
  const activeStep = Math.min(step, lastStep);
  const currentStep = steps[activeStep].id;

  const [seededFor, setSeededFor] = React.useState<string | null>(null);

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setStep(0);
    setFurthestStep(seedKey !== null && designation ? lastStep : 0);
  }

  const summary = useWatch({ control: form.control });

  const goNext = async () => {
    if (currentStep === "details") {
      const isValid = await form.trigger(DETAIL_FIELDS, { shouldFocus: true });
      if (!isValid) return;
    }
    const next = Math.min(activeStep + 1, lastStep);
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const onSubmit = async (values: DesignationFormValues) => {
    try {
      const body = toPayload(values, {
        modulePermissions: grant.permissions,
        roleIds: grant.roleIds,
      });

      const saved = designation
        ? await updateDesignation({ id: designation._id, body }).unwrap()
        : await createDesignation(body).unwrap();
      toast.success(designation ? "Designation updated" : "Designation created");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the designation");
    }
  };

  const onInvalid = () => setStep(0);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeStep < lastStep) {
      void goNext();
      return;
    }
    void form.handleSubmit(onSubmit, onInvalid)(event);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit designation" : "New designation"}</DialogTitle>
          <DialogDescription>
            Job titles employees hold. An employee can hold more than one.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleFormSubmit}>
            <DialogBody className="flex flex-col gap-4">
              <Stepper
                steps={steps}
                current={activeStep}
                reachable={furthestStep}
                onStepSelect={setStep}
              />

              {currentStep === "details" && (
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="name"
                      label="Name"
                      placeholder="Software engineer"
                    />
                    <FormInput
                      control={form.control}
                      name="code"
                      label="Code"
                      placeholder="Left blank, we generate one"
                    />
                  </div>

                  <FormInput
                    control={form.control}
                    name="level"
                    label="Seniority level"
                    type="number"
                    description="Higher numbers rank higher. Used to order the designation list."
                  />

                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="What this role covers (optional)"
                  />

                  <FormSwitch
                    control={form.control}
                    name="isActive"
                    label="Active"
                    description="Inactive designations stay on existing employees but are not offered on new ones."
                  />
                </div>
              )}

              {currentStep === "access" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{grant.roleIds.length}</span>{" "}
                    roles and{" "}
                    <span className="font-medium text-foreground">{grant.grantedMenuCount}</span>{" "}
                    menus granted to this designation.
                  </p>
                  <AccessGrantEditor
                    roleIds={grant.roleIds}
                    onRoleIdsChange={grant.setRoleIds}
                    permissions={grant.permissions}
                    onPermissionsChange={grant.setPermissions}
                    rolesHint="Every employee holding this designation inherits these roles."
                    permissionsHint="Extra menus every employee with this designation can reach."
                  />
                </div>
              )}

              {currentStep === "review" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    Check the designation before you save it.
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
                      <dt className="text-xs text-muted-foreground">Seniority level</dt>
                      <dd className="font-medium">{summary.level || 0}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Status</dt>
                      <dd className="font-medium">{summary.isActive ? "Active" : "Inactive"}</dd>
                    </div>
                    {canManageAccess && (
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Access</dt>
                        <dd className="font-medium">
                          {grant.roleIds.length} roles · {grant.grantedMenuCount} menus
                        </dd>
                      </div>
                    )}
                    <div className="col-span-2 min-w-0 sm:col-span-4">
                      <dt className="text-xs text-muted-foreground">Description</dt>
                      <dd className="font-medium">{summary.description || "—"}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </DialogBody>

            <DialogFooter className="sm:justify-between">
              <span className="hidden text-xs text-muted-foreground sm:block">
                Step {activeStep + 1} of {steps.length}
              </span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (activeStep === 0 ? onOpenChange(false) : setStep(activeStep - 1))}
                  disabled={isSaving}
                >
                  {activeStep === 0 ? (
                    "Cancel"
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </>
                  )}
                </Button>
                {activeStep < lastStep ? (
                  <Button key="wizard-next" type="button" onClick={() => void goNext()}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button key="wizard-submit" type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? "Save changes" : "Create designation"}
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
