import { FormInput, FormSelect, FormTextarea } from "@/components/shared/form-fields";
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
import {
  useCreateForecastTargetMutation,
  useUpdateForecastTargetMutation,
} from "@/redux/apis/forecastApis";
import { useGetPipelineOptionsQuery } from "@/redux/apis/pipelineApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  FORECAST_PERIOD_TYPE_LABELS,
  FORECAST_PERIOD_TYPES,
  type ForecastPeriodType,
  type ForecastTarget,
  type ForecastTargetPayload,
} from "@/types/domain/forecast";
import type { SupportedCurrency } from "@/types/domain/plan";
import { ForecastTargetSchema, type ForecastTargetFormValues } from "@/validations/forecast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface ForecastTargetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target?: ForecastTarget | null;
  defaultPeriodType: ForecastPeriodType;
  defaultPeriod: string;
  currency: SupportedCurrency;
}

const PERIOD_TYPE_OPTIONS = FORECAST_PERIOD_TYPES.map((periodType) => ({
  label: FORECAST_PERIOD_TYPE_LABELS[periodType],
  value: periodType,
}));

export function ForecastTargetModal({
  open,
  onOpenChange,
  target,
  defaultPeriodType,
  defaultPeriod,
  currency,
}: ForecastTargetModalProps) {
  const isEdit = Boolean(target);

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: pipelineOptions = [] } = useGetPipelineOptionsQuery();

  const [createTarget, { isLoading: isCreating }] = useCreateForecastTargetMutation();
  const [updateTarget, { isLoading: isUpdating }] = useUpdateForecastTargetMutation();
  const isSaving = isCreating || isUpdating;

  const emptyValues = React.useCallback(
    (): ForecastTargetFormValues => ({
      periodType: defaultPeriodType,
      period: defaultPeriod,
      ownerId: "",
      pipelineId: "",
      amount: "",
      currency,
      notes: "",
    }),
    [defaultPeriodType, defaultPeriod, currency]
  );

  const form = useForm<ForecastTargetFormValues>({
    resolver: zodResolver(ForecastTargetSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;

    form.reset(
      target
        ? {
            periodType: target.periodType,
            period: target.period,
            ownerId: target.ownerId ?? "",
            pipelineId: target.pipelineId ?? "",
            amount: target.amount,
            currency: target.currency,
            notes: target.notes,
          }
        : emptyValues()
    );
  }, [open, target, emptyValues, form]);

  const ownerChoices = React.useMemo(
    () => [
      { label: "Whole team", value: "" },
      ...employeeOptions.map((employee) => ({ label: employee.name, value: employee._id })),
    ],
    [employeeOptions]
  );

  const pipelineChoices = React.useMemo(
    () => [
      { label: "Every pipeline", value: "" },
      ...pipelineOptions.map((pipeline) => ({ label: pipeline.name, value: pipeline._id })),
    ],
    [pipelineOptions]
  );

  const periodType = useWatch({ control: form.control, name: "periodType" });

  const onSubmit = async (values: ForecastTargetFormValues) => {
    try {
      const body: ForecastTargetPayload = {
        periodType: values.periodType,
        period: values.period.toUpperCase(),
        ownerId: values.ownerId || null,
        pipelineId: values.pipelineId || null,
        amount: Number(values.amount || 0),
        currency: values.currency,
        notes: values.notes,
      };

      if (target) {
        await updateTarget({ id: target._id, body }).unwrap();
        toast.success("Target updated");
      } else {
        await createTarget(body).unwrap();
        toast.success("Target set");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the target");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit target" : "Set a target"}</DialogTitle>
          <DialogDescription>
            Targets are what the forecast is measured against. Set one for the whole team, or one
            per person.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="periodType"
                  label="Period"
                  options={PERIOD_TYPE_OPTIONS}
                />
                <FormInput
                  control={form.control}
                  name="period"
                  label={periodType === "QUARTER" ? "Quarter" : "Month"}
                  placeholder={periodType === "QUARTER" ? "2026-Q1" : "2026-01"}
                />
                <FormSelect
                  control={form.control}
                  name="ownerId"
                  label="Owner"
                  placeholder="Whole team"
                  options={ownerChoices}
                  searchable
                  description="Leave on the whole team for a company-wide number."
                />
                <FormSelect
                  control={form.control}
                  name="pipelineId"
                  label="Pipeline"
                  placeholder="Every pipeline"
                  options={pipelineChoices}
                />
                <FormInput
                  control={form.control}
                  name="amount"
                  label={`Target (${currency})`}
                  type="number"
                  placeholder="500000"
                  className="sm:col-span-2"
                />
              </div>

              <FormTextarea
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Why this number, and what it assumes"
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
                {isEdit ? "Save changes" : "Set target"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
