import {
  FormColor,
  FormInput,
  FormSelect,
  FormSwitch,
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
import { useGetContactTypeOptionsQuery } from "@/redux/apis/contactTypeApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useCreatePipelineMutation, useUpdatePipelineMutation } from "@/redux/apis/pipelineApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  DEFAULT_PIPELINE_COLOR,
  DEFAULT_STAGE_COLOR,
  SUPPORTED_CURRENCIES,
  type Pipeline,
  type PipelinePayload,
} from "@/types/domain/pipeline";
import { PipelineSchema, type PipelineFormValues } from "@/validations/pipeline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { StageEditor } from "./StageEditor";

interface PipelineFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline?: Pipeline | null;
}

const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((currency) => ({
  label: currency,
  value: currency,
}));

const DEFAULT_STAGES: PipelineFormValues["stages"] = [
  { name: "New", color: "#64748b", probability: 10, type: "OPEN", rottingDays: 7 },
  { name: "Contacted", color: "#0ea5e9", probability: 25, type: "OPEN", rottingDays: 7 },
  { name: "Qualified", color: "#6366f1", probability: 45, type: "OPEN", rottingDays: 10 },
  { name: "Proposal", color: "#f59e0b", probability: 65, type: "OPEN", rottingDays: 14 },
  { name: "Negotiation", color: "#f97316", probability: 80, type: "OPEN", rottingDays: 14 },
  { name: "Won", color: "#16a34a", probability: 100, type: "WON", rottingDays: 0 },
  { name: "Lost", color: "#dc2626", probability: 0, type: "LOST", rottingDays: 0 },
];

const emptyValues = (): PipelineFormValues => ({
  name: "",
  color: DEFAULT_PIPELINE_COLOR,
  description: "",
  contactTypeId: "",
  ownerId: "",
  currency: "BDT",
  isActive: true,
  stages: DEFAULT_STAGES.map((stage) => ({ ...stage })),
});

const toFormValues = (pipeline: Pipeline): PipelineFormValues => ({
  name: pipeline.name,
  color: pipeline.color || DEFAULT_PIPELINE_COLOR,
  description: pipeline.description,
  contactTypeId: pipeline.contactTypeId ?? "",
  ownerId: pipeline.ownerId ?? "",
  currency: pipeline.currency,
  isActive: pipeline.isActive,
  stages: pipeline.stages.map((stage) => ({
    _id: stage._id,
    name: stage.name,
    color: stage.color || DEFAULT_STAGE_COLOR,
    probability: stage.probability,
    type: stage.type,
    rottingDays: stage.rottingDays,
  })),
});

const toPayload = (values: PipelineFormValues): PipelinePayload => ({
  name: values.name,
  color: values.color,
  description: values.description,
  contactTypeId: values.contactTypeId || null,
  ownerId: values.ownerId || null,
  currency: values.currency,
  isActive: values.isActive,
  stages: values.stages.map((stage) => ({
    ...(stage._id ? { _id: stage._id } : {}),
    name: stage.name,
    color: stage.color,
    probability: Number(stage.probability || 0),
    type: stage.type,
    rottingDays: Number(stage.rottingDays || 0),
  })),
});

export function PipelineFormModal({ open, onOpenChange, pipeline }: PipelineFormModalProps) {
  const isEdit = Boolean(pipeline);

  const { data: contactTypeOptions = [] } = useGetContactTypeOptionsQuery();
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const [createPipeline, { isLoading: isCreating }] = useCreatePipelineMutation();
  const [updatePipeline, { isLoading: isUpdating }] = useUpdatePipelineMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<PipelineFormValues>({
    resolver: zodResolver(PipelineSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(pipeline ? toFormValues(pipeline) : emptyValues());
  }, [open, pipeline, form]);

  const contactTypeChoices = React.useMemo(
    () => [
      { label: "Any contact type", value: "" },
      ...contactTypeOptions.map((type) => ({ label: type.name, value: type._id })),
    ],
    [contactTypeOptions]
  );

  const ownerChoices = React.useMemo(
    () => [
      { label: "Unassigned", value: "" },
      ...employeeOptions.map((employee) => ({ label: employee.name, value: employee._id })),
    ],
    [employeeOptions]
  );

  const onSubmit = async (values: PipelineFormValues) => {
    try {
      const body = toPayload(values);

      if (pipeline) {
        await updatePipeline({ id: pipeline._id, body }).unwrap();
        toast.success("Pipeline updated");
      } else {
        await createPipeline(body).unwrap();
        toast.success("Pipeline created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the pipeline");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader className="sm:p-4">
          <DialogTitle className="text-base">
            {isEdit ? "Edit pipeline" : "New pipeline"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Stages are the columns on the board. Contacts are dragged left to right as the deal
            progresses.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="flex flex-col gap-3 sm:p-4 [&_[data-slot=form-item]]:gap-1.5 [&_[data-slot=form-label]]:text-xs [&_[data-slot=form-label]]:text-muted-foreground">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Pipeline name"
                  placeholder="New business"
                  className="lg:col-span-2"
                />
                <FormInput
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="What it is for"
                  className="lg:col-span-2"
                />
                <FormSelect
                  control={form.control}
                  name="contactTypeId"
                  label="Contact type"
                  placeholder="Any contact type"
                  options={contactTypeChoices}
                />
                <FormSelect
                  control={form.control}
                  name="ownerId"
                  label="Default owner"
                  placeholder="Unassigned"
                  options={ownerChoices}
                />
                <FormSelect
                  control={form.control}
                  name="currency"
                  label="Currency"
                  options={CURRENCY_OPTIONS}
                />
                <FormSwitch
                  control={form.control}
                  name="isActive"
                  label="Active"
                  className="self-end p-2"
                />
              </div>

              <FormColor control={form.control} name="color" label="Pipeline colour" />

              <StageEditor />
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
                {isEdit ? "Save changes" : "Create pipeline"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
