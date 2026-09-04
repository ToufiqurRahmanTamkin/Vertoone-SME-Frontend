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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface PolicyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: Policy | null;
}

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

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(PolicySchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{policy ? "Edit policy" : "New policy"}</DialogTitle>
              <DialogDescription>
                Write it here, attach the signed document if you have one, and choose who it
                applies to.
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1 cursor-pointer">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex-1 cursor-pointer">
                    The policy
                  </TabsTrigger>
                  <TabsTrigger value="audience" className="flex-1 cursor-pointer">
                    Who it applies to
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4 space-y-4">
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
                </TabsContent>

                <TabsContent value="content" className="mt-4 space-y-4">
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
                </TabsContent>

                <TabsContent value="audience" className="mt-4">
                  <AudienceFields control={form.control} audience={audience} />
                </TabsContent>
              </Tabs>
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
              <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {policy ? "Save changes" : "Add policy"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
