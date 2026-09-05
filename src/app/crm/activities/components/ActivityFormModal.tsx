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
import { useGetContactOptionsQuery } from "@/redux/apis/contactApis";
import {
  useCreateCrmActivityMutation,
  useUpdateCrmActivityMutation,
} from "@/redux/apis/crmActivityApis";
import { useGetDealOptionsQuery } from "@/redux/apis/dealApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetLeadOptionsQuery } from "@/redux/apis/leadApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  CRM_ACTIVITY_MANUAL_TYPES,
  CRM_ACTIVITY_OUTCOME_LABELS,
  CRM_ACTIVITY_OUTCOMES,
  CRM_ACTIVITY_RELATED_LABELS,
  CRM_ACTIVITY_RELATED_TYPES,
  CRM_ACTIVITY_TYPE_LABELS,
  type CrmActivity,
  type CrmActivityManualType,
  type CrmActivityRelatedType,
} from "@/types/domain/crmActivity";
import { CrmActivitySchema, type CrmActivityFormValues } from "@/validations/crmActivity";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

export interface ActivityFormTarget {
  relatedType: CrmActivityRelatedType;
  dealId?: string;
  leadId?: string;
  contactId?: string;
}

interface ActivityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: CrmActivity | null;
  target?: ActivityFormTarget | null;
  defaultType?: CrmActivityManualType;
  lockTarget?: boolean;
}

const TYPE_OPTIONS = CRM_ACTIVITY_MANUAL_TYPES.map((type) => ({
  label: CRM_ACTIVITY_TYPE_LABELS[type],
  value: type,
}));

const OUTCOME_OPTIONS = CRM_ACTIVITY_OUTCOMES.map((outcome) => ({
  label: CRM_ACTIVITY_OUTCOME_LABELS[outcome],
  value: outcome,
}));

const RELATED_OPTIONS = CRM_ACTIVITY_RELATED_TYPES.map((related) => ({
  label: CRM_ACTIVITY_RELATED_LABELS[related],
  value: related,
}));

const emptyValues = (
  target?: ActivityFormTarget | null,
  defaultType: CrmActivityManualType = "CALL"
): CrmActivityFormValues => ({
  relatedType: target?.relatedType ?? "DEAL",
  dealId: target?.dealId ?? "",
  leadId: target?.leadId ?? "",
  contactId: target?.contactId ?? "",
  type: defaultType,
  subject: "",
  body: "",
  location: "",
  occurredAt: new Date().toISOString(),
  durationMinutes: 0,
  dueAt: "",
  isCompleted: true,
  outcome: "NONE",
  performedById: "",
  isPinned: false,
});

export function ActivityFormModal({
  open,
  onOpenChange,
  activity,
  target,
  defaultType = "CALL",
  lockTarget = false,
}: ActivityFormModalProps) {
  const isEdit = Boolean(activity);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: dealOptions = [] } = useGetDealOptionsQuery(undefined, { skip: !open });
  const { data: leadOptions = [] } = useGetLeadOptionsQuery(undefined, { skip: !open });
  const { data: contactOptions = [] } = useGetContactOptionsQuery(undefined, { skip: !open });

  const [createActivity, { isLoading: isCreating }] = useCreateCrmActivityMutation();
  const [updateActivity, { isLoading: isUpdating }] = useUpdateCrmActivityMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<CrmActivityFormValues>({
    resolver: zodResolver(CrmActivitySchema),
    defaultValues: emptyValues(target, defaultType),
  });

  React.useEffect(() => {
    if (!open) return;

    form.reset(
      activity
        ? {
            relatedType: activity.relatedType,
            dealId: activity.dealId ?? "",
            leadId: activity.leadId ?? "",
            contactId: activity.contactId ?? "",
            type: activity.type as CrmActivityManualType,
            subject: activity.subject,
            body: activity.body,
            location: activity.location,
            occurredAt: activity.occurredAt,
            durationMinutes: activity.durationMinutes,
            dueAt: activity.dueAt ?? "",
            isCompleted: activity.isCompleted,
            outcome: activity.outcome,
            performedById: activity.performedById ?? "",
            isPinned: activity.isPinned,
          }
        : emptyValues(target, defaultType)
    );
  }, [open, activity, target, defaultType, form]);

  const performerChoices = React.useMemo(
    () => [
      { label: "Unassigned", value: "" },
      ...employeeOptions.map((employee) => ({ label: employee.name, value: employee._id })),
    ],
    [employeeOptions]
  );

  const dealChoices = React.useMemo(
    () => dealOptions.map((deal) => ({ label: `${deal.code} · ${deal.title}`, value: deal._id })),
    [dealOptions]
  );

  const leadChoices = React.useMemo(
    () => leadOptions.map((lead) => ({ label: `${lead.code} · ${lead.title}`, value: lead._id })),
    [leadOptions]
  );

  const contactChoices = React.useMemo(
    () =>
      contactOptions.map((contact) => ({
        label: contact.name || contact.email || "Unnamed contact",
        value: contact._id,
      })),
    [contactOptions]
  );

  const relatedType = useWatch({ control: form.control, name: "relatedType" });
  const type = useWatch({ control: form.control, name: "type" });
  const isCompleted = useWatch({ control: form.control, name: "isCompleted" });

  const onSubmit = async (values: CrmActivityFormValues) => {
    try {
      const body = {
        type: values.type,
        subject: values.subject,
        body: values.body,
        location: values.location,
        occurredAt: values.occurredAt,
        durationMinutes: Number(values.durationMinutes || 0),
        dueAt: values.dueAt || null,
        isCompleted: values.isCompleted,
        outcome: values.outcome,
        performedById: values.performedById || null,
        isPinned: values.isPinned,
      };

      if (activity) {
        await updateActivity({ id: activity._id, body }).unwrap();
        toast.success("Activity updated");
      } else {
        await createActivity({
          ...body,
          dealId: values.relatedType === "DEAL" ? values.dealId : null,
          leadId: values.relatedType === "LEAD" ? values.leadId : null,
          contactId: values.relatedType === "CONTACT" ? values.contactId : null,
        }).unwrap();
        toast.success("Activity logged");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the activity");
    }
  };

  const showTargetPicker = !isEdit && !lockTarget;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit activity" : "Log an activity"}</DialogTitle>
          <DialogDescription>
            Record exactly when it happened. Open activities need a due date and time so they show
            up as follow-ups.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="flex flex-col gap-4">
              {showTargetPicker && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormSelect
                    control={form.control}
                    name="relatedType"
                    label="Against"
                    options={RELATED_OPTIONS}
                    description="Which record this activity belongs to."
                  />

                  {relatedType === "DEAL" && (
                    <FormSelect
                      control={form.control}
                      name="dealId"
                      label="Deal"
                      placeholder="Pick a deal"
                      options={dealChoices}
                      searchable
                    />
                  )}
                  {relatedType === "LEAD" && (
                    <FormSelect
                      control={form.control}
                      name="leadId"
                      label="Lead"
                      placeholder="Pick a lead"
                      options={leadChoices}
                      searchable
                    />
                  )}
                  {relatedType === "CONTACT" && (
                    <FormSelect
                      control={form.control}
                      name="contactId"
                      label="Contact"
                      placeholder="Pick a contact"
                      options={contactChoices}
                      searchable
                    />
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="type"
                  label="Activity"
                  options={TYPE_OPTIONS}
                />
                <FormSelect
                  control={form.control}
                  name="outcome"
                  label="Outcome"
                  options={OUTCOME_OPTIONS}
                />

                <FormInput
                  control={form.control}
                  name="subject"
                  label="Subject"
                  placeholder="Walked them through the proposal"
                  className="sm:col-span-2"
                />

                <FormDate
                  control={form.control}
                  name="occurredAt"
                  label="Happened at"
                  includeTime
                  description="Date and exact time of the activity."
                />

                <FormInput
                  control={form.control}
                  name="durationMinutes"
                  label="Duration (minutes)"
                  type="number"
                  placeholder="15"
                />

                <FormSelect
                  control={form.control}
                  name="performedById"
                  label="Done by"
                  placeholder="Unassigned"
                  options={performerChoices}
                />

                {(type === "MEETING" || type === "VISIT" || type === "DEMO") && (
                  <FormInput
                    control={form.control}
                    name="location"
                    label="Location"
                    placeholder="Their office, Gulshan 2"
                  />
                )}
              </div>

              <FormTextarea
                control={form.control}
                name="body"
                label="Details"
                placeholder="What was discussed and what happens next"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormSwitch
                  control={form.control}
                  name="isCompleted"
                  label="Already done"
                  description="Turn off to schedule this as a follow-up."
                />
                <FormSwitch
                  control={form.control}
                  name="isPinned"
                  label="Pin to top"
                  description="Keeps this at the top of the timeline."
                />
              </div>

              {!isCompleted && (
                <FormDate
                  control={form.control}
                  name="dueAt"
                  label="Due at"
                  includeTime
                  description="When this follow-up needs to happen."
                />
              )}
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
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Log activity"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
