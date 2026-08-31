import { AccessGrantEditor } from "@/components/permission/access-grant-editor";
import { useAccessGrant } from "@/hooks/use-access-grant";
import { useModulePermission } from "@/hooks/use-permission";
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
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { useCreateTeamMutation, useUpdateTeamMutation } from "@/redux/apis/teamApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Team, TeamPayload } from "@/types/domain/team";
import { TeamSchema, type TeamFormValues } from "@/validations/team";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface TeamFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team | null;
}

const DEFAULT_COLOR = "#0ea5e9";

const DETAILS_STEP: StepperStep = { id: "details", label: "Details" };
const ACCESS_STEP: StepperStep = { id: "access", label: "Menu access" };
const REVIEW_STEP: StepperStep = { id: "review", label: "Review" };

const DETAIL_FIELDS: readonly (keyof TeamFormValues)[] = [
  "name",
  "code",
  "description",
  "color",
  "department",
  "teamLeadId",
  "supervisorId",
  "memberIds",
  "tagIds",
  "isActive",
];

const emptyValues = (): TeamFormValues => ({
  name: "",
  code: "",
  description: "",
  color: DEFAULT_COLOR,
  department: "",
  teamLeadId: "",
  supervisorId: "",
  memberIds: [],
  tagIds: [],
  isActive: true,
});

const toFormValues = (team: Team): TeamFormValues => ({
  name: team.name,
  code: team.code ?? "",
  description: team.description ?? "",
  color: team.color || DEFAULT_COLOR,
  department: team.department ?? "",
  teamLeadId: team.teamLead?._id ?? "",
  supervisorId: team.supervisor?._id ?? "",
  memberIds: team.memberIds ?? [],
  tagIds: team.tagIds ?? [],
  isActive: team.isActive,
});

const toPayload = (
  values: TeamFormValues,
  grant: Pick<TeamPayload, "modulePermissions" | "roleIds">
): TeamPayload => ({
  name: values.name,
  code: values.code,
  description: values.description,
  color: values.color,
  department: values.department,
  teamLeadId: values.teamLeadId,
  supervisorId: values.supervisorId,
  memberIds: values.memberIds,
  tagIds: values.tagIds,
  isActive: values.isActive,
  ...grant,
});

export function TeamFormModal({ open, onOpenChange, team }: TeamFormModalProps) {
  const isEdit = Boolean(team);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: tagOptions = [] } = useGetTagOptionsQuery();

  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(TeamSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(team ? toFormValues(team) : emptyValues());
  }, [open, team, form]);

  const seedKey = open ? (team?._id ?? "new") : null;
  const grant = useAccessGrant(seedKey, team);
  const canManageAccess = useModulePermission("/settings/access/roles").canEdit;

  const steps = React.useMemo<StepperStep[]>(
    () =>
      canManageAccess ? [DETAILS_STEP, ACCESS_STEP, REVIEW_STEP] : [DETAILS_STEP, REVIEW_STEP],
    [canManageAccess]
  );

  const lastStep = steps.length - 1;
  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);
  const activeStep = Math.min(step, lastStep);
  const currentStep = steps[activeStep].id;

  const [seededFor, setSeededFor] = React.useState<string | null>(null);

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setStep(0);
    setFurthestStep(seedKey !== null && team ? lastStep : 0);
  }

  const employeeChoices = React.useMemo(
    () =>
      employeeOptions.map((option) => ({
        value: option._id,
        label: option.name,
        hint: option.employeeCode,
      })),
    [employeeOptions]
  );

  const memberChoices = React.useMemo<MultiSelectOption[]>(
    () => employeeChoices,
    [employeeChoices]
  );

  const tagChoices = React.useMemo<MultiSelectOption[]>(
    () => tagOptions.map((tag) => ({ value: tag._id, label: tag.name, color: tag.color })),
    [tagOptions]
  );

  const summary = useWatch({ control: form.control });

  const nameOf = React.useCallback(
    (id?: string) => employeeChoices.find((choice) => choice.value === id)?.label,
    [employeeChoices]
  );

  const memberCount = React.useMemo(() => {
    const ids = new Set<string>();
    (summary.memberIds ?? []).forEach((id) => id && ids.add(id));
    if (summary.teamLeadId) ids.add(summary.teamLeadId);
    if (summary.supervisorId) ids.add(summary.supervisorId);
    return ids.size;
  }, [summary.memberIds, summary.teamLeadId, summary.supervisorId]);

  const goNext = async () => {
    if (currentStep === "details") {
      const isValid = await form.trigger(DETAIL_FIELDS, { shouldFocus: true });
      if (!isValid) return;
    }
    const next = Math.min(activeStep + 1, lastStep);
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const onSubmit = async (values: TeamFormValues) => {
    const teamBody = toPayload(values, {
      modulePermissions: grant.permissions,
      roleIds: grant.roleIds,
    });

    try {
      if (team) {
        await updateTeam({ id: team._id, body: teamBody }).unwrap();
        toast.success("Team updated");
      } else {
        await createTeam(teamBody).unwrap();
        toast.success("Team created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the team");
    }
  };

  const onInvalid = () => setStep(0);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeStep < lastStep) {
      void goNext();
      return;
    }
    void form.handleSubmit(onSubmit, onInvalid)(event);
  };

  const noEmployees = employeeOptions.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit team" : "New team"}</DialogTitle>
          <DialogDescription>
            Every team needs one lead and one supervisor. Both are employees, and both are added to
            the team automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleFormSubmit}>
            <DialogBody className="flex flex-col gap-4">
              <Stepper
                steps={steps}
                current={activeStep}
                reachable={furthestStep}
                onStepSelect={setStep}
              />

              {currentStep === "details" && (
                <div className="flex flex-col gap-4">
                  {noEmployees && (
                    <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
                      Add employees under HRMS · Employees first. A team cannot be created without a
                      lead and a supervisor.
                    </p>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="name"
                      label="Team name"
                      placeholder="Platform engineering"
                    />
                    <FormInput
                      control={form.control}
                      name="code"
                      label="Code"
                      placeholder="Optional short code"
                    />
                    <FormInput
                      control={form.control}
                      name="department"
                      label="Department"
                      placeholder="Engineering"
                    />
                    <FormColor control={form.control} name="color" label="Colour" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      control={form.control}
                      name="teamLeadId"
                      label="Team lead"
                      placeholder="Pick an employee"
                      options={employeeChoices}
                      disabled={noEmployees}
                      searchable
                    />
                    <FormSelect
                      control={form.control}
                      name="supervisorId"
                      label="Supervisor"
                      placeholder="Pick an employee"
                      options={employeeChoices}
                      disabled={noEmployees}
                      searchable
                    />
                  </div>

                  <FormMultiSelect
                    control={form.control}
                    name="memberIds"
                    label="Members"
                    placeholder="No members yet"
                    options={memberChoices}
                    disabled={noEmployees}
                    emptyText="No employees found."
                    description="The lead and supervisor are always counted as members."
                  />

                  <FormMultiSelect
                    control={form.control}
                    name="tagIds"
                    label="Tags"
                    placeholder="No tags"
                    options={tagChoices}
                    emptyText="No tags yet. Create them under CRM · Tags."
                  />

                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="What this team is responsible for (optional)"
                  />

                  <FormSwitch
                    control={form.control}
                    name="isActive"
                    label="Active"
                    description="Inactive teams stay on record but are filtered out by default."
                  />
                </div>
              )}

              {currentStep === "access" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{grant.roleIds.length}</span>{" "}
                    roles and{" "}
                    <span className="font-medium text-foreground">{grant.grantedMenuCount}</span>{" "}
                    menus granted to this team.
                  </p>
                  <AccessGrantEditor
                    roleIds={grant.roleIds}
                    onRoleIdsChange={grant.setRoleIds}
                    permissions={grant.permissions}
                    onPermissionsChange={grant.setPermissions}
                    rolesHint="Members, the lead and the supervisor all inherit these roles."
                    permissionsHint="Extra menus everyone on this team can reach."
                  />
                </div>
              )}

              {currentStep === "review" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    Check the team before you save it. The lead and the supervisor are counted as
                    members.
                  </p>
                  <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-4">
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Team name</dt>
                      <dd className="flex min-w-0 items-center gap-2 font-medium">
                        <span
                          className="size-3 shrink-0 rounded-full border"
                          style={{ backgroundColor: summary.color || DEFAULT_COLOR }}
                        />
                        <span className="truncate">{summary.name || "—"}</span>
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Code</dt>
                      <dd className="truncate font-medium">{summary.code || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Department</dt>
                      <dd className="truncate font-medium">{summary.department || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Status</dt>
                      <dd className="font-medium">{summary.isActive ? "Active" : "Inactive"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Team lead</dt>
                      <dd className="truncate font-medium">{nameOf(summary.teamLeadId) || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Supervisor</dt>
                      <dd className="truncate font-medium">
                        {nameOf(summary.supervisorId) || "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">Members</dt>
                      <dd className="font-medium">
                        {memberCount} · {summary.tagIds?.length ?? 0} tags
                      </dd>
                    </div>
                    {canManageAccess && (
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Access</dt>
                        <dd className="font-medium">
                          {grant.roleIds.length} roles · {grant.grantedMenuCount} menus
                        </dd>
                      </div>
                    )}
                    <div className="col-span-2 min-w-0 sm:col-span-4">
                      <dt className="text-xs text-muted-foreground">Description</dt>
                      <dd className="font-medium">{summary.description || "—"}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </DialogBody>

            <DialogFooter className="sm:justify-between">
              <span className="hidden text-xs text-muted-foreground sm:block">
                Step {activeStep + 1} of {steps.length}
              </span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (activeStep === 0 ? onOpenChange(false) : setStep(activeStep - 1))}
                  disabled={isSaving}
                >
                  {activeStep === 0 ? (
                    "Cancel"
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </>
                  )}
                </Button>
                {activeStep < lastStep ? (
                  <Button
                    key="wizard-next"
                    type="button"
                    onClick={() => void goNext()}
                    disabled={noEmployees}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button key="wizard-submit" type="submit" disabled={isSaving || noEmployees}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? "Save changes" : "Create team"}
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
