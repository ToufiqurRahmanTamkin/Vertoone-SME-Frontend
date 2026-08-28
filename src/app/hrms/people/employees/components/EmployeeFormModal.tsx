import {
  FormDate,
  FormInput,
  FormMultiSelect,
  FormPhone,
  FormSelect,
  FormTextarea,
  type MultiSelectOption,
} from "@/components/shared/form-fields";
import { FileUploader } from "@/components/shared/file-uploader";
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
import { Separator } from "@/components/ui/separator";
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
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { useGetSystemConfigQuery } from "@/redux/apis/systemConfigApis";
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

const emptyValues = (currency: string): EmployeeFormValues => ({
  employeeCode: "",
  firstName: "",
  lastName: "",
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
  employmentType: "FULL_TIME",
  workLocation: "",
  joiningDate: "",
  confirmationDate: "",
  resignationDate: "",
  reportsToId: "",
  status: "ACTIVE",
  salaryAmount: 0,
  salaryCurrency: currency,
  bankName: "",
  branchName: "",
  accountName: "",
  accountNumber: "",
  routingNumber: "",
  tagIds: [],
  notes: "",
});

const toFormValues = (employee: Employee): EmployeeFormValues => ({
  employeeCode: employee.employeeCode,
  firstName: employee.firstName,
  lastName: employee.lastName,
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
  employmentType: employee.employmentType,
  workLocation: employee.workLocation ?? "",
  joiningDate: employee.joiningDate,
  confirmationDate: employee.confirmationDate ?? "",
  resignationDate: employee.resignationDate ?? "",
  reportsToId: employee.reportsTo?._id ?? "",
  status: employee.status,
  salaryAmount: employee.salary?.amount ?? 0,
  salaryCurrency: employee.salary?.currency ?? "",
  bankName: employee.bankAccount?.bankName ?? "",
  branchName: employee.bankAccount?.branchName ?? "",
  accountName: employee.bankAccount?.accountName ?? "",
  accountNumber: employee.bankAccount?.accountNumber ?? "",
  routingNumber: employee.bankAccount?.routingNumber ?? "",
  tagIds: employee.tagIds ?? [],
  notes: employee.notes ?? "",
});

const toPayload = (values: EmployeeFormValues): EmployeePayload => ({
  employeeCode: values.employeeCode || undefined,
  firstName: values.firstName,
  lastName: values.lastName,
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
  employmentType: values.employmentType,
  workLocation: values.workLocation,
  joiningDate: values.joiningDate,
  confirmationDate: values.confirmationDate || null,
  resignationDate: values.resignationDate || null,
  reportsToId: values.reportsToId || null,
  status: values.status,
  salary: {
    amount: values.salaryAmount === "" ? 0 : values.salaryAmount,
    currency: values.salaryCurrency,
  },
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {children}
      </p>
      <Separator className="mt-2" />
    </div>
  );
}

export function EmployeeFormModal({ open, onOpenChange, employee }: EmployeeFormModalProps) {
  const isEdit = Boolean(employee);

  const { data: config } = useGetSystemConfigQuery();
  const { data: tagOptions = [] } = useGetTagOptionsQuery({ scope: "EMPLOYEE" });
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: departmentOptions = [] } = useGetDepartmentOptionsQuery();
  const { data: designationOptions = [] } = useGetDesignationOptionsQuery();

  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const isSaving = isCreating || isUpdating;

  const defaultCurrency = config?.defaultCurrency ?? "BDT";

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(EmployeeSchema),
    defaultValues: emptyValues(defaultCurrency),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(employee ? toFormValues(employee) : emptyValues(defaultCurrency));
  }, [open, employee, defaultCurrency, form]);

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
        await updateEmployee({ id: employee._id, body: toPayload(values) }).unwrap();
        toast.success("Employee updated");
      } else {
        await createEmployee(toPayload(values)).unwrap();
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

              <SectionTitle>Identity</SectionTitle>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="firstName"
                  label="First name"
                  placeholder="Jane"
                />
                <FormInput
                  control={form.control}
                  name="lastName"
                  label="Last name"
                  placeholder="Rahman"
                />
                <FormInput
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="jane@company.com"
                />
                <FormPhone control={form.control} name="phone" label="Phone" />
                <FormInput
                  control={form.control}
                  name="employeeCode"
                  label="Employee ID"
                  placeholder="Left blank, we generate one"
                />
                <FormPhone
                  control={form.control}
                  name="alternatePhone"
                  label="Alternate phone"
                />
              </div>

              <FileUploader
                value={form.watch("photoUrl")}
                publicId={form.watch("photoPublicId")}
                folder="avatars"
                label="Photo"
                description="Square image, at least 256x256."
                onChange={(asset) => {
                  form.setValue("photoUrl", asset?.url ?? "", { shouldDirty: true });
                  form.setValue("photoPublicId", asset?.publicId ?? "", { shouldDirty: true });
                }}
              />

              <SectionTitle>Personal</SectionTitle>

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

              <SectionTitle>Emergency contact</SectionTitle>

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

              <SectionTitle>Job</SectionTitle>

              <div className="grid gap-4 sm:grid-cols-2">
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
                <FormSelect
                  control={form.control}
                  name="employmentType"
                  label="Employment type"
                  options={EMPLOYMENT_TYPE_OPTIONS}
                />
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
                  name="reportsToId"
                  label="Reports to"
                  placeholder="Nobody"
                  options={managerOptions}
                  searchable
                />
              </div>

              <SectionTitle>Payroll</SectionTitle>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="salaryAmount"
                  label="Gross salary"
                  type="number"
                />
                <FormInput control={form.control} name="salaryCurrency" label="Currency" />
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

              <SectionTitle>Tags and notes</SectionTitle>

              <FormMultiSelect
                control={form.control}
                name="tagIds"
                label="Tags"
                placeholder="No tags"
                options={tagChoices}
                emptyText="No tags yet. Create them under CRM · Tags."
                description="Tags are shared across modules and can be used to filter this list."
              />

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Anything worth recording about this employee."
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
