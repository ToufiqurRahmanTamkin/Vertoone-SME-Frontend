import {
  FormChips,
  FormDate,
  FormInput,
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
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import {
  useCreateJobOpeningMutation,
  useUpdateJobOpeningMutation,
} from "@/redux/apis/jobOpeningApis";
import { useGetDepartmentOptionsQuery } from "@/redux/apis/departmentApis";
import { useGetDesignationOptionsQuery } from "@/redux/apis/designationApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  JOB_EMPLOYMENT_TYPES,
  JOB_EMPLOYMENT_TYPE_LABELS,
  JOB_EXPERIENCE_LEVELS,
  JOB_EXPERIENCE_LEVEL_LABELS,
  JOB_OPENING_PRIORITIES,
  JOB_OPENING_PRIORITY_LABELS,
  JOB_OPENING_STATUSES,
  JOB_OPENING_STATUS_LABELS,
  JOB_WORKPLACE_TYPES,
  JOB_WORKPLACE_TYPE_LABELS,
  type JobOpening,
} from "@/types/domain/jobOpening";
import { JobOpeningSchema, type JobOpeningFormValues } from "@/validations/jobOpening";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface JobOpeningFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opening?: JobOpening | null;
}

const STEPS: readonly StepperStep[] = [
  { id: "role", label: "The role" },
  { id: "details", label: "What it involves" },
  { id: "hiring", label: "Hiring plan" },
];

const STEP_FIELDS: readonly (keyof JobOpeningFormValues)[][] = [
  [
    "title",
    "code",
    "departmentId",
    "designationId",
    "employmentType",
    "workplaceType",
    "experienceLevel",
    "location",
  ],
  ["summary", "description", "responsibilities", "requirements", "skills"],
  [
    "status",
    "priority",
    "openings",
    "filledCount",
    "hiringManagerId",
    "recruiterId",
    "salaryMin",
    "salaryMax",
    "salaryIsVisible",
    "openedAt",
    "closingAt",
    "isPublished",
  ],
];

const LAST_STEP = STEPS.length - 1;

const NONE = "__none__";

const optionsOf = <T extends string>(values: readonly T[], labels: Record<T, string>) =>
  values.map((value) => ({ value, label: labels[value] }));

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.includes(field as keyof JobOpeningFormValues)
  );
  return index === -1 ? 0 : index;
};

const emptyValues = (): JobOpeningFormValues => ({
  title: "",
  code: "",
  departmentId: NONE,
  designationId: NONE,
  hiringManagerId: NONE,
  recruiterId: NONE,
  status: "DRAFT",
  employmentType: "FULL_TIME",
  workplaceType: "ON_SITE",
  experienceLevel: "MID",
  priority: "NORMAL",
  location: "",
  openings: 1,
  filledCount: 0,
  summary: "",
  description: "",
  responsibilities: "",
  requirements: "",
  skills: [],
  salaryMin: 0,
  salaryMax: 0,
  salaryIsVisible: false,
  openedAt: "",
  closingAt: "",
  isPublished: false,
});

const toFormValues = (opening: JobOpening): JobOpeningFormValues => ({
  title: opening.title,
  code: opening.code,
  departmentId: opening.departmentId ?? NONE,
  designationId: opening.designationId ?? NONE,
  hiringManagerId: opening.hiringManagerId ?? NONE,
  recruiterId: opening.recruiterId ?? NONE,
  status: opening.status,
  employmentType: opening.employmentType,
  workplaceType: opening.workplaceType,
  experienceLevel: opening.experienceLevel,
  priority: opening.priority,
  location: opening.location,
  openings: opening.openings,
  filledCount: opening.filledCount,
  summary: opening.summary,
  description: opening.description,
  responsibilities: opening.responsibilities,
  requirements: opening.requirements,
  skills: opening.skills,
  salaryMin: opening.salary.min,
  salaryMax: opening.salary.max,
  salaryIsVisible: opening.salary.isVisible,
  openedAt: opening.openedAt ?? "",
  closingAt: opening.closingAt ?? "",
  isPublished: opening.isPublished,
});

const refOf = (value: string): string | null => (value === NONE || !value ? null : value);

export function JobOpeningFormModal({
  open,
  onOpenChange,
  opening,
}: JobOpeningFormModalProps) {
  const [session, setSession] = React.useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setSession((current) => current + 1);
        onOpenChange(next);
      }}
    >
      {open && (
        <JobOpeningBody key={session} open={open} onOpenChange={onOpenChange} opening={opening} />
      )}
    </Dialog>
  );
}

function JobOpeningBody({ open, onOpenChange, opening }: JobOpeningFormModalProps) {
  const [createOpening, { isLoading: isCreating }] = useCreateJobOpeningMutation();
  const [updateOpening, { isLoading: isUpdating }] = useUpdateJobOpeningMutation();
  const isSaving = isCreating || isUpdating;

  const { data: departments = [] } = useGetDepartmentOptionsQuery(undefined, { skip: !open });
  const { data: designations = [] } = useGetDesignationOptionsQuery(undefined, { skip: !open });
  const { data: employees = [] } = useGetEmployeeOptionsQuery(undefined, { skip: !open });

  const departmentOptions = React.useMemo(
    () => [
      { value: NONE, label: "No department" },
      ...departments.map((entry) => ({ value: entry._id, label: entry.name })),
    ],
    [departments]
  );

  const designationOptions = React.useMemo(
    () => [
      { value: NONE, label: "No designation" },
      ...designations.map((entry) => ({ value: entry._id, label: entry.name })),
    ],
    [designations]
  );

  const employeeOptions = React.useMemo(
    () => [
      { value: NONE, label: "Nobody yet" },
      ...employees.map((entry) => ({ value: entry._id, label: entry.name })),
    ],
    [employees]
  );

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);

  const form = useForm<JobOpeningFormValues>({
    resolver: zodResolver(JobOpeningSchema),
    defaultValues: opening ? toFormValues(opening) : emptyValues(),
  });

  const status = useWatch({ control: form.control, name: "status" });

  const onSubmit = async (values: JobOpeningFormValues) => {
    const parsed = JobOpeningSchema.parse(values);

    const body = {
      title: parsed.title,
      code: parsed.code,
      departmentId: refOf(parsed.departmentId),
      designationId: refOf(parsed.designationId),
      hiringManagerId: refOf(parsed.hiringManagerId),
      recruiterId: refOf(parsed.recruiterId),
      status: parsed.status,
      employmentType: parsed.employmentType,
      workplaceType: parsed.workplaceType,
      experienceLevel: parsed.experienceLevel,
      priority: parsed.priority,
      location: parsed.location,
      openings: parsed.openings,
      filledCount: parsed.filledCount,
      summary: parsed.summary,
      description: parsed.description,
      responsibilities: parsed.responsibilities,
      requirements: parsed.requirements,
      skills: parsed.skills,
      salary: {
        min: parsed.salaryMin,
        max: parsed.salaryMax,
        isVisible: parsed.salaryIsVisible,
      },
      openedAt: parsed.openedAt || null,
      closingAt: parsed.closingAt || null,
      isPublished: parsed.isPublished,
    };

    try {
      if (opening) {
        await updateOpening({ id: opening._id, body }).unwrap();
        toast.success("Job opening updated");
      } else {
        await createOpening(body).unwrap();
        toast.success("Job opening created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the job opening");
    }
  };

  const goToStep = (next: number) => {
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const isValid = fields.length === 0 || (await form.trigger(fields, { shouldFocus: true }));
    if (!isValid) return;
    goToStep(Math.min(step + 1, LAST_STEP));
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

  return (
    <DialogContent className="sm:max-w-3xl">
        <Form {...form}>
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>{opening ? "Edit job opening" : "New job opening"}</DialogTitle>
              <DialogDescription>
                A vacancy you are hiring for, and everything a candidate needs to know about it.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-6">
              <Stepper
                steps={STEPS}
                current={step}
                reachable={furthestStep}
                onStepSelect={setStep}
              />

              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                    <FormInput
                      control={form.control}
                      name="title"
                      label="Job title"
                      placeholder="Senior Warehouse Supervisor"
                    />
                    <FormInput
                      control={form.control}
                      name="code"
                      label="Reference"
                      placeholder="Generated from the title"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      control={form.control}
                      name="departmentId"
                      label="Department"
                      options={departmentOptions}
                    />
                    <FormSelect
                      control={form.control}
                      name="designationId"
                      label="Designation"
                      options={designationOptions}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormSelect
                      control={form.control}
                      name="employmentType"
                      label="Employment type"
                      options={optionsOf(JOB_EMPLOYMENT_TYPES, JOB_EMPLOYMENT_TYPE_LABELS)}
                    />
                    <FormSelect
                      control={form.control}
                      name="workplaceType"
                      label="Where"
                      options={optionsOf(JOB_WORKPLACE_TYPES, JOB_WORKPLACE_TYPE_LABELS)}
                    />
                    <FormSelect
                      control={form.control}
                      name="experienceLevel"
                      label="Seniority"
                      options={optionsOf(JOB_EXPERIENCE_LEVELS, JOB_EXPERIENCE_LEVEL_LABELS)}
                    />
                  </div>

                  <FormInput
                    control={form.control}
                    name="location"
                    label="Location"
                    placeholder="Dhaka, Bangladesh"
                    description="Where the person will be based. Leave blank for fully remote."
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <FormTextarea
                    control={form.control}
                    name="summary"
                    label="Short summary"
                    placeholder="One or two lines a candidate sees first"
                  />
                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="About the role"
                    placeholder="What the team does and where this role fits"
                  />
                  <FormTextarea
                    control={form.control}
                    name="responsibilities"
                    label="Responsibilities"
                    placeholder="One per line"
                  />
                  <FormTextarea
                    control={form.control}
                    name="requirements"
                    label="Requirements"
                    placeholder="One per line"
                  />
                  <FormChips
                    control={form.control}
                    name="skills"
                    label="Skills"
                    placeholder="Type a skill and press Enter"
                    description="Used to match candidates later."
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      control={form.control}
                      name="status"
                      label="Status"
                      options={optionsOf(JOB_OPENING_STATUSES, JOB_OPENING_STATUS_LABELS)}
                    />
                    <FormSelect
                      control={form.control}
                      name="priority"
                      label="Priority"
                      options={optionsOf(JOB_OPENING_PRIORITIES, JOB_OPENING_PRIORITY_LABELS)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="openings"
                      label="Positions"
                      type="number"
                      description="How many people you are hiring for this role."
                    />
                    <FormInput
                      control={form.control}
                      name="filledCount"
                      label="Already filled"
                      type="number"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      control={form.control}
                      name="hiringManagerId"
                      label="Hiring manager"
                      options={employeeOptions}
                      searchable
                    />
                    <FormSelect
                      control={form.control}
                      name="recruiterId"
                      label="Recruiter"
                      options={employeeOptions}
                      searchable
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="salaryMin"
                      label="Salary from"
                      type="number"
                    />
                    <FormInput
                      control={form.control}
                      name="salaryMax"
                      label="Salary to"
                      type="number"
                      description="Leave at 0 to keep the range open."
                    />
                  </div>

                  <FormSwitch
                    control={form.control}
                    name="salaryIsVisible"
                    label="Show the salary to candidates"
                    description="Off keeps the range internal."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormDate
                      control={form.control}
                      name="openedAt"
                      label="Opened on"
                      dateOnly
                    />
                    <FormDate
                      control={form.control}
                      name="closingAt"
                      label="Closes on"
                      dateOnly
                    />
                  </div>

                  <FormSwitch
                    control={form.control}
                    name="isPublished"
                    label="Publish to the careers page"
                    description={
                      status === "OPEN"
                        ? "Candidates can find and apply to this role."
                        : "Only open roles can be published — this stays off until the status is Open."
                    }
                    disabled={status !== "OPEN"}
                  />
                </div>
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
                    {opening ? "Save changes" : "Create opening"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
    </DialogContent>
  );
}
