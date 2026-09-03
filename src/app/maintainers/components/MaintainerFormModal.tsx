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
import {
  useCreateMaintainerMutation,
  useUpdateMaintainerMutation,
} from "@/redux/apis/maintainerApis";
import { useGetModuleCatalogueQuery } from "@/redux/apis/permissionApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Maintainer } from "@/types/domain/maintainer";
import {
  moduleKeyFromPath,
  prunePermissionMap,
  type ModulePermissionMap,
} from "@/types/domain/permission";
import { MaintainerSchema, type MaintainerFormValues } from "@/validations/maintainer";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface MaintainerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintainer?: Maintainer | null;
}

const MAINTAINERS_MODULE_KEY = moduleKeyFromPath("/platform/maintainers");

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const STEPS: readonly StepperStep[] = [
  { id: "details", label: "Sign-in details" },
  { id: "access", label: "Platform access" },
  { id: "review", label: "Review" },
];

const STEP_FIELDS: readonly (keyof MaintainerFormValues)[][] = [
  ["name", "email", "phone", "status", "password"],
  [],
  [],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.includes(field as keyof MaintainerFormValues)
  );
  return index === -1 ? 0 : index;
};

const emptyValues = (): MaintainerFormValues => ({
  name: "",
  email: "",
  phone: "",
  password: "",
  status: "ACTIVE",
});

const toFormValues = (maintainer: Maintainer): MaintainerFormValues => ({
  name: maintainer.name,
  email: maintainer.email,
  phone: maintainer.phone ?? "",
  password: "",
  status: maintainer.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
});

export function MaintainerFormModal({ open, onOpenChange, maintainer }: MaintainerFormModalProps) {
  const isEdit = Boolean(maintainer);

  const [createMaintainer, { isLoading: isCreating }] = useCreateMaintainerMutation();
  const [updateMaintainer, { isLoading: isUpdating }] = useUpdateMaintainerMutation();
  const isSaving = isCreating || isUpdating;

  const { data: catalogue = [] } = useGetModuleCatalogueQuery();

  const assignableModules = React.useMemo(
    () =>
      catalogue.filter(
        (definition) =>
          definition.scope === "SUPER_ADMIN" && definition.key !== MAINTAINERS_MODULE_KEY
      ),
    [catalogue]
  );

  const assignableKeys = React.useMemo(
    () => new Set(assignableModules.map((definition) => definition.key)),
    [assignableModules]
  );

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);
  const [permissions, setPermissions] = React.useState<ModulePermissionMap>({});

  const form = useForm<MaintainerFormValues>({
    resolver: zodResolver(MaintainerSchema),
    defaultValues: emptyValues(),
  });

  const seedKey = open ? (maintainer?._id ?? "new") : null;
  const [seededFor, setSeededFor] = React.useState<string | null>(null);

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setStep(0);
    setFurthestStep(seedKey !== null && maintainer ? LAST_STEP : 0);
    setPermissions(seedKey === null ? {} : (maintainer?.modulePermissions ?? {}));
  }

  React.useEffect(() => {
    if (!open) return;
    form.reset(maintainer ? toFormValues(maintainer) : emptyValues());
  }, [open, maintainer, form]);

  const livePermissions = React.useMemo(
    () => prunePermissionMap(permissions, assignableKeys),
    [permissions, assignableKeys]
  );

  const grantedMenuCount = React.useMemo(
    () => Object.values(livePermissions).filter((permission) => permission.canView).length,
    [livePermissions]
  );

  const goToStep = (next: number) => {
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const goNext = async () => {
    const isValid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!isValid) return;
    if (step === 0 && !isEdit && !form.getValues("password")) {
      form.setError("password", { message: "Set a password for the new maintainer" });
      return;
    }
    goToStep(Math.min(step + 1, LAST_STEP));
  };

  const onSubmit = async (values: MaintainerFormValues) => {
    if (!isEdit && !values.password) {
      form.setError("password", { message: "Set a password for the new maintainer" });
      setStep(0);
      return;
    }

    try {
      if (maintainer) {
        await updateMaintainer({
          id: maintainer._id,
          body: {
            name: values.name,
            phone: values.phone,
            status: values.status,
            modulePermissions: livePermissions,
            ...(values.password ? { password: values.password } : {}),
          },
        }).unwrap();
        toast.success("Maintainer updated");
      } else {
        await createMaintainer({
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          status: values.status,
          modulePermissions: livePermissions,
        }).unwrap();
        toast.success("Maintainer created", {
          description: `${values.email} can sign in now with the password you set.`,
        });
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the maintainer");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit maintainer" : "New maintainer"}</DialogTitle>
          <DialogDescription>
            A maintainer signs in with their own credentials and runs the platform on your behalf.
            They only reach the menus you grant here, and each menu carries its own create, edit and
            delete rights.
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
                    type="email"
                    placeholder="rahim@vertoone.com"
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
                        : "At least 8 characters. Hand it to them yourself — it is not emailed."
                    }
                    className="col-span-6 sm:col-span-3"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Tick the platform menus this maintainer may open, and what they may do inside
                    each one. Maintainers never reach this Maintainers screen, so they cannot widen
                    their own access.
                  </p>
                  <ModulePermissionMatrix
                    modules={assignableModules}
                    value={livePermissions}
                    onChange={setPermissions}
                    emptyMessage="The module catalogue has not loaded yet."
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
                    <dt className="text-xs text-muted-foreground">Access</dt>
                    <dd className="font-medium">
                      {grantedMenuCount} menu{grantedMenuCount === 1 ? "" : "s"}
                    </dd>
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
                    {isEdit ? "Save changes" : "Create maintainer"}
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
