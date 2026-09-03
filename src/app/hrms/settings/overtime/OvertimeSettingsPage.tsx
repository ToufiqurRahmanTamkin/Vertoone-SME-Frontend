import { BackLink } from "@/components/shared/back-link";
import { FormInput, FormSelect, FormSwitch } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Form } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useModulePermission } from "@/hooks/use-permission";
import {
  useGetHrmsSettingsQuery,
  useUpdateOvertimeSettingsMutation,
} from "@/redux/apis/hrmsSettingsApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  OVERTIME_BASES,
  OVERTIME_BASE_LABELS,
  OVERTIME_PAYOUTS,
  OVERTIME_PAYOUT_LABELS,
  type OvertimeSettings,
} from "@/types/domain/hrmsSettings";
import { OvertimeSchema, toNumber, type OvertimeFormValues } from "@/validations/hrmsSettings";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Moon, Shield, Sigma } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { SettingsFieldset } from "../components/SettingsFieldset";
import { SettingsFormFooter } from "../components/SettingsFormFooter";

const BASE_OPTIONS = OVERTIME_BASES.map((value) => ({
  value,
  label: OVERTIME_BASE_LABELS[value],
}));

const PAYOUT_OPTIONS = OVERTIME_PAYOUTS.map((value) => ({
  value,
  label: OVERTIME_PAYOUT_LABELS[value],
}));

const toFormValues = (overtime: OvertimeSettings): OvertimeFormValues => ({
  enabled: overtime.enabled,
  requireApproval: overtime.requireApproval,
  calculationBase: overtime.calculationBase,
  payout: overtime.payout,
  dailyThresholdHours: overtime.dailyThresholdHours,
  dailyMultiplier: overtime.dailyMultiplier,
  weeklyThresholdHours: overtime.weeklyThresholdHours,
  weeklyMultiplier: overtime.weeklyMultiplier,
  monthlyThresholdHours: overtime.monthlyThresholdHours,
  monthlyMultiplier: overtime.monthlyMultiplier,
  weekOffMultiplier: overtime.weekOffMultiplier,
  holidayMultiplier: overtime.holidayMultiplier,
  nightMultiplier: overtime.nightMultiplier,
  nightStartTime: overtime.nightStartTime,
  nightEndTime: overtime.nightEndTime,
  minMinutesToCount: overtime.minMinutesToCount,
  roundToMinutes: overtime.roundToMinutes,
  maxDailyHours: overtime.maxDailyHours,
  maxMonthlyHours: overtime.maxMonthlyHours,
});

function OvertimeForm({
  overtime,
  canEdit,
}: {
  overtime: OvertimeSettings;
  canEdit: boolean;
}) {
  const [updateOvertime, { isLoading }] = useUpdateOvertimeSettingsMutation();

  const form = useForm<OvertimeFormValues>({
    resolver: zodResolver(OvertimeSchema),
    defaultValues: toFormValues(overtime),
    disabled: !canEdit,
  });

  const values = useWatch({ control: form.control });

  const onSubmit = async (formValues: OvertimeFormValues) => {
    try {
      await updateOvertime({
        enabled: formValues.enabled,
        requireApproval: formValues.requireApproval,
        calculationBase: formValues.calculationBase,
        payout: formValues.payout,
        dailyThresholdHours: toNumber(formValues.dailyThresholdHours),
        dailyMultiplier: toNumber(formValues.dailyMultiplier),
        weeklyThresholdHours: toNumber(formValues.weeklyThresholdHours),
        weeklyMultiplier: toNumber(formValues.weeklyMultiplier),
        monthlyThresholdHours: toNumber(formValues.monthlyThresholdHours),
        monthlyMultiplier: toNumber(formValues.monthlyMultiplier),
        weekOffMultiplier: toNumber(formValues.weekOffMultiplier),
        holidayMultiplier: toNumber(formValues.holidayMultiplier),
        nightMultiplier: toNumber(formValues.nightMultiplier),
        nightStartTime: formValues.nightStartTime,
        nightEndTime: formValues.nightEndTime,
        minMinutesToCount: toNumber(formValues.minMinutesToCount),
        roundToMinutes: toNumber(formValues.roundToMinutes),
        maxDailyHours: toNumber(formValues.maxDailyHours),
        maxMonthlyHours: toNumber(formValues.maxMonthlyHours),
      }).unwrap();

      form.reset(formValues);
      toast.success("Overtime rules saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the overtime rules");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <SettingsFieldset canEdit={canEdit}>
          <SectionCard
            icon={CalendarClock}
            title="Thresholds and rates"
            description="Anything worked past a threshold earns the matching rate. Daily is checked first, then weekly, then monthly."
          >
            <FormSwitch
              control={form.control}
              name="enabled"
              label="Pay for overtime"
              description="Turn this off to keep logging extra hours without paying for them."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="dailyThresholdHours"
                label="Daily threshold (hours)"
                type="number"
                step="0.5"
              />
              <FormInput
                control={form.control}
                name="dailyMultiplier"
                label="Daily rate (x normal pay)"
                type="number"
                step="0.1"
              />
              <FormInput
                control={form.control}
                name="weeklyThresholdHours"
                label="Weekly threshold (hours)"
                type="number"
                step="0.5"
              />
              <FormInput
                control={form.control}
                name="weeklyMultiplier"
                label="Weekly rate (x normal pay)"
                type="number"
                step="0.1"
              />
              <FormInput
                control={form.control}
                name="monthlyThresholdHours"
                label="Monthly threshold (hours)"
                type="number"
                step="0.5"
              />
              <FormInput
                control={form.control}
                name="monthlyMultiplier"
                label="Monthly rate (x normal pay)"
                type="number"
                step="0.1"
              />
            </div>

            {values.enabled && (
              <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-sm">
                <p className="mb-2 text-xs font-medium text-muted-foreground">In plain English</p>
                <ul className="space-y-1">
                  <li>
                    Work more than{" "}
                    <span className="font-medium">
                      {toNumber(values.dailyThresholdHours ?? 0)} hours in a day
                    </span>{" "}
                    and every extra hour pays{" "}
                    <span className="font-medium">{toNumber(values.dailyMultiplier ?? 0)}x</span>.
                  </li>
                  <li>
                    Pass{" "}
                    <span className="font-medium">
                      {toNumber(values.weeklyThresholdHours ?? 0)} hours in a week
                    </span>{" "}
                    and the rest of that week pays{" "}
                    <span className="font-medium">{toNumber(values.weeklyMultiplier ?? 0)}x</span>.
                  </li>
                </ul>
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={Moon}
            title="Premium hours"
            description="Higher rates for the hours nobody wants to work."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <FormInput
                control={form.control}
                name="weekOffMultiplier"
                label="Weekly off day rate"
                type="number"
                step="0.1"
              />
              <FormInput
                control={form.control}
                name="holidayMultiplier"
                label="Holiday rate"
                type="number"
                step="0.1"
              />
              <FormInput
                control={form.control}
                name="nightMultiplier"
                label="Night rate"
                type="number"
                step="0.1"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="nightStartTime"
                label="Night starts at"
                type="time"
              />
              <FormInput
                control={form.control}
                name="nightEndTime"
                label="Night ends at"
                type="time"
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Sigma}
            title="How hours are counted"
            description="The smallest block that counts and how odd minutes are rounded."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="minMinutesToCount"
                label="Least minutes that count"
                type="number"
                description="Anything shorter is ignored."
              />
              <FormInput
                control={form.control}
                name="roundToMinutes"
                label="Round to (minutes)"
                type="number"
                description="15 rounds 1h07 down to 1h00."
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Shield}
            title="Approval and limits"
            description="Who signs it off, how it is paid, and the ceiling on how much can be claimed."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                control={form.control}
                name="calculationBase"
                label="Worked out from"
                options={BASE_OPTIONS}
              />
              <FormSelect
                control={form.control}
                name="payout"
                label="Paid as"
                options={PAYOUT_OPTIONS}
              />
              <FormInput
                control={form.control}
                name="maxDailyHours"
                label="Most overtime a day (hours)"
                type="number"
                step="0.5"
              />
              <FormInput
                control={form.control}
                name="maxMonthlyHours"
                label="Most overtime a month (hours)"
                type="number"
                step="0.5"
              />
            </div>

            <FormSwitch
              control={form.control}
              name="requireApproval"
              label="Overtime needs approval before it is paid"
            />
          </SectionCard>
        </SettingsFieldset>

        <SettingsFormFooter
          canEdit={canEdit}
          isDirty={form.formState.isDirty}
          isSaving={isLoading}
          onReset={() => form.reset()}
        />
      </form>
    </Form>
  );
}

export default function OvertimeSettingsPage() {
  const access = useModulePermission("/hrms/settings/overtime");
  const { data: settings, isLoading } = useGetHrmsSettingsQuery();

  return (
    <>
      <PageHeader
        title="Overtime"
        description="When extra hours start counting as overtime, and what each one is worth."
        actions={<BackLink to="/hrms/settings/overview" label="All settings" />}
      />

      {isLoading || !settings ? (
        <LoadingSpinner />
      ) : (
        <OvertimeForm
          key={settings.updatedAt}
          overtime={settings.overtime}
          canEdit={access.canEdit}
        />
      )}
    </>
  );
}
