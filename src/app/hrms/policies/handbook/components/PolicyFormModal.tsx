import { AudienceFields } from "@/components/shared/audience-fields";
import { DocumentUploader } from "@/components/shared/document-uploader";
import {
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
import { useCreatePolicyMutation, useUpdatePolicyMutation } from "@/redux/apis/policyApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { DocumentFile } from "@/types/domain/document";
import {
  POLICY_CATEGORIES,
  POLICY_CATEGORY_LABELS,
  POLICY_STATUSES,
  POLICY_STATUS_LABELS,
  type AudienceType,
  type Policy,
  type PolicyFile,
} from "@/types/domain/policy";
import { toNumber } from "@/validations/hrmsSettings";
import { PolicySchema, type PolicyFormValues } from "@/validations/policy";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface PolicyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: Policy | null;
}

const STEPS: readonly StepperStep[] = [
  { id: "details", label: "Details" },
  { id: "content", label: "The policy" },
  { id: "audience", label: "Who it applies to" },
];

const STEP_FIELDS: readonly (keyof PolicyFormValues)[][] = [
  [
    "title",
    "code",
    "category",
    "effectiveFrom",
    "reviewDueAt",
    "status",
    "ownerEmployeeId",
    "summary",
    "requiresAcknowledgement",
    "acknowledgementDueDays",
  ],
  ["content"],
  ["audience", "departmentIds", "designationIds", "employeeIds", "userIds"],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.includes(field as keyof PolicyFormValues)
  );
  return index === -1 ? 0 : index;
};

const CATEGORY_OPTIONS = POLICY_CATEGORIES.map((value) => ({
  value,
  label: POLICY_CATEGORY_LABELS[value],
}));

const STATUS_OPTIONS = POLICY_STATUSES.map((value) => ({
  value,
  label: POLICY_STATUS_LABELS[value],
}));

const emptyValues = (): PolicyFormValues => ({
  title: "",
  code: "",
  category: "HR",
  summary: "",
  content: "",
  status: "DRAFT",
  effectiveFrom: "",
  reviewDueAt: "",
  requiresAcknowledgement: true,
  acknowledgementDueDays: 14,
  ownerEmployeeId: "",
  audience: "ALL",
  departmentIds: [],
  designationIds: [],
  employeeIds: [],
  userIds: [],
});

const toFormValues = (policy: Policy): PolicyFormValues => ({
  title: policy.title,
  code: policy.code,
  category: policy.category,
  summary: policy.summary,
  content: policy.content,
  status: policy.status,
  effectiveFrom: policy.effectiveFrom ? policy.effectiveFrom.slice(0, 10) : "",
  reviewDueAt: policy.reviewDueAt ? policy.reviewDueAt.slice(0, 10) : "",
  requiresAcknowledgement: policy.requiresAcknowledgement,
  acknowledgementDueDays: policy.acknowledgementDueDays,
  ownerEmployeeId: policy.ownerEmployeeId ?? "",
  audience: policy.audience,
  departmentIds: policy.departmentIds,
  designationIds: policy.designationIds,
  employeeIds: policy.employeeIds,
  userIds: policy.userIds,
});

const toPolicyFile = (file: DocumentFile | null): PolicyFile | null =>
  file
    ? {
        url: file.url,
        publicId: file.publicId,
        fileName: file.fileName,
        extension: file.extension,
        fileSize: file.fileSize,
      }
    : null;

const toDocumentFile = (file: PolicyFile | null): DocumentFile | null =>
  file
    ? {
        url: file.url,
        publicId: file.publicId,
        fileName: file.fileName,
        mimeType: "",
        extension: file.extension,
        fileSize: file.fileSize,
      }
    : null;

export function PolicyFormModal({ open, onOpenChange, policy }: PolicyFormModalProps) {
  const [createPolicy, { isLoading: isCreating }] = useCreatePolicyMutation();
  const [updatePolicy, { isLoading: isUpdating }] = useUpdatePolicyMutation();
  const isSaving = isCreating || isUpdating;

  const [file, setFile] = React.useState<DocumentFile | null>(null);
  const { data: employees } = useGetEmployeeOptionsQuery(undefined, { skip: !open });

  const employeeOptions = React.useMemo(
    () => (employees ?? []).map((row) => ({ value: row._id, label: row.name })),
    [employees]
  );

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(PolicySchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setFurthestStep(0);
      return;
    }
    form.reset(policy ? toFormValues(policy) : emptyValues());
    setFile(toDocumentFile(policy?.file ?? null));
  }, [open, policy, form]);

  const audience = form.watch("audience") as AudienceType;

  const onSubmit = async (values: PolicyFormValues) => {
    const body = {
      title: values.title,
      category: values.category,
      summary: values.summary,
      content: values.content,
      file: toPolicyFile(file),
      status: values.status,
      audience: values.audience,
      departmentIds: values.departmentIds,
      designationIds: values.designationIds,
      employeeIds: values.employeeIds,
      userIds: values.userIds,
      effectiveFrom: values.effectiveFrom || null,
      reviewDueAt: values.reviewDueAt || null,
      requiresAcknowledgement: values.requiresAcknowledgement,
      acknowledgementDueDays: toNumber(values.acknowledgementDueDays),
      ownerEmployeeId: values.ownerEmployeeId || null,
      ...(values.code ? { code: values.code } : {}),
    };

    try {
      if (policy) {
        await updatePolicy({ id: policy._id, body }).unwrap();
        toast.success("Policy updated");
      } else {
        await createPolicy(body).unwrap();
        toast.success("Policy added");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the policy");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>{policy ? "Edit policy" : "New policy"}</DialogTitle>
              <DialogDescription>
                Write it here, attach the signed document if you have one, and choose who it
                applies to.
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
                  <FormInput control={form.control} name="title" label="Title" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="code"
                      label="Code"
                      placeholder="Generated from the title"
                    />
                    <FormSelect
                      control={form.control}
                      name="category"
                      label="Category"
                      options={CATEGORY_OPTIONS}
                    />
                    <FormDate
                      control={form.control}
                      name="effectiveFrom"
                      label="In force from"
                    />
                    <FormDate
                      control={form.control}
                      name="reviewDueAt"
                      label="Review it by"
                      description="You get a nudge when this date comes round."
                    />
                    <FormSelect
                      control={form.control}
                      name="status"
                      label="Status"
                      options={STATUS_OPTIONS}
                    />
                    <FormSelect
                      control={form.control}
                      name="ownerEmployeeId"
                      label="Owned by"
                      options={employeeOptions}
                      placeholder="Nobody in particular"
                      clearable
                      searchable
                    />
                  </div>

                  <FormTextarea
                    control={form.control}
                    name="summary"
                    label="Summary"
                    placeholder="One or two lines on what this policy covers"
                  />

                  <FormSwitch
                    control={form.control}
                    name="requiresAcknowledgement"
                    label="Ask people to acknowledge it"
                    description="They confirm they have read it, and you can see who has."
                  />

                  <FormInput
                    control={form.control}
                    name="acknowledgementDueDays"
                    label="Days to acknowledge"
                    type="number"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <FormTextarea
                    control={form.control}
                    name="content"
                    label="Policy text"
                    placeholder="Write the policy out in full"
                    rows={14}
                  />
                  <DocumentUploader
                    value={file}
                    onChange={setFile}
                    label="Signed document (optional)"
                    description="PDF, Word or an image of the signed copy."
                  />
                </div>
              )}

              {step === 2 && <AudienceFields control={form.control} audience={audience} />}
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
                    {policy ? "Save changes" : "Add policy"}
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
