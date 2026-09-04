import { AudienceFields } from "@/components/shared/audience-fields";
import { FileUploader } from "@/components/shared/file-uploader";
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
import {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from "@/redux/apis/announcementApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_PRIORITY_LABELS,
  ANNOUNCEMENT_STATUSES,
  ANNOUNCEMENT_STATUS_LABELS,
  ANNOUNCEMENT_TYPES,
  ANNOUNCEMENT_TYPE_LABELS,
  type Announcement,
} from "@/types/domain/announcement";
import type { AudienceType } from "@/types/domain/policy";
import { AnnouncementSchema, type AnnouncementFormValues } from "@/validations/policy";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AnnouncementFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
}

const STEPS: readonly StepperStep[] = [
  { id: "message", label: "Message" },
  { id: "timing", label: "Timing" },
  { id: "audience", label: "Who sees it" },
];

const STEP_FIELDS: readonly (keyof AnnouncementFormValues)[][] = [
  ["title", "summary", "body", "type", "priority", "coverImageUrl"],
  ["status", "authorEmployeeId", "publishAt", "expiresAt", "isPinned"],
  ["audience", "departmentIds", "designationIds", "employeeIds", "userIds"],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.includes(field as keyof AnnouncementFormValues)
  );
  return index === -1 ? 0 : index;
};

const TYPE_OPTIONS = ANNOUNCEMENT_TYPES.map((value) => ({
  value,
  label: ANNOUNCEMENT_TYPE_LABELS[value],
}));

const PRIORITY_OPTIONS = ANNOUNCEMENT_PRIORITIES.map((value) => ({
  value,
  label: ANNOUNCEMENT_PRIORITY_LABELS[value],
}));

const STATUS_OPTIONS = ANNOUNCEMENT_STATUSES.map((value) => ({
  value,
  label: ANNOUNCEMENT_STATUS_LABELS[value],
}));

const emptyValues = (): AnnouncementFormValues => ({
  title: "",
  summary: "",
  body: "",
  type: "GENERAL",
  priority: "NORMAL",
  status: "DRAFT",
  coverImageUrl: "",
  isPinned: false,
  publishAt: "",
  expiresAt: "",
  authorEmployeeId: "",
  audience: "ALL",
  departmentIds: [],
  designationIds: [],
  employeeIds: [],
  userIds: [],
});

const toFormValues = (announcement: Announcement): AnnouncementFormValues => ({
  title: announcement.title,
  summary: announcement.summary,
  body: announcement.body,
  type: announcement.type,
  priority: announcement.priority,
  status: announcement.status,
  coverImageUrl: announcement.coverImageUrl,
  isPinned: announcement.isPinned,
  publishAt: announcement.publishAt ? announcement.publishAt.slice(0, 10) : "",
  expiresAt: announcement.expiresAt ? announcement.expiresAt.slice(0, 10) : "",
  authorEmployeeId: announcement.authorEmployeeId ?? "",
  audience: announcement.audience,
  departmentIds: announcement.departmentIds,
  designationIds: announcement.designationIds,
  employeeIds: announcement.employeeIds,
  userIds: announcement.userIds,
});

export function AnnouncementFormModal({
  open,
  onOpenChange,
  announcement,
}: AnnouncementFormModalProps) {
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();
  const isSaving = isCreating || isUpdating;

  const { data: employees } = useGetEmployeeOptionsQuery(undefined, { skip: !open });

  const employeeOptions = React.useMemo(
    () => (employees ?? []).map((row) => ({ value: row._id, label: row.name })),
    [employees]
  );

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setFurthestStep(0);
      return;
    }
    form.reset(announcement ? toFormValues(announcement) : emptyValues());
  }, [open, announcement, form]);

  const audience = form.watch("audience") as AudienceType;
  const coverImageUrl = form.watch("coverImageUrl");

  const onSubmit = async (values: AnnouncementFormValues) => {
    const body = {
      title: values.title,
      summary: values.summary,
      body: values.body,
      type: values.type,
      priority: values.priority,
      status: values.status,
      coverImageUrl: values.coverImageUrl,
      isPinned: values.isPinned,
      audience: values.audience,
      departmentIds: values.departmentIds,
      designationIds: values.designationIds,
      employeeIds: values.employeeIds,
      userIds: values.userIds,
      publishAt: values.publishAt || null,
      expiresAt: values.expiresAt || null,
      authorEmployeeId: values.authorEmployeeId || null,
    };

    try {
      if (announcement) {
        await updateAnnouncement({ id: announcement._id, body }).unwrap();
        toast.success("Announcement updated");
      } else {
        await createAnnouncement(body).unwrap();
        toast.success("Announcement added");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the announcement");
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
              <DialogTitle>
                {announcement ? "Edit announcement" : "New announcement"}
              </DialogTitle>
              <DialogDescription>
                Say it once, and it reaches exactly the people you pick.
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
                  <FormTextarea
                    control={form.control}
                    name="summary"
                    label="Summary"
                    placeholder="One line that shows in the list"
                  />
                  <FormTextarea
                    control={form.control}
                    name="body"
                    label="Message"
                    placeholder="What you want everybody to know"
                    rows={10}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      control={form.control}
                      name="type"
                      label="Kind"
                      options={TYPE_OPTIONS}
                    />
                    <FormSelect
                      control={form.control}
                      name="priority"
                      label="Priority"
                      options={PRIORITY_OPTIONS}
                    />
                  </div>

                  <FileUploader
                    value={coverImageUrl || undefined}
                    onChange={(asset) =>
                      form.setValue("coverImageUrl", asset?.url ?? "", { shouldDirty: true })
                    }
                    label="Cover image"
                    description="Optional. Shows at the top of the announcement."
                    cropAspect={16 / 9}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      control={form.control}
                      name="status"
                      label="Status"
                      options={STATUS_OPTIONS}
                    />
                    <FormSelect
                      control={form.control}
                      name="authorEmployeeId"
                      label="From"
                      options={employeeOptions}
                      placeholder="The company"
                      clearable
                      searchable
                    />
                    <FormDate
                      control={form.control}
                      name="publishAt"
                      label="Goes out on"
                      description="Leave empty to send as soon as it is published."
                    />
                    <FormDate
                      control={form.control}
                      name="expiresAt"
                      label="Stops showing on"
                      description="Leave empty to keep it up indefinitely."
                    />
                  </div>

                  <FormSwitch
                    control={form.control}
                    name="isPinned"
                    label="Pin it to the top"
                    description="Pinned announcements sit above everything else in the feed."
                  />
                </div>
              )}

              {step === 2 && (
                <AudienceFields
                  control={form.control}
                  audience={audience}
                  description="Everyone in the company, unless you narrow it down."
                />
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
                    {announcement ? "Save changes" : "Add announcement"}
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
