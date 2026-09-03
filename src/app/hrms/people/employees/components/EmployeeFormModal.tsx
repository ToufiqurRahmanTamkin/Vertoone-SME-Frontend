import {
  FormDate,
  FormInput,
  FormMultiSelect,
  FormPassword,
  FormPhone,
  FormSelect,
  FormSwitch,
  FormTextarea,
  type MultiSelectOption,
} from "@/components/shared/form-fields";
import { AccessGrantEditor } from "@/components/permission/access-grant-editor";
import { FileUploader } from "@/components/shared/file-uploader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  BLOOD_GROUP_LABELS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  toOptions,
} from "@/constant";
import {
  useCreateEmployeeMutation,
  useGetEmployeeOptionsQuery,
  useUpdateEmployeeMutation,
} from "@/redux/apis/employeeApis";
import { useGetDepartmentOptionsQuery } from "@/redux/apis/departmentApis";
import { useGetDesignationOptionsQuery } from "@/redux/apis/designationApis";
import { useGetEmployeeRoleOptionsQuery } from "@/redux/apis/employeeRoleApis";
import { useGetConcernsQuery } from "@/redux/apis/concernApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { useAccessGrant } from "@/hooks/use-access-grant";
import type { ModulePermissionMap } from "@/types/domain/permission";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Employee, EmployeePayload } from "@/types/domain/employee";
import { EmployeeSchema, type EmployeeFormValues } from "@/validations/employee";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

const STATUS_OPTIONS = toOptions(EMPLOYEE_STATUS_LABELS);
const EMPLOYMENT_TYPE_OPTIONS = toOptions(EMPLOYMENT_TYPE_LABELS);
const GENDER_OPTIONS = toOptions(GENDER_LABELS);
const MARITAL_STATUS_OPTIONS = toOptions(MARITAL_STATUS_LABELS);
const BLOOD_GROUP_OPTIONS = toOptions(BLOOD_GROUP_LABELS);

const emptyValues = (): EmployeeFormValues => ({
  fullName: "",
  email: "",
  phone: "",
  alternatePhone: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  bloodGroup: "",
  nationalId: "",
  photoUrl: "",
  photoPublicId: "",
  presentAddress: "",
  permanentAddress: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
  departmentIds: [],
  designationIds: [],
  employeeRoleIds: [],
  employmentType: "FULL_TIME",
  workLocation: "",
  joiningDate: "",
  confirmationDate: "",
  resignationDate: "",
  supervisorId: "",
  lineManagerId: "",
  concernId: "",
  canSignIn: false,
  accessPassword: "",
  status: "ACTIVE",
  bankName: "",
  branchName: "",
  accountName: "",
  accountNumber: "",
  routingNumber: "",
  tagIds: [],
  notes: "",
});

const toFormValues = (employee: Employee): EmployeeFormValues => ({
  fullName: employee.fullName,
  email: employee.email,
  phone: employee.phone,
  alternatePhone: employee.alternatePhone ?? "",
  dateOfBirth: employee.dateOfBirth ?? "",
  gender: employee.gender ?? "",
  maritalStatus: employee.maritalStatus ?? "",
  bloodGroup: employee.bloodGroup ?? "",
  nationalId: employee.nationalId ?? "",
  photoUrl: employee.photoUrl ?? "",
  photoPublicId: employee.photoPublicId ?? "",
  presentAddress: employee.presentAddress ?? "",
  permanentAddress: employee.permanentAddress ?? "",
  emergencyContactName: employee.emergencyContact?.name ?? "",
  emergencyContactRelationship: employee.emergencyContact?.relationship ?? "",
  emergencyContactPhone: employee.emergencyContact?.phone ?? "",
  departmentIds: employee.departmentIds ?? [],
  designationIds: employee.designationIds ?? [],
  employeeRoleIds: employee.employeeRoleIds ?? [],
  employmentType: employee.employmentType,
  workLocation: employee.workLocation ?? "",
  joiningDate: employee.joiningDate,
  confirmationDate: employee.confirmationDate ?? "",
  resignationDate: employee.resignationDate ?? "",
  supervisorId: employee.supervisorId ?? "",
  lineManagerId: employee.lineManagerId ?? "",
  concernId: employee.concernId ?? "",
  canSignIn: employee.access?.canSignIn ?? false,
  accessPassword: "",
  status: employee.status,
  bankName: employee.bankAccount?.bankName ?? "",
  branchName: employee.bankAccount?.branchName ?? "",
  accountName: employee.bankAccount?.accountName ?? "",
  accountNumber: employee.bankAccount?.accountNumber ?? "",
  routingNumber: employee.bankAccount?.routingNumber ?? "",
  tagIds: employee.tagIds ?? [],
  notes: employee.notes ?? "",
});

const toPayload = (
  values: EmployeeFormValues,
  modulePermissions: ModulePermissionMap,
  roleIds: string[]
): EmployeePayload => ({
  fullName: values.fullName,
  email: values.email,
  phone: values.phone,
  alternatePhone: values.alternatePhone,
  dateOfBirth: values.dateOfBirth || null,
  gender: values.gender || null,
  maritalStatus: values.maritalStatus || null,
  bloodGroup: values.bloodGroup || null,
  nationalId: values.nationalId,
  photoUrl: values.photoUrl || null,
  photoPublicId: values.photoPublicId || null,
  presentAddress: values.presentAddress,
  permanentAddress: values.permanentAddress,
  emergencyContact: {
    name: values.emergencyContactName,
    relationship: values.emergencyContactRelationship,
    phone: values.emergencyContactPhone,
  },
  departmentIds: values.departmentIds,
  designationIds: values.designationIds,
  employeeRoleIds: values.employeeRoleIds,
  employmentType: values.employmentType,
  workLocation: values.workLocation,
  joiningDate: values.joiningDate || undefined,
  confirmationDate: values.confirmationDate || null,
  resignationDate: values.resignationDate || null,
  supervisorId: values.supervisorId || null,
  lineManagerId: values.lineManagerId || null,
  concernId: values.concernId || null,
  access: {
    canSignIn: values.canSignIn,
    ...(values.accessPassword ? { password: values.accessPassword } : {}),
    modulePermissions,
    roleIds,
  },
  status: values.status,
  bankAccount: {
    bankName: values.bankName,
    branchName: values.branchName,
    accountName: values.accountName,
    accountNumber: values.accountNumber,
    routingNumber: values.routingNumber,
  },
  tagIds: values.tagIds,
  notes: values.notes,
});

export function EmployeeFormModal({ open, onOpenChange, employee }: EmployeeFormModalProps) {
  const isEdit = Boolean(employee);

  const { data: tagOptions = [] } = useGetTagOptionsQuery();
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: departmentOptions = [] } = useGetDepartmentOptionsQuery();
  const { data: designationOptions = [] } = useGetDesignationOptionsQuery();
  const { data: employeeRoleOptions = [] } = useGetEmployeeRoleOptionsQuery();
  const { data: concernList } = useGetConcernsQuery({ limit: 100 });

  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(EmployeeSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(employee ? toFormValues(employee) : emptyValues());
  }, [open, employee, form]);

  const grant = useAccessGrant(open ? (employee?._id ?? "new") : null, employee?.access);

  const concernOptions = React.useMemo(
    () =>
      (concernList?.data ?? []).map((concern) => ({
        value: concern._id,
        label: concern.code ? `${concern.name} (${concern.code})` : concern.name,
      })),
    [concernList]
  );

  const canSignIn = form.watch("canSignIn");
  const hasLogin = Boolean(employee?.access?.userId);

  const managerOptions = React.useMemo(
    () =>
      employeeOptions
        .filter((option) => option._id !== employee?._id)
        .map((option) => ({
          value: option._id,
          label: option.employeeCode ? `${option.name} (${option.employeeCode})` : option.name,
        })),
    [employeeOptions, employee?._id]
  );

  const departmentChoices = React.useMemo<MultiSelectOption[]>(
    () =>
      departmentOptions.map((department) => ({
        value: department._id,
        label: department.name,
        hint: department.code,
      })),
    [departmentOptions]
  );

  const designationChoices = React.useMemo<MultiSelectOption[]>(
    () =>
      designationOptions.map((designation) => ({
        value: designation._id,
        label: designation.name,
        hint: designation.code,
      })),
    [designationOptions]
  );

  const employeeRoleChoices = React.useMemo<MultiSelectOption[]>(
    () =>
      employeeRoleOptions.map((role) => ({
        value: role._id,
        label: role.name,
      })),
    [employeeRoleOptions]
  );

  const tagChoices = React.useMemo<MultiSelectOption[]>(
    () =>
      tagOptions.map((tag) => ({
        value: tag._id,
        label: tag.name,
        color: tag.color,
      })),
    [tagOptions]
  );

  const missingOrgData = departmentOptions.length === 0 || designationOptions.length === 0;

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      if (employee) {
        await updateEmployee({
          id: employee._id,
          body: toPayload(values, grant.permissions, grant.roleIds),
        }).unwrap();
        toast.success("Employee updated");
      } else {
        await createEmployee(toPayload(values, grant.permissions, grant.roleIds)).unwrap();
        toast.success("Employee added");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the employee");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit employee" : "New employee"}</DialogTitle>
          <DialogDescription>
            Email and phone number must be unique across your company.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              {missingOrgData && (
                <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
                  Every employee needs at least one department and one designation. Create them
                  under HRMS - Departments and HRMS - Designations first.
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="fullName"
                  label="Full name"
                  placeholder="Ayesha Rahman"
                />
                <FormInput
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="ayesha@company.com"
                />
                <FormPhone control={form.control} name="phone" label="Phone" />
                <FormSelect
                  control={form.control}
                  name="employmentType"
                  label="Employment type"
                  options={EMPLOYMENT_TYPE_OPTIONS}
                />
                <FormMultiSelect
                  control={form.control}
                  name="departmentIds"
                  label="Departments"
                  placeholder="Pick at least one"
                  options={departmentChoices}
                  emptyText="No departments yet. Create them under HRMS - Departments."
                />
                <FormMultiSelect
                  control={form.control}
                  name="designationIds"
                  label="Designations"
                  placeholder="Pick at least one"
                  options={designationChoices}
                  emptyText="No designations yet. Create them under HRMS - Designations."
                />
                <FormMultiSelect
                  control={form.control}
                  name="employeeRoleIds"
                  label="Employee roles"
                  placeholder="No employee role"
                  description="What this person can reach in the app once they can sign in."
                  options={employeeRoleChoices}
                  emptyText="No employee roles yet. Create them under HRMS Settings - Employee Roles & Permissions."
                  className="sm:col-span-2"
                />
              </div>

              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  Employee ID{" "}
                  <span className="font-medium text-foreground">{employee?.employeeCode}</span> is
                  generated automatically and cannot be changed.
                </p>
              )}

              <Accordion type="multiple" className="rounded-lg border px-3">
                <AccordionItem value="personal">
                  <AccordionTrigger className="text-sm">Personal details</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 pb-4">
                    <FileUploader
                      value={form.watch("photoUrl")}
                      publicId={form.watch("photoPublicId")}
                      folder="avatars"
                      label="Photo"
                      description="Square image, at least 256x256."
                      onChange={(asset) => {
                        form.setValue("photoUrl", asset?.url ?? "", { shouldDirty: true });
                        form.setValue("photoPublicId", asset?.publicId ?? "", {
                          shouldDirty: true,
                        });
                      }}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormDate
                        control={form.control}
                        name="dateOfBirth"
                        label="Date of birth"
                        dateOnly
                        disableFuture
                      />
                      <FormSelect
                        control={form.control}
                        name="gender"
                        label="Gender"
                        placeholder="Not set"
                        options={GENDER_OPTIONS}
                      />
                      <FormSelect
                        control={form.control}
                        name="maritalStatus"
                        label="Marital status"
                        placeholder="Not set"
                        options={MARITAL_STATUS_OPTIONS}
                      />
                      <FormSelect
                        control={form.control}
                        name="bloodGroup"
                        label="Blood group"
                        placeholder="Not set"
                        options={BLOOD_GROUP_OPTIONS}
                      />
                      <FormInput
                        control={form.control}
                        name="nationalId"
                        label="National ID"
                        placeholder="Optional"
                      />
                      <FormInput
                        control={form.control}
                        name="workLocation"
                        label="Work location"
                        placeholder="Head office"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormTextarea
                        control={form.control}
                        name="presentAddress"
                        label="Present address"
                        placeholder="Where they live now"
                      />
                      <FormTextarea
                        control={form.control}
                        name="permanentAddress"
                        label="Permanent address"
                        placeholder="Home address"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="emergency">
                  <AccordionTrigger className="text-sm">Emergency contact</AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <FormInput
                        control={form.control}
                        name="emergencyContactName"
                        label="Name"
                        placeholder="Optional"
                      />
                      <FormInput
                        control={form.control}
                        name="emergencyContactRelationship"
                        label="Relationship"
                        placeholder="Spouse"
                      />
                      <FormPhone
                        control={form.control}
                        name="emergencyContactPhone"
                        label="Phone"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="job">
                  <AccordionTrigger className="text-sm">Job details</AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormSelect
                        control={form.control}
                        name="status"
                        label="Status"
                        options={STATUS_OPTIONS}
                      />
                      <FormDate
                        control={form.control}
                        name="joiningDate"
                        label="Joining date"
                        description="Today is used when left blank."
                        dateOnly
                      />
                      <FormDate
                        control={form.control}
                        name="confirmationDate"
                        label="Confirmation date"
                        dateOnly
                      />
                      <FormDate
                        control={form.control}
                        name="resignationDate"
                        label="Resignation date"
                        dateOnly
                      />
                      <FormSelect
                        control={form.control}
                        name="supervisorId"
                        label="Supervisor"
                        placeholder="Pick an employee"
                        options={managerOptions}
                        searchable
                      />
                      <FormSelect
                        control={form.control}
                        name="lineManagerId"
                        label="Line manager"
                        placeholder="Pick an employee"
                        description="May be the same person as the supervisor."
                        options={managerOptions}
                        searchable
                      />
                      <FormSelect
                        control={form.control}
                        name="concernId"
                        label="Belongs to"
                        placeholder="The organization"
                        description="Leave blank when the employee sits with the organization itself."
                        options={concernOptions}
                        searchable
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="access">
                  <AccordionTrigger className="text-sm">Workspace access</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 pb-4">
                    <FormSwitch
                      control={form.control}
                      name="canSignIn"
                      label="Can sign in"
                      description="Creates a sign-in for this employee using their work email."
                    />

                    {canSignIn && (
                      <div className="space-y-4">
                        <FormPassword
                          control={form.control}
                          name="accessPassword"
                          label={hasLogin ? "New password" : "Password"}
                          description={
                            hasLogin
                              ? "Leave blank to keep the current password. Changing it signs them out everywhere."
                              : "At least 8 characters. They sign in with their work email."
                          }
                          className="sm:max-w-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          They also inherit whatever their departments, designations and teams
                          grant. Anything your plan does not include stays out of reach.
                        </p>
                        <AccessGrantEditor
                          roleIds={grant.roleIds}
                          onRoleIdsChange={grant.setRoleIds}
                          permissions={grant.permissions}
                          onPermissionsChange={grant.setPermissions}
                          rolesHint="Roles handed to this employee directly."
                          permissionsHint="Extra menus granted only to this employee."
                        />
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="bank">
                  <AccordionTrigger className="text-sm">Bank details</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 pb-4">
                    <p className="text-xs text-muted-foreground">
                      Salary is not set here. Record it under HRMS - Payroll - Salaries, where every
                      revision is kept as history.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput
                        control={form.control}
                        name="bankName"
                        label="Bank"
                        placeholder="Optional"
                      />
                      <FormInput
                        control={form.control}
                        name="branchName"
                        label="Branch"
                        placeholder="Optional"
                      />
                      <FormInput
                        control={form.control}
                        name="accountName"
                        label="Account name"
                        placeholder="Optional"
                      />
                      <FormInput
                        control={form.control}
                        name="accountNumber"
                        label="Account number"
                        placeholder="Optional"
                      />
                      <FormInput
                        control={form.control}
                        name="routingNumber"
                        label="Routing number"
                        placeholder="Optional"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tags" className="border-b-0">
                  <AccordionTrigger className="text-sm">Tags and notes</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 pb-4">
                    <FormMultiSelect
                      control={form.control}
                      name="tagIds"
                      label="Tags"
                      placeholder="No tags"
                      options={tagChoices}
                      emptyText="No tags yet. Create them under CRM - Tags."
                      description="Tags are shared across modules and can be used to filter this list."
                    />
                    <FormTextarea
                      control={form.control}
                      name="notes"
                      label="Notes"
                      placeholder="Anything worth recording about this employee."
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
              <Button type="submit" disabled={isSaving || missingOrgData}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add employee"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
