import {
  FormDate,
  FormInput,
  FormMultiSelect,
  FormSelect,
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
import { useGetContactOptionsQuery } from "@/redux/apis/contactApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetLeadSourceOptionsQuery } from "@/redux/apis/leadSourceApis";
import {
  useCreatePipelineEntryMutation,
  useUpdatePipelineEntryMutation,
} from "@/redux/apis/pipelineApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PIPELINE_ENTRY_PRIORITIES,
  PIPELINE_ENTRY_PRIORITY_LABELS,
  SUPPORTED_CURRENCIES,
  type PipelineEntry,
  type PipelineWithStats,
} from "@/types/domain/pipeline";
import { PipelineEntrySchema, type PipelineEntryFormValues } from "@/validations/pipeline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EntryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline: PipelineWithStats;
  entry?: PipelineEntry | null;
  defaultStageId?: string;
}

const PRIORITY_OPTIONS = PIPELINE_ENTRY_PRIORITIES.map((priority) => ({
  label: PIPELINE_ENTRY_PRIORITY_LABELS[priority],
  value: priority,
}));

const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((currency) => ({
  label: currency,
  value: currency,
}));

export function EntryFormModal({
  open,
  onOpenChange,
  pipeline,
  entry,
  defaultStageId,
}: EntryFormModalProps) {
  const isEdit = Boolean(entry);

  const { data: contactOptions = [] } = useGetContactOptionsQuery({
    contactTypeId: pipeline.contactTypeId ?? undefined,
  });
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: leadSourceOptions = [] } = useGetLeadSourceOptionsQuery();
  const { data: tagOptions = [] } = useGetTagOptionsQuery();

  const [createEntry, { isLoading: isCreating }] = useCreatePipelineEntryMutation();
  const [updateEntry, { isLoading: isUpdating }] = useUpdatePipelineEntryMutation();
  const isSaving = isCreating || isUpdating;

  const emptyValues = React.useCallback(
    (): PipelineEntryFormValues => ({
      contactId: "",
      stageId: defaultStageId ?? pipeline.stages[0]?._id ?? "",
      title: "",
      value: 0,
      currency: pipeline.currency,
      priority: "MEDIUM",
      ownerId: pipeline.ownerId ?? "",
      leadSourceId: "",
      tagIds: [],
      expectedCloseDate: "",
      nextActivityAt: "",
      notes: "",
    }),
    [defaultStageId, pipeline]
  );

  const form = useForm<PipelineEntryFormValues>({
    resolver: zodResolver(PipelineEntrySchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;

    form.reset(
      entry
        ? {
            contactId: entry.contactId,
            stageId: entry.stageId,
            title: entry.title,
            value: entry.value,
            currency: entry.currency,
            priority: entry.priority,
            ownerId: entry.ownerId ?? "",
            leadSourceId: entry.leadSourceId ?? "",
            tagIds: entry.tagIds,
            expectedCloseDate: entry.expectedCloseDate ?? "",
            nextActivityAt: entry.nextActivityAt ?? "",
            notes: entry.notes,
          }
        : emptyValues()
    );
  }, [open, entry, form, emptyValues]);

  const contactChoices = React.useMemo(
    () => contactOptions.map((contact) => ({ label: contact.name, value: contact._id })),
    [contactOptions]
  );

  const stageChoices = React.useMemo(
    () => pipeline.stages.map((stage) => ({ label: stage.name, value: stage._id })),
    [pipeline.stages]
  );

  const ownerChoices = React.useMemo(
    () => [
      { label: "Unassigned", value: "" },
      ...employeeOptions.map((employee) => ({ label: employee.name, value: employee._id })),
    ],
    [employeeOptions]
  );

  const leadSourceChoices = React.useMemo(
    () => [
      { label: "No source", value: "" },
      ...leadSourceOptions.map((source) => ({ label: source.name, value: source._id })),
    ],
    [leadSourceOptions]
  );

  const tagChoices = React.useMemo<MultiSelectOption[]>(
    () => tagOptions.map((tag) => ({ value: tag._id, label: tag.name, color: tag.color })),
    [tagOptions]
  );

  const onSubmit = async (values: PipelineEntryFormValues) => {
    try {
      if (entry) {
        await updateEntry({
          id: entry._id,
          body: {
            title: values.title,
            notes: values.notes,
            value: Number(values.value || 0),
            currency: values.currency,
            priority: values.priority,
            ownerId: values.ownerId || null,
            leadSourceId: values.leadSourceId || null,
            tagIds: values.tagIds,
            expectedCloseDate: values.expectedCloseDate || null,
            nextActivityAt: values.nextActivityAt || null,
          },
        }).unwrap();
        toast.success("Card updated");
      } else {
        await createEntry({
          pipelineId: pipeline._id,
          stageId: values.stageId || undefined,
          contactId: values.contactId,
          title: values.title,
          notes: values.notes,
          value: Number(values.value || 0),
          currency: values.currency,
          priority: values.priority,
          ownerId: values.ownerId || null,
          leadSourceId: values.leadSourceId || null,
          tagIds: values.tagIds,
          expectedCloseDate: values.expectedCloseDate || null,
          nextActivityAt: values.nextActivityAt || null,
        }).unwrap();
        toast.success("Contact added to the pipeline");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the card");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit card" : "Add a contact"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update what this card is worth and who is working it."
              : `Place a contact on "${pipeline.name}" and start tracking the conversation.`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {!isEdit && (
                  <>
                    <FormSelect
                      control={form.control}
                      name="contactId"
                      label="Contact"
                      placeholder="Pick a contact"
                      options={contactChoices}
                      searchable
                    />
                    <FormSelect
                      control={form.control}
                      name="stageId"
                      label="Stage"
                      options={stageChoices}
                    />
                  </>
                )}

                <FormInput
                  control={form.control}
                  name="title"
                  label="Card title"
                  placeholder="Leave blank to use the contact name"
                  className="sm:col-span-2"
                />

                <FormInput control={form.control} name="value" label="Value" type="number" />

                <FormSelect
                  control={form.control}
                  name="currency"
                  label="Currency"
                  options={CURRENCY_OPTIONS}
                />

                <FormSelect
                  control={form.control}
                  name="priority"
                  label="Priority"
                  options={PRIORITY_OPTIONS}
                />

                <FormSelect
                  control={form.control}
                  name="ownerId"
                  label="Owner"
                  placeholder="Unassigned"
                  options={ownerChoices}
                />

                <FormSelect
                  control={form.control}
                  name="leadSourceId"
                  label="Lead source"
                  placeholder="No source"
                  options={leadSourceChoices}
                />

                <FormDate
                  control={form.control}
                  name="expectedCloseDate"
                  label="Expected close"
                  dateOnly
                />

                <FormDate
                  control={form.control}
                  name="nextActivityAt"
                  label="Next activity due"
                  includeTime
                  className="sm:col-span-2"
                />
              </div>

              <FormMultiSelect
                control={form.control}
                name="tagIds"
                label="Tags"
                placeholder="No tags"
                options={tagChoices}
                emptyText="No tags yet. Create them under Settings · Customers · Tags."
              />

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="What they need, what was agreed, anything worth remembering"
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
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add to pipeline"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
