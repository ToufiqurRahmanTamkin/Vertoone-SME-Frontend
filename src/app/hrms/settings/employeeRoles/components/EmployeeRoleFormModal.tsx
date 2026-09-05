import { ModulePermissionMatrix } from "@/components/permission/module-permission-matrix";
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
import { NO_DELEGABLE_MENUS, useDelegableModules } from "@/hooks/use-delegable-modules";
import {
  useCreateEmployeeRoleMutation,
  useUpdateEmployeeRoleMutation,
} from "@/redux/apis/employeeRoleApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { EmployeeRole } from "@/types/domain/employeeRole";
import { prunePermissionMap, type ModulePermissionMap } from "@/types/domain/permission";
import { EmployeeRoleSchema, type EmployeeRoleFormValues } from "@/validations/employeeRole";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EmployeeRoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: EmployeeRole | null;
  onSaved?: (role: EmployeeRole) => void;
}

const emptyValues = (): EmployeeRoleFormValues => ({
  name: "",
  description: "",
  isActive: true,
});

const toFormValues = (role: EmployeeRole): EmployeeRoleFormValues => ({
  name: role.name,
  description: role.description,
  isActive: role.isActive,
});

export function EmployeeRoleFormModal({
  open,
  onOpenChange,
  role,
  onSaved,
}: EmployeeRoleFormModalProps) {
  const isEdit = Boolean(role);

  const [createEmployeeRole, { isLoading: isCreating }] = useCreateEmployeeRoleMutation();
  const [updateEmployeeRole, { isLoading: isUpdating }] = useUpdateEmployeeRoleMutation();
  const isSaving = isCreating || isUpdating;

  const { modules: assignableModules, knownModuleKeys, ceiling } = useDelegableModules();

  const [grant, setGrant] = React.useState<ModulePermissionMap>({});

  const liveGrant = React.useMemo(
    () => prunePermissionMap(grant, knownModuleKeys),
    [grant, knownModuleKeys]
  );

  const form = useForm<EmployeeRoleFormValues>({
    resolver: zodResolver(EmployeeRoleSchema),
    defaultValues: emptyValues(),
  });

  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (role?._id ?? "new") : null;

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setGrant(seedKey === null ? {} : (role?.modulePermissions ?? {}));
    form.reset(role ? toFormValues(role) : emptyValues());
  }

  const grantedMenuCount = React.useMemo(
    () => Object.values(liveGrant).filter((permission) => permission.canView).length,
    [liveGrant]
  );

  const onSubmit = async (values: EmployeeRoleFormValues) => {
    const body = {
      name: values.name,
      description: values.description ?? "",
      isActive: values.isActive,
      modulePermissions: liveGrant,
    };

    try {
      const saved = role
        ? await updateEmployeeRole({ id: role._id, body }).unwrap()
        : await createEmployeeRole(body).unwrap();
      toast.success(role ? "Employee role updated" : "Employee role created");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the employee role");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit employee role" : "New employee role"}</DialogTitle>
          <DialogDescription>
            An employee role is a reusable set of menu permissions for your workforce. Assign it to
            employees and each of them reaches exactly what you tick below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-6 gap-x-3 gap-y-3">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Role name"
                  placeholder="Shift Supervisor"
                  className="col-span-6 sm:col-span-4"
                />
                <FormSwitch
                  control={form.control}
                  name="isActive"
                  label="Active"
                  description="Inactive roles grant nothing."
                  className="col-span-6 sm:col-span-2"
                />
                <FormTextarea
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="What this role is for"
                  className="col-span-6"
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{grantedMenuCount}</span> menus in
                  this role. You can only hand out menus you have access to yourself.
                </p>
                <ModulePermissionMatrix
                  modules={assignableModules}
                  value={liveGrant}
                  onChange={setGrant}
                  ceiling={ceiling}
                  emptyMessage={NO_DELEGABLE_MENUS}
                />
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
