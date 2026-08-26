import {
  FormCheckbox,
  FormInput,
  FormPhone,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
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
import { EMPLOYEE_RANGE_LABELS, toOptions } from "@/constant";
import type { EmployeeRange } from "@/types/domain/company";
import type { SisterConcern } from "@/types/domain/organization";
import {
  SisterConcernSchema,
  type SisterConcernFormValues,
} from "@/validations/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";

interface SisterConcernFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent for a create. */
  concern?: SisterConcern | null;
  onSubmit: (values: SisterConcernFormValues) => void;
}

const EMPLOYEE_RANGE_OPTIONS = toOptions(EMPLOYEE_RANGE_LABELS);

const emptyValues: SisterConcernFormValues = {
  name: "",
  registrationNo: "",
  industry: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  employeeRange: "1-50",
  hrmsEnabled: true,
  smeEnabled: true,
  crmEnabled: false,
  isActive: true,
  notes: "",
};

const toFormValues = (concern: SisterConcern): SisterConcernFormValues => ({
  name: concern.name,
  registrationNo: concern.registrationNo,
  industry: concern.industry,
  email: concern.email,
  phone: concern.phone,
  website: concern.website,
  address: concern.address,
  employeeRange: concern.employeeRange,
  hrmsEnabled: concern.hrmsEnabled,
  smeEnabled: concern.smeEnabled,
  crmEnabled: concern.crmEnabled,
  isActive: concern.isActive,
  notes: concern.notes,
});

export function SisterConcernFormModal({
  open,
  onOpenChange,
  concern,
  onSubmit,
}: SisterConcernFormModalProps) {
  const isEdit = Boolean(concern);

  const form = useForm<SisterConcernFormValues>({
    resolver: zodResolver(SisterConcernSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(concern ? toFormValues(concern) : emptyValues);
  }, [open, concern, form]);

  const handleSubmit = (values: SisterConcernFormValues) => {
    onSubmit({ ...values, employeeRange: values.employeeRange as EmployeeRange });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit sister concern" : "New sister concern"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this company in your group."
              : "Register another company you own. It gets its own workspace under the same account."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Company name"
                  placeholder="Vertoone Logistics Ltd."
                />
                <FormInput
                  control={form.control}
                  name="registrationNo"
                  label="Registration no."
                  placeholder="C-123456"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="industry"
                  label="Industry"
                  placeholder="Freight & logistics"
                />
                <FormSelect
                  control={form.control}
                  name="employeeRange"
                  label="Company size"
                  options={EMPLOYEE_RANGE_OPTIONS}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="email"
                  label="Company email"
                  type="email"
                  placeholder="hello@company.com"
                />
                <FormPhone control={form.control} name="phone" label="Phone" />
              </div>

              <FormInput
                control={form.control}
                name="website"
                label="Website"
                placeholder="https://company.com"
              />

              <FormInput
                control={form.control}
                name="address"
                label="Address"
                placeholder="House 12, Road 5, Banani, Dhaka"
              />

              <div className="space-y-3 rounded-lg border p-3">
                <p className="text-sm font-medium leading-none">Modules</p>
                <p className="text-xs text-muted-foreground">
                  Which parts of the platform this company gets access to.
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  <FormCheckbox control={form.control} name="hrmsEnabled" label="HRMS" />
                  <FormCheckbox control={form.control} name="smeEnabled" label="SME" />
                  <FormCheckbox control={form.control} name="crmEnabled" label="CRM" />
                </div>
              </div>

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Anything worth remembering about this company."
              />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive companies stay on record but cannot be used"
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                {isEdit ? "Save changes" : "Add company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
