import { FormInput, FormSelect, FormSwitch } from "@/components/shared/form-fields";
import { SectionCard } from "@/components/shared/section-card";
import { Form } from "@/components/ui/form";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { useUpdateLeaveSettingsMutation } from "@/redux/apis/hrmsSettingsApis";
import {
  LEAVE_ACCRUAL_CYCLES,
  LEAVE_ACCRUAL_CYCLE_LABELS,
  type LeaveSettings,
} from "@/types/domain/hrmsSettings";
import { toNumber } from "@/validations/hrmsSettings";
import { LeavePolicySchema, type LeavePolicyFormValues } from "@/validations/hrmsSettings";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange, FileCheck2, ShieldCheck } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { SettingsFieldset } from "../../components/SettingsFieldset";
import { SettingsFormFooter } from "../../components/SettingsFormFooter";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, index) => ({ value: String(index + 1), label }));

const ACCRUAL_OPTIONS = LEAVE_ACCRUAL_CYCLES.map((value) => ({
  value,
  label: LEAVE_ACCRUAL_CYCLE_LABELS[value],
}));

const toFormValues = (leave: LeaveSettings): LeavePolicyFormValues => ({
  leaveYearStartMonth: String(leave.leaveYearStartMonth),
  accrualCycle: leave.accrualCycle,
  allowNegativeBalance: leave.allowNegativeBalance,
  maxNegativeBalanceDays: leave.maxNegativeBalanceDays,
  carryForwardEnabled: leave.carryForwardEnabled,
  maxCarryForwardDays: leave.maxCarryForwardDays,
  carryForwardExpiryMonths: leave.carryForwardExpiryMonths,
  encashmentEnabled: leave.encashmentEnabled,
  maxEncashmentDays: leave.maxEncashmentDays,
  requireApproval: leave.requireApproval,
  approvalLevels: leave.approvalLevels,
  minNoticeDays: leave.minNoticeDays,
  maxConsecutiveDays: leave.maxConsecutiveDays,
  allowHalfDay: leave.allowHalfDay,
  countWeekendsAsLeave: leave.countWeekendsAsLeave,
  countHolidaysAsLeave: leave.countHolidaysAsLeave,
  probationMonths: leave.probationMonths,
  allowLeaveDuringProbation: leave.allowLeaveDuringProbation,
  documentRequiredAfterDays: leave.documentRequiredAfterDays,
});

export function LeavePolicyForm({
  leave,
  canEdit,
}: {
  leave: LeaveSettings;
  canEdit: boolean;
}) {
  const [updateLeave, { isLoading }] = useUpdateLeaveSettingsMutation();

  const form = useForm<LeavePolicyFormValues>({
    resolver: zodResolver(LeavePolicySchema),
    defaultValues: toFormValues(leave),
    disabled: !canEdit,
  });

  const carryForwardEnabled = useWatch({ control: form.control, name: "carryForwardEnabled" });
  const encashmentEnabled = useWatch({ control: form.control, name: "encashmentEnabled" });
  const allowNegativeBalance = useWatch({ control: form.control, name: "allowNegativeBalance" });
  const requireApproval = useWatch({ control: form.control, name: "requireApproval" });

  const onSubmit = async (values: LeavePolicyFormValues) => {
    try {
      await updateLeave({
        leaveYearStartMonth: Number(values.leaveYearStartMonth),
        accrualCycle: values.accrualCycle,
        allowNegativeBalance: values.allowNegativeBalance,
        maxNegativeBalanceDays: toNumber(values.maxNegativeBalanceDays),
        carryForwardEnabled: values.carryForwardEnabled,
        maxCarryForwardDays: toNumber(values.maxCarryForwardDays),
        carryForwardExpiryMonths: toNumber(values.carryForwardExpiryMonths),
        encashmentEnabled: values.encashmentEnabled,
        maxEncashmentDays: toNumber(values.maxEncashmentDays),
        requireApproval: values.requireApproval,
        approvalLevels: toNumber(values.approvalLevels),
        minNoticeDays: toNumber(values.minNoticeDays),
        maxConsecutiveDays: toNumber(values.maxConsecutiveDays),
        allowHalfDay: values.allowHalfDay,
        countWeekendsAsLeave: values.countWeekendsAsLeave,
        countHolidaysAsLeave: values.countHolidaysAsLeave,
        probationMonths: toNumber(values.probationMonths),
        allowLeaveDuringProbation: values.allowLeaveDuringProbation,
        documentRequiredAfterDays: toNumber(values.documentRequiredAfterDays),
      }).unwrap();

      form.reset(values);
      toast.success("Leave policy saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the leave policy");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <SettingsFieldset canEdit={canEdit}>
          <SectionCard
            icon={CalendarRange}
            title="The leave year"
            description="When entitlement resets and how it builds up across the year."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <FormSelect
                control={form.control}
                name="leaveYearStartMonth"
                label="Leave year starts in"
                options={MONTHS}
              />
              <FormSelect
                control={form.control}
                name="accrualCycle"
                label="Entitlement builds up"
                options={ACCRUAL_OPTIONS}
                description="How often accruing leave types top up."
              />
              <FormInput
                control={form.control}
                name="probationMonths"
                label="Probation length (months)"
                type="number"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormSwitch
                control={form.control}
                name="allowLeaveDuringProbation"
                label="Leave allowed during probation"
                description="Turn off to make new joiners wait out their probation."
              />
              <FormSwitch
                control={form.control}
                name="allowHalfDay"
                label="Half days allowed"
                description="Applies to every leave type that permits them."
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={ShieldCheck}
            title="Balances"
            description="What happens to leave that is left over, and whether people may go into the red."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormSwitch
                control={form.control}
                name="carryForwardEnabled"
                label="Carry unused leave over"
              />
              <FormSwitch
                control={form.control}
                name="encashmentEnabled"
                label="Allow leave encashment"
              />
              <FormSwitch
                control={form.control}
                name="allowNegativeBalance"
                label="Allow a negative balance"
                description="People can borrow against next year's entitlement."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {carryForwardEnabled && (
                <>
                  <FormInput
                    control={form.control}
                    name="maxCarryForwardDays"
                    label="Most days carried over"
                    type="number"
                    step="0.5"
                  />
                  <FormInput
                    control={form.control}
                    name="carryForwardExpiryMonths"
                    label="Carried days expire after (months)"
                    type="number"
                    description="0 keeps them indefinitely."
                  />
                </>
              )}
              {encashmentEnabled && (
                <FormInput
                  control={form.control}
                  name="maxEncashmentDays"
                  label="Most days cashed in"
                  type="number"
                  step="0.5"
                />
              )}
              {allowNegativeBalance && (
                <FormInput
                  control={form.control}
                  name="maxNegativeBalanceDays"
                  label="Most days in the red"
                  type="number"
                  step="0.5"
                />
              )}
            </div>
          </SectionCard>

          <SectionCard
            icon={FileCheck2}
            title="Requesting leave"
            description="The limits and sign-off every leave request runs through."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <FormInput
                control={form.control}
                name="minNoticeDays"
                label="Notice needed (days)"
                type="number"
              />
              <FormInput
                control={form.control}
                name="maxConsecutiveDays"
                label="Most days in a row"
                type="number"
              />
              <FormInput
                control={form.control}
                name="documentRequiredAfterDays"
                label="Document needed after (days)"
                type="number"
                description="0 asks for proof on every request."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormSwitch
                control={form.control}
                name="requireApproval"
                label="Leave needs approval"
                className="sm:col-span-2"
              />
              {requireApproval && (
                <FormInput
                  control={form.control}
                  name="approvalLevels"
                  label="Approval levels"
                  type="number"
                  description="1 to 3 people must sign off."
                />
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormSwitch
                control={form.control}
                name="countWeekendsAsLeave"
                label="Weekends inside leave count as leave"
              />
              <FormSwitch
                control={form.control}
                name="countHolidaysAsLeave"
                label="Holidays inside leave count as leave"
              />
            </div>
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
