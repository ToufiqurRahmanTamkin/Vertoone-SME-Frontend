import { BackLink } from "@/components/shared/back-link";
import { FormInput, FormSelect, FormSwitch } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useModulePermission } from "@/hooks/use-permission";
import {
  useGetHrmsSettingsQuery,
  useUpdateLateFineSettingsMutation,
} from "@/redux/apis/hrmsSettingsApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  FINE_DEDUCTION_TYPES,
  FINE_DEDUCTION_TYPE_LABELS,
  FINE_RESET_CYCLES,
  FINE_RESET_CYCLE_LABELS,
  type FineDeductionType,
  type LateFineSettings,
} from "@/types/domain/hrmsSettings";
import { LateFineSchema, toNumber, type LateFineFormValues } from "@/validations/hrmsSettings";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarX2, Gauge, Percent, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { SettingsFieldset } from "../components/SettingsFieldset";
import { SettingsFormFooter } from "../components/SettingsFormFooter";
import {
  SettingsTabs,
  useSettingsTabs,
  type SettingsTab,
} from "../components/SettingsTabs";

const MAX_RULES = 10;

const DEDUCTION_OPTIONS = FINE_DEDUCTION_TYPES.map((value) => ({
  value,
  label: FINE_DEDUCTION_TYPE_LABELS[value],
}));

const CYCLE_OPTIONS = FINE_RESET_CYCLES.map((value) => ({
  value,
  label: FINE_RESET_CYCLE_LABELS[value],
}));

const describeDeduction = (type: FineDeductionType, value: number): string => {
  if (type === "BASIC_DAYS") return `${value} day${value === 1 ? "" : "s"} of basic pay`;
  if (type === "PERCENT_OF_BASIC") return `${value}% of basic pay`;
  return `a flat ${value}`;
};

const toFormValues = (lateFine: LateFineSettings): LateFineFormValues => ({
  enabled: lateFine.enabled,
  lateAfterMinutes: lateFine.lateAfterMinutes,
  graceLatesPerCycle: lateFine.graceLatesPerCycle,
  resetCycle: lateFine.resetCycle,
  rules: lateFine.rules.map((rule) => ({
    lateCount: rule.lateCount,
    deductionType: rule.deductionType,
    value: rule.value,
  })),
  earlyLeaveCountsAsLate: lateFine.earlyLeaveCountsAsLate,
  earlyLeaveAfterMinutes: lateFine.earlyLeaveAfterMinutes,
  absentDeductionDays: lateFine.absentDeductionDays,
  halfDayDeductionDays: lateFine.halfDayDeductionDays,
  maxDeductionPercentOfBasic: lateFine.maxDeductionPercentOfBasic,
  roundToNearest: lateFine.roundToNearest,
});

function LateFineForm({
  lateFine,
  canEdit,
}: {
  lateFine: LateFineSettings;
  canEdit: boolean;
}) {
  const [updateLateFine, { isLoading }] = useUpdateLateFineSettingsMutation();

  const form = useForm<LateFineFormValues>({
    resolver: zodResolver(LateFineSchema),
    defaultValues: toFormValues(lateFine),
    disabled: !canEdit,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "rules" });

  const enabled = useWatch({ control: form.control, name: "enabled" });
  const rules = useWatch({ control: form.control, name: "rules" });
  const lateAfterMinutes = useWatch({ control: form.control, name: "lateAfterMinutes" });
  const resetCycle = useWatch({ control: form.control, name: "resetCycle" });
  const earlyLeaveCountsAsLate = useWatch({
    control: form.control,
    name: "earlyLeaveCountsAsLate",
  });

  const onSubmit = async (values: LateFineFormValues) => {
    try {
      await updateLateFine({
        enabled: values.enabled,
        lateAfterMinutes: toNumber(values.lateAfterMinutes),
        graceLatesPerCycle: toNumber(values.graceLatesPerCycle),
        resetCycle: values.resetCycle,
        rules: values.rules.map((rule) => ({
          lateCount: toNumber(rule.lateCount),
          deductionType: rule.deductionType,
          value: toNumber(rule.value),
        })),
        earlyLeaveCountsAsLate: values.earlyLeaveCountsAsLate,
        earlyLeaveAfterMinutes: toNumber(values.earlyLeaveAfterMinutes),
        absentDeductionDays: toNumber(values.absentDeductionDays),
        halfDayDeductionDays: toNumber(values.halfDayDeductionDays),
        maxDeductionPercentOfBasic: toNumber(values.maxDeductionPercentOfBasic),
        roundToNearest: toNumber(values.roundToNearest),
      }).unwrap();

      form.reset(values);
      toast.success("Late fine rules saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the late fine rules");
    }
  };

  const cycleWord =
    resetCycle === "WEEKLY" ? "week" : resetCycle === "YEARLY" ? "year" : "month";

  const tabs: SettingsTab[] = [
    {
      value: "counting",
      label: "Counting lates",
      fields: ["enabled", "lateAfterMinutes", "graceLatesPerCycle", "resetCycle"],
      content: (
        <SectionCard
          icon={Gauge}
          title="When lateness starts counting"
          description="A late arrival is anything past the shift start plus this window. The tally resets at the end of each cycle."
        >
          <FormSwitch
            control={form.control}
            name="enabled"
            label="Deduct pay for repeated lateness"
            description="Turn this off to keep tracking lateness without any deduction."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              control={form.control}
              name="lateAfterMinutes"
              label="Late after (minutes)"
              type="number"
              description="An 8:00 shift set to 15 marks 8:16 as late."
            />
            <FormInput
              control={form.control}
              name="graceLatesPerCycle"
              label="Free lates per cycle"
              type="number"
              description="Ignored before any deduction applies."
            />
            <FormSelect
              control={form.control}
              name="resetCycle"
              label="Tally resets"
              options={CYCLE_OPTIONS}
            />
          </div>
        </SectionCard>
      ),
    },
    {
      value: "steps",
      label: "Fine steps",
      fields: ["rules"],
      content: (
        <SectionCard
          icon={Percent}
          title="What lateness costs"
          description="Add a step for each threshold. The highest step an employee reaches in the cycle is the one that applies."
          action={
            canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={fields.length >= MAX_RULES}
                onClick={() =>
                  append({
                    lateCount: (rules?.length ?? 0) * 3 + 3,
                    deductionType: "BASIC_DAYS",
                    value: 1,
                  })
                }
              >
                <Plus className="size-3.5" />
                Add step
              </Button>
            )
          }
        >
          {fields.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              No steps yet. Add one to say what happens after a number of late arrivals.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid items-end gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[auto_1fr_1fr_auto]"
                >
                  <FormInput
                    control={form.control}
                    name={`rules.${index}.lateCount`}
                    label="After (lates)"
                    type="number"
                    className="sm:w-32"
                  />
                  <FormSelect
                    control={form.control}
                    name={`rules.${index}.deductionType`}
                    label="Deduct"
                    options={DEDUCTION_OPTIONS}
                  />
                  <FormInput
                    control={form.control}
                    name={`rules.${index}.value`}
                    label="Amount"
                    type="number"
                    step="0.5"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 cursor-pointer text-destructive hover:text-destructive"
                    aria-label={`Remove step ${index + 1}`}
                    disabled={!canEdit}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {form.formState.errors.rules?.root?.message && (
            <p className="text-sm text-destructive">
              {form.formState.errors.rules.root.message}
            </p>
          )}

          {enabled && (rules?.length ?? 0) > 0 && (
            <div className="rounded-lg border border-dashed bg-muted/20 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">In plain English</p>
              <ul className="space-y-1 text-sm">
                {rules.map((rule, index) => (
                  <li key={index}>
                    Clock in more than {toNumber(lateAfterMinutes)} minutes late{" "}
                    <span className="font-medium">{toNumber(rule.lateCount)} times</span> in a{" "}
                    {cycleWord} and{" "}
                    <span className="font-medium">
                      {describeDeduction(rule.deductionType, toNumber(rule.value))}
                    </span>{" "}
                    is deducted.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>
      ),
    },
    {
      value: "absence",
      label: "Early & absent",
      fields: [
        "earlyLeaveCountsAsLate",
        "earlyLeaveAfterMinutes",
        "absentDeductionDays",
        "halfDayDeductionDays",
      ],
      content: (
        <SectionCard
          icon={CalendarX2}
          title="Leaving early, half days and absence"
          description="Deductions for the rest of the ways a day can fall short."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSwitch
              control={form.control}
              name="earlyLeaveCountsAsLate"
              label="Leaving early counts towards the tally"
            />
            {earlyLeaveCountsAsLate && (
              <FormInput
                control={form.control}
                name="earlyLeaveAfterMinutes"
                label="Early leave after (minutes)"
                type="number"
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              control={form.control}
              name="absentDeductionDays"
              label="Days deducted for an absence"
              type="number"
              step="0.5"
            />
            <FormInput
              control={form.control}
              name="halfDayDeductionDays"
              label="Days deducted for a half day"
              type="number"
              step="0.5"
            />
          </div>
        </SectionCard>
      ),
    },
    {
      value: "limits",
      label: "Safety limits",
      fields: ["maxDeductionPercentOfBasic", "roundToNearest"],
      content: (
        <SectionCard
          icon={Gauge}
          title="Safety limits"
          description="A ceiling on how much one payslip can lose to fines, and how amounts are rounded."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              control={form.control}
              name="maxDeductionPercentOfBasic"
              label="Most that can be deducted (% of basic)"
              type="number"
            />
            <FormInput
              control={form.control}
              name="roundToNearest"
              label="Round deductions to the nearest"
              type="number"
              description="0 keeps the exact amount."
            />
          </div>
        </SectionCard>
      ),
    },
  ];

  const { tab, setTab, showFirstError } = useSettingsTabs(tabs);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, showFirstError)} className="flex flex-col gap-4">
        <SettingsFieldset canEdit={canEdit}>
          <SettingsTabs tabs={tabs} value={tab} onValueChange={setTab} />
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

export default function LateFineSettingsPage() {
  const access = useModulePermission("/hrms/settings/late-fine-rules");
  const { data: settings, isLoading } = useGetHrmsSettingsQuery();

  return (
    <>
      <PageHeader
        title="Late fine rules"
        description="What repeated lateness, early leaves and absences cost an employee at the end of the cycle."
        actions={<BackLink to="/hrms/settings/overview" label="All settings" />}
      />

      {isLoading || !settings ? (
        <LoadingSpinner />
      ) : (
        <LateFineForm
          key={settings.updatedAt}
          lateFine={settings.lateFine}
          canEdit={access.canEdit}
        />
      )}
    </>
  );
}
