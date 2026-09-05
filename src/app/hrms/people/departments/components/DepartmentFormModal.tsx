import { AccessGrantEditor } from "@/components/permission/access-grant-editor";
import { useAccessGrant } from "@/hooks/use-access-grant";
import { useModulePermission } from "@/hooks/use-permission";
import { FormInput, FormSelect, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
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
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/redux/apis/departmentApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Department, DepartmentPayload } from "@/types/domain/department";
import { DepartmentSchema, type DepartmentFormValues } from "@/validations/department";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface DepartmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
  onSaved?: (department: Department) => void;
}

const DETAILS_STEP: StepperStep = { id: "details", label: "Details" };
const ACCESS_STEP: StepperStep = { id: "access", label: "Menu access" };
const REVIEW_STEP: StepperStep = { id: "review", label: "Review" };

const DETAIL_FIELDS: readonly (keyof DepartmentFormValues)[] = [
  "name",
  "code",
  "description",
  "headId",
  "isActive",
];

const emptyValues = (): DepartmentFormValues => ({
  name: "",
  code: "",
  description: "",
  headId: "",
  isActive: true,
});

const toFormValues = (department: Department): DepartmentFormValues => ({
  name: department.name,
  code: department.code ?? "",
  description: department.description ?? "",
  headId: department.head?._id ?? "",
  isActive: department.isActive,
});

const toPayload = (
  values: DepartmentFormValues,
  grant: Pick<DepartmentPayload, "modulePermissions" | "roleIds">
): DepartmentPayload => ({
  name: values.name,
  code: values.code || undefined,
  description: values.description,
  headId: values.headId || null,
  isActive: values.isActive,
  ...grant,
});

export function DepartmentFormModal({
  open,
  onOpenChange,
  department,
  onSaved,
}: DepartmentFormModalProps) {
  const isEdit = Boolean(department);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(DepartmentSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(department ? toFormValues(department) : emptyValues());
  }, [open, department, form]);

  const seedKey = open ? (department?._id ?? "new") : null;
  const grant = useAccessGrant(seedKey, department);
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
    setFurthestStep(seedKey !== null && department ? lastStep : 0);
  }

  const employeeChoices = React.useMemo(
    () =>
      employeeOptions.map((option) => ({
        value: option._id,
        label: option.employeeCode ? `${option.name} (${option.employeeCode})` : option.name,
      })),
    [employeeOptions]
  );

  const headChoices = React.useMemo(
    () => [{ value: "", label: "No head yet" }, ...employeeChoices],
    [employeeChoices]
  );

  const noEmployees = employeeOptions.length === 0;

  const summary = useWatch({ control: form.control });

  const headLabel = React.useMemo(
    () => employeeChoices.find((choice) => choice.value === summary.headId)?.label,
    [employeeChoices, summary.headId]
  );

  const goNext = async () => {
    if (currentStep === "details") {
      const isValid = await form.trigger(DETAIL_FIELDS, { shouldFocus: true });
      if (!isValid) return;
    }
    const next = Math.min(activeStep + 1, lastStep);
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      const body = toPayload(values, {
        modulePermissions: grant.permissions,
        roleIds: grant.roleIds,
      });

      const saved = department
        ? await updateDepartment({ id: department._id, body }).unwrap()
        : await createDepartment(body).unwrap();
      toast.success(department ? "Department updated" : "Department created");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the department");
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
          <DialogTitle>{isEdit ? "Edit department" : "New department"}</DialogTitle>
          <DialogDescription>
            Departments group employees. An employee can belong to more than one.
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
                  {noEmployees && (
                    <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
                      No employees yet. Create the department now, add employees to it under HRMS ·
                      Employees, then come back and set the head.
                    </p>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="name"
                      label="Name"
                      placeholder="Engineering"
                    />
                    <FormInput
                      control={form.control}
                      name="code"
                      label="Code"
                      placeholder="Left blank, we generate one"
                    />
                  </div>

                  <FormSelect
                    control={form.control}
                    name="headId"
                    label="Department head"
                    placeholder="No head yet"
                    options={headChoices}
                    disabled={noEmployees}
                    searchable
                    description="Optional. Leave it empty until the employee who runs this department exists."
                  />

                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="What this department is responsible for (optional)"
                  />

                  <FormSwitch
                    control={form.control}
                    name="isActive"
                    label="Active"
                    description="Inactive departments stay on existing employees but are not offered on new ones."
                  />
                </div>
              )}

              {currentStep === "access" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{grant.roleIds.length}</span>{" "}
                    roles and{" "}
                    <span className="font-medium text-foreground">{grant.grantedMenuCount}</span>{" "}
                    menus granted to this department.
                  </p>
                  <AccessGrantEditor
                    roleIds={grant.roleIds}
                    onRoleIdsChange={grant.setRoleIds}
                    permissions={grant.permissions}
                    onPermissionsChange={grant.setPermissions}
                    rolesHint="Every employee in this department inherits these roles."
                    permissionsHint="Extra menus every employee in this department can reach."
                  />
                </div>
              )}

              {currentStep === "review" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    Check the department before you save it.
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
                      <dt className="text-xs text-muted-foreground">Head</dt>
                      <dd className="truncate font-medium">{headLabel || "Unassigned"}</dd>
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
                    {isEdit ? "Save changes" : "Create department"}
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
