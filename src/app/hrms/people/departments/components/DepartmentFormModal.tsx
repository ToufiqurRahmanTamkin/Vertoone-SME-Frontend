import { AccessGrantEditor } from "@/components/permission/access-grant-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/redux/apis/departmentApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Department, DepartmentPayload } from "@/types/domain/department";
import { DepartmentSchema, type DepartmentFormValues } from "@/validations/department";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface DepartmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
}

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
  headId: values.headId,
  isActive: values.isActive,
  ...grant,
});

export function DepartmentFormModal({ open, onOpenChange, department }: DepartmentFormModalProps) {
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

  const grant = useAccessGrant(open ? (department?._id ?? "new") : null, department);
  const canManageAccess = useModulePermission("/configuration/roles").canEdit;

  const headChoices = React.useMemo(
    () =>
      employeeOptions.map((option) => ({
        value: option._id,
        label: option.employeeCode ? `${option.name} (${option.employeeCode})` : option.name,
      })),
    [employeeOptions]
  );

  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      const body = toPayload(values, {
        modulePermissions: grant.permissions,
        roleIds: grant.roleIds,
      });

      if (department) {
        await updateDepartment({ id: department._id, body }).unwrap();
        toast.success("Department updated");
      } else {
        await createDepartment(body).unwrap();
        toast.success("Department created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the department");
    }
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <Tabs defaultValue="details" className="gap-4">
                <TabsList>
                  <TabsTrigger value="details" className="cursor-pointer">
                    Details
                  </TabsTrigger>
                  {canManageAccess && (
                    <TabsTrigger value="access" className="cursor-pointer">
                      Access ({grant.roleIds.length + grant.grantedMenuCount})
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="details" className="flex flex-col gap-4">
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
                    placeholder="Pick an employee"
                    options={headChoices}
                    searchable
                    description="Every department needs a head. Pick the employee who runs it."
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
                </TabsContent>

                {canManageAccess && (
                  <TabsContent value="access">
                    <AccessGrantEditor
                      roleIds={grant.roleIds}
                      onRoleIdsChange={grant.setRoleIds}
                      permissions={grant.permissions}
                      onPermissionsChange={grant.setPermissions}
                      rolesHint="Every employee in this department inherits these roles."
                      permissionsHint="Extra menus every employee in this department can reach."
                    />
                  </TabsContent>
                )}
              </Tabs>
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
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
