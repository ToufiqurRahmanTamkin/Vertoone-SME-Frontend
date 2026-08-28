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

const toPayload = (values: DepartmentFormValues): DepartmentPayload => ({
  name: values.name,
  code: values.code || undefined,
  description: values.description,
  headId: values.headId || null,
  isActive: values.isActive,
});

export function DepartmentFormModal({
  open,
  onOpenChange,
  department,
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
      if (department) {
        await updateDepartment({ id: department._id, body: toPayload(values) }).unwrap();
        toast.success("Department updated");
      } else {
        await createDepartment(toPayload(values)).unwrap();
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit department" : "New department"}</DialogTitle>
          <DialogDescription>
            Departments group employees. An employee can belong to more than one.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
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
                placeholder="Nobody yet"
                options={headChoices}
                searchable
                description="Optional. Pick the employee who runs this department."
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
