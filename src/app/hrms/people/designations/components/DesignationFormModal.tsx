import { AccessGrantEditor } from "@/components/permission/access-grant-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
} from "@/redux/apis/designationApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Designation, DesignationPayload } from "@/types/domain/designation";
import { DesignationSchema, type DesignationFormValues } from "@/validations/designation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface DesignationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designation?: Designation | null;
}

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

  const grant = useAccessGrant(open ? (designation?._id ?? "new") : null, designation);
  const canManageAccess = useModulePermission("/configuration/roles").canEdit;

  const onSubmit = async (values: DesignationFormValues) => {
    try {
      const body = toPayload(values, {
        modulePermissions: grant.permissions,
        roleIds: grant.roleIds,
      });

      if (designation) {
        await updateDesignation({ id: designation._id, body }).unwrap();
        toast.success("Designation updated");
      } else {
        await createDesignation(body).unwrap();
        toast.success("Designation created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the designation");
    }
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
                </TabsContent>

                {canManageAccess && (
                  <TabsContent value="access">
                    <AccessGrantEditor
                      roleIds={grant.roleIds}
                      onRoleIdsChange={grant.setRoleIds}
                      permissions={grant.permissions}
                      onPermissionsChange={grant.setPermissions}
                      rolesHint="Every employee holding this designation inherits these roles."
                      permissionsHint="Extra menus every employee with this designation can reach."
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
                {isEdit ? "Save changes" : "Create designation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
