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
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { useCreateTeamMutation, useUpdateTeamMutation } from "@/redux/apis/teamApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Team, TeamPayload } from "@/types/domain/team";
import { TeamSchema, type TeamFormValues } from "@/validations/team";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface TeamFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team | null;
}

const DEFAULT_COLOR = "#0ea5e9";

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

const toPayload = (values: TeamFormValues): TeamPayload => ({
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

  const onSubmit = async (values: TeamFormValues) => {
    try {
      if (team) {
        await updateTeam({ id: team._id, body: toPayload(values) }).unwrap();
        toast.success("Team updated");
      } else {
        await createTeam(toPayload(values)).unwrap();
        toast.success("Team created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the team");
    }
  };

  const noEmployees = employeeOptions.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit team" : "New team"}</DialogTitle>
          <DialogDescription>
            Every team needs one lead and one supervisor. Both are employees, and both are added to
            the team automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
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
              <Button type="submit" disabled={isSaving || noEmployees}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create team"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
