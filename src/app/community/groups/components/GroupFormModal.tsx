import { FileUploader } from "@/components/shared/file-uploader";
import {
  FormColor,
  FormInput,
  FormMultiSelect,
  FormSelect,
  FormSwitch,
  FormTextarea,
  type MultiSelectOption,
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
  useCreateCommunityGroupMutation,
  useGetCommunityMemberOptionsQuery,
  useUpdateCommunityGroupMutation,
} from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  COMMUNITY_GROUP_VISIBILITIES,
  COMMUNITY_GROUP_VISIBILITY_HINTS,
  COMMUNITY_GROUP_VISIBILITY_LABELS,
  type CommunityGroup,
} from "@/types/domain/community";
import { CommunityGroupSchema, type CommunityGroupFormValues } from "@/validations/community";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface GroupFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: CommunityGroup | null;
}

const STEPS: readonly StepperStep[] = [
  { id: "details", label: "The group" },
  { id: "artwork", label: "Logo and banner" },
  { id: "people", label: "Who is in it" },
];

const STEP_FIELDS: readonly (keyof CommunityGroupFormValues)[][] = [
  ["name", "slug", "description", "color", "visibility", "requiresApproval", "isArchived"],
  ["logoUrl", "bannerUrl"],
  ["memberIds", "moderatorIds"],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.includes(field as keyof CommunityGroupFormValues)
  );
  return index === -1 ? 0 : index;
};

const VISIBILITY_OPTIONS = COMMUNITY_GROUP_VISIBILITIES.map((value) => ({
  value,
  label: COMMUNITY_GROUP_VISIBILITY_LABELS[value],
}));

const emptyValues = (): CommunityGroupFormValues => ({
  name: "",
  slug: "",
  description: "",
  color: "#8b5cf6",
  logoUrl: "",
  bannerUrl: "",
  visibility: "OPEN",
  requiresApproval: false,
  memberIds: [],
  moderatorIds: [],
  isArchived: false,
});

const toFormValues = (group: CommunityGroup): CommunityGroupFormValues => ({
  name: group.name,
  slug: group.slug,
  description: group.description,
  color: group.color,
  logoUrl: group.logoUrl,
  bannerUrl: group.bannerUrl,
  visibility: group.visibility,
  requiresApproval: group.requiresApproval,
  memberIds: group.memberIds,
  moderatorIds: group.moderatorIds,
  isArchived: group.isArchived,
});

export function GroupFormModal({ open, onOpenChange, group }: GroupFormModalProps) {
  const [createGroup, { isLoading: isCreating }] = useCreateCommunityGroupMutation();
  const [updateGroup, { isLoading: isUpdating }] = useUpdateCommunityGroupMutation();
  const isSaving = isCreating || isUpdating;

  const { data: members = [] } = useGetCommunityMemberOptionsQuery(undefined, { skip: !open });

  const memberChoices = React.useMemo<MultiSelectOption[]>(
    () => members.map((member) => ({ value: member._id, label: member.displayName })),
    [members]
  );

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);

  const form = useForm<CommunityGroupFormValues>({
    resolver: zodResolver(CommunityGroupSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setFurthestStep(0);
      return;
    }
    form.reset(group ? toFormValues(group) : emptyValues());
  }, [open, group, form]);

  const logoUrl = form.watch("logoUrl");
  const bannerUrl = form.watch("bannerUrl");
  const visibility = form.watch("visibility");

  const onSubmit = async (values: CommunityGroupFormValues) => {
    const body = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      color: values.color,
      logoUrl: values.logoUrl,
      bannerUrl: values.bannerUrl,
      visibility: values.visibility,
      requiresApproval: values.requiresApproval,
      memberIds: values.memberIds,
      moderatorIds: values.moderatorIds,
      isArchived: values.isArchived,
    };

    try {
      if (group) {
        await updateGroup({ id: group._id, body }).unwrap();
        toast.success("Group updated");
      } else {
        await createGroup(body).unwrap();
        toast.success("Group created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the group");
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
              <DialogTitle>{group ? "Edit group" : "New group"}</DialogTitle>
              <DialogDescription>
                A smaller space inside the community — a department, a project, or anything people
                want their own feed for.
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
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Name"
                    placeholder="Warehouse floor"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="slug"
                      label="Short link"
                      placeholder="Generated from the name"
                    />
                    <FormColor control={form.control} name="color" label="Colour" />
                  </div>

                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="What it is for"
                    placeholder="Shift notes, safety reminders and anything the floor needs to know"
                  />

                  <FormSelect
                    control={form.control}
                    name="visibility"
                    label="Who can find it"
                    options={VISIBILITY_OPTIONS}
                    description="Open lets anyone join. Closed needs a moderator. Secret is hidden from anybody outside it."
                  />

                  <FileUploader
                    value={coverImageUrl || undefined}
                    onChange={(asset) =>
                      form.setValue("coverImageUrl", asset?.url ?? "", { shouldDirty: true })
                    }
                    label="Cover image"
                    description="Optional. Sits at the top of the group."
                    cropAspect={16 / 6}
                  />

                  <FormSwitch
                    control={form.control}
                    name="isArchived"
                    label="Archived"
                    description="Archived groups stay readable but nobody can post in them."
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <FormMultiSelect
                    control={form.control}
                    name="memberIds"
                    label="Members"
                    placeholder="Nobody yet"
                    options={memberChoices}
                    searchable
                    emptyText="No community members yet. Add them under Community · Members."
                  />

                  <FormMultiSelect
                    control={form.control}
                    name="moderatorIds"
                    label="Moderators"
                    placeholder="Nobody yet"
                    options={memberChoices}
                    searchable
                    description="Moderators are added to the group automatically."
                    emptyText="No community members yet. Add them under Community · Members."
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
                    {group ? "Save changes" : "Create group"}
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
