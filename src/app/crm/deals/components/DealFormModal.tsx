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
import { useCreateDealMutation, useUpdateDealMutation } from "@/redux/apis/dealApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetLeadSourceOptionsQuery } from "@/redux/apis/leadSourceApis";
import { useGetLeadsQuery } from "@/redux/apis/leadApis";
import { useGetPipelineQuery, useGetPipelineOptionsQuery } from "@/redux/apis/pipelineApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DEAL_PRIORITIES,
  DEAL_PRIORITY_LABELS,
  SUPPORTED_CURRENCIES,
  type Deal,
} from "@/types/domain/deal";
import { DealSchema, type DealFormValues } from "@/validations/deal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface DealFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
  defaultPipelineId?: string;
  defaultStageId?: string;
}

const PRIORITY_OPTIONS = DEAL_PRIORITIES.map((priority) => ({
  label: DEAL_PRIORITY_LABELS[priority],
  value: priority,
}));

const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((currency) => ({
  label: currency,
  value: currency,
}));

const toNumber = (value: number | ""): number => (value === "" ? 0 : value);

export function DealFormModal({
  open,
  onOpenChange,
  deal,
  defaultPipelineId,
  defaultStageId,
}: DealFormModalProps) {
  const isEdit = Boolean(deal);

  const { data: pipelineOptions = [] } = useGetPipelineOptionsQuery();
  const { data: contactOptions = [] } = useGetContactOptionsQuery();
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: leadSourceOptions = [] } = useGetLeadSourceOptionsQuery();
  const { data: tagOptions = [] } = useGetTagOptionsQuery();
  const { data: leadResult } = useGetLeadsQuery({ limit: 100 });

  const [createDeal, { isLoading: isCreating }] = useCreateDealMutation();
  const [updateDeal, { isLoading: isUpdating }] = useUpdateDealMutation();
  const isSaving = isCreating || isUpdating;

  const emptyValues = React.useCallback(
    (): DealFormValues => ({
      title: "",
      description: "",
      pipelineId: defaultPipelineId ?? pipelineOptions[0]?._id ?? "",
      stageId: defaultStageId ?? "",
      contactId: "",
      leadId: "",
      value: 0,
      currency: "BDT",
      probability: "",
      priority: "MEDIUM",
      ownerId: "",
      leadSourceId: "",
      tagIds: [],
      expectedCloseDate: "",
      nextActivityAt: "",
    }),
    [defaultPipelineId, defaultStageId, pipelineOptions]
  );

  const form = useForm<DealFormValues>({
    resolver: zodResolver(DealSchema),
    defaultValues: emptyValues(),
  });

  const pipelineId = useWatch({ control: form.control, name: "pipelineId" });
  const { data: pipeline } = useGetPipelineQuery(pipelineId, { skip: !pipelineId });

  React.useEffect(() => {
    if (!open) return;

    form.reset(
      deal
        ? {
            title: deal.title,
            description: deal.description,
            pipelineId: deal.pipelineId,
            stageId: deal.stageId,
            contactId: deal.contactId ?? "",
            leadId: deal.leadId ?? "",
            value: deal.value,
            currency: deal.currency,
            probability: deal.isProbabilityOverridden ? deal.probability : "",
            priority: deal.priority,
            ownerId: deal.ownerId ?? "",
            leadSourceId: deal.leadSourceId ?? "",
            tagIds: deal.tagIds,
            expectedCloseDate: deal.expectedCloseDate ?? "",
            nextActivityAt: deal.nextActivityAt ?? "",
          }
        : emptyValues()
    );
  }, [open, deal, form, emptyValues]);

  const pipelineChoices = React.useMemo(
    () => pipelineOptions.map((row) => ({ label: row.name, value: row._id })),
    [pipelineOptions]
  );

  const stageChoices = React.useMemo(
    () => (pipeline?.stages ?? []).map((stage) => ({ label: stage.name, value: stage._id })),
    [pipeline]
  );

  const contactChoices = React.useMemo(
    () => [
      { label: "No contact", value: "" },
      ...contactOptions.map((contact) => ({ label: contact.name, value: contact._id })),
    ],
    [contactOptions]
  );

  const leadChoices = React.useMemo(
    () => [
      { label: "Not from a lead", value: "" },
      ...(leadResult?.data ?? []).map((lead) => ({
        label: `${lead.code} · ${lead.title}`,
        value: lead._id,
      })),
    ],
    [leadResult]
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

  const onSubmit = async (values: DealFormValues) => {
    const shared = {
      title: values.title,
      description: values.description,
      contactId: values.contactId || null,
      leadId: values.leadId || null,
      value: toNumber(values.value),
      currency: values.currency,
      probability: values.probability === "" ? null : values.probability,
      priority: values.priority,
      ownerId: values.ownerId || null,
      leadSourceId: values.leadSourceId || null,
      tagIds: values.tagIds,
      expectedCloseDate: values.expectedCloseDate || null,
      nextActivityAt: values.nextActivityAt || null,
    };

    try {
      if (deal) {
        await updateDeal({ id: deal._id, body: shared }).unwrap();
        toast.success("Deal updated");
      } else {
        await createDeal({
          ...shared,
          pipelineId: values.pipelineId,
          stageId: values.stageId || undefined,
        }).unwrap();
        toast.success("Deal opened");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the deal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit deal" : "New deal"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update what this deal is worth, who owns it and when it should close."
              : "Open an opportunity on a pipeline and track it through to the close."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="flex flex-col gap-4">
              <FormInput
                control={form.control}
                name="title"
                label="Deal title"
                placeholder="Annual supply contract"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {!isEdit && (
                  <>
                    <FormSelect
                      control={form.control}
                      name="pipelineId"
                      label="Pipeline"
                      placeholder="Pick a pipeline"
                      options={pipelineChoices}
                      searchable
                    />
                    <FormSelect
                      control={form.control}
                      name="stageId"
                      label="Stage"
                      placeholder="First stage"
                      options={stageChoices}
                    />
                  </>
                )}

                <FormSelect
                  control={form.control}
                  name="contactId"
                  label="Contact"
                  placeholder="No contact"
                  options={contactChoices}
                  searchable
                />

                <FormSelect
                  control={form.control}
                  name="leadId"
                  label="Came from lead"
                  placeholder="Not from a lead"
                  options={leadChoices}
                  searchable
                />

                <FormInput control={form.control} name="value" label="Value" type="number" />

                <FormSelect
                  control={form.control}
                  name="currency"
                  label="Currency"
                  options={CURRENCY_OPTIONS}
                />

                <FormInput
                  control={form.control}
                  name="probability"
                  label="Win probability"
                  type="number"
                  placeholder="Leave blank to use the stage"
                  description="Overrides the stage probability for this deal only."
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
                name="description"
                label="Description"
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
                {isEdit ? "Save changes" : "Open deal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
