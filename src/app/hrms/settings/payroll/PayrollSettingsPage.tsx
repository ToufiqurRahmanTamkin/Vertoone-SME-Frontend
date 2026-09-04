import { BackLink } from "@/components/shared/back-link";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Form } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useModulePermission } from "@/hooks/use-permission";
import {
  useGetHrmsSettingsQuery,
  useUpdatePayrollSettingsMutation,
} from "@/redux/apis/hrmsSettingsApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PAYROLL_DAY_BASES,
  PAYROLL_DAY_BASIS_LABELS,
  PAY_CYCLES,
  PAY_CYCLE_LABELS,
  ROUNDING_MODES,
  ROUNDING_MODE_LABELS,
  type PayrollSettings,
} from "@/types/domain/hrmsSettings";
import { PayrollSchema, toNumber, type PayrollFormValues } from "@/validations/hrmsSettings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, CalendarClock, Landmark, Receipt } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SettingsFieldset } from "../components/SettingsFieldset";
import { SettingsFormFooter } from "../components/SettingsFormFooter";
import {
  SettingsTabs,
  useSettingsTabs,
  type SettingsTab,
} from "../components/SettingsTabs";

const CYCLE_OPTIONS = PAY_CYCLES.map((value) => ({ value, label: PAY_CYCLE_LABELS[value] }));

const BASIS_OPTIONS = PAYROLL_DAY_BASES.map((value) => ({
  value,
  label: PAYROLL_DAY_BASIS_LABELS[value],
}));

const ROUNDING_OPTIONS = ROUNDING_MODES.map((value) => ({
  value,
  label: ROUNDING_MODE_LABELS[value],
}));

const toFormValues = (payroll: PayrollSettings): PayrollFormValues => ({
  payCycle: payroll.payCycle,
  payDay: payroll.payDay,
  cutoffDay: payroll.cutoffDay,
  dayBasis: payroll.dayBasis,
  fixedDaysPerMonth: payroll.fixedDaysPerMonth,
  roundingMode: payroll.roundingMode,
  roundTo: payroll.roundTo,
  basicPercentOfGross: payroll.basicPercentOfGross,
  includeOvertime: payroll.includeOvertime,
  includeLateFine: payroll.includeLateFine,
  includeUnpaidLeaveDeduction: payroll.includeUnpaidLeaveDeduction,
  taxEnabled: payroll.taxEnabled,
  taxPercent: payroll.taxPercent,
  festivalBonusEnabled: payroll.festivalBonusEnabled,
  festivalBonusPerYear: payroll.festivalBonusPerYear,
  payslipPrefix: payroll.payslipPrefix,
  payslipNote: payroll.payslipNote,
  autoGeneratePayslips: payroll.autoGeneratePayslips,
  lockAfterApproval: payroll.lockAfterApproval,
});

function PayrollForm({
  payroll,
  canEdit,
}: {
  payroll: PayrollSettings;
  canEdit: boolean;
}) {
  const [updatePayroll, { isLoading }] = useUpdatePayrollSettingsMutation();

  const form = useForm<PayrollFormValues>({
    resolver: zodResolver(PayrollSchema),
    defaultValues: toFormValues(payroll),
    disabled: !canEdit,
  });

  const dayBasis = useWatch({ control: form.control, name: "dayBasis" });
  const roundingMode = useWatch({ control: form.control, name: "roundingMode" });
  const taxEnabled = useWatch({ control: form.control, name: "taxEnabled" });
  const festivalBonusEnabled = useWatch({ control: form.control, name: "festivalBonusEnabled" });

  const onSubmit = async (values: PayrollFormValues) => {
    try {
      await updatePayroll({
        payCycle: values.payCycle,
        payDay: toNumber(values.payDay),
        cutoffDay: toNumber(values.cutoffDay),
        dayBasis: values.dayBasis,
        fixedDaysPerMonth: toNumber(values.fixedDaysPerMonth),
        roundingMode: values.roundingMode,
        roundTo: toNumber(values.roundTo),
        basicPercentOfGross: toNumber(values.basicPercentOfGross),
        includeOvertime: values.includeOvertime,
        includeLateFine: values.includeLateFine,
        includeUnpaidLeaveDeduction: values.includeUnpaidLeaveDeduction,
        taxEnabled: values.taxEnabled,
        taxPercent: toNumber(values.taxPercent),
        festivalBonusEnabled: values.festivalBonusEnabled,
        festivalBonusPerYear: toNumber(values.festivalBonusPerYear),
        payslipPrefix: values.payslipPrefix,
        payslipNote: values.payslipNote,
        autoGeneratePayslips: values.autoGeneratePayslips,
        lockAfterApproval: values.lockAfterApproval,
      }).unwrap();

      form.reset(values);
      toast.success("Payroll settings saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the payroll settings");
    }
  };

  const tabs: SettingsTab[] = [
    {
      value: "pay-run",
      label: "Pay run",
      fields: [
        "payCycle",
        "payDay",
        "cutoffDay",
        "autoGeneratePayslips",
        "lockAfterApproval",
      ],
      content: (
        <SectionCard
          icon={CalendarClock}
          title="The pay run"
          description="How often people are paid and where the attendance window closes."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <FormSelect
              control={form.control}
              name="payCycle"
              label="Pay cycle"
              options={CYCLE_OPTIONS}
            />
            <FormInput
              control={form.control}
              name="payDay"
              label="Pay day"
              type="number"
              description="Day of the month salaries are released."
            />
            <FormInput
              control={form.control}
              name="cutoffDay"
              label="Attendance cut-off day"
              type="number"
              description="Days after this fall into the next run."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormSwitch
              control={form.control}
              name="autoGeneratePayslips"
              label="Generate payslips automatically"
              description="Draft payslips are created when the cycle closes."
            />
            <FormSwitch
              control={form.control}
              name="lockAfterApproval"
              label="Lock a payslip once approved"
              description="Stops anybody editing a run that has been signed off."
            />
          </div>
        </SectionCard>
      ),
    },
    {
      value: "day-rate",
      label: "Day rate",
      fields: [
        "dayBasis",
        "fixedDaysPerMonth",
        "basicPercentOfGross",
        "roundingMode",
        "roundTo",
        "includeOvertime",
        "includeLateFine",
        "includeUnpaidLeaveDeduction",
      ],
      content: (
        <SectionCard
          icon={Calculator}
          title="How a day of pay is worked out"
          description="The divisor behind every per-day and per-hour figure on a payslip."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <FormSelect
              control={form.control}
              name="dayBasis"
              label="A month counts as"
              options={BASIS_OPTIONS}
            />
            {dayBasis === "FIXED_DAYS" && (
              <FormInput
                control={form.control}
                name="fixedDaysPerMonth"
                label="Days in a month"
                type="number"
                description="30 is the common choice."
              />
            )}
            <FormInput
              control={form.control}
              name="basicPercentOfGross"
              label="Basic as % of gross"
              type="number"
              description="Used when a salary is entered as one gross figure."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect
              control={form.control}
              name="roundingMode"
              label="Round net pay"
              options={ROUNDING_OPTIONS}
            />
            {roundingMode !== "NONE" && (
              <FormInput
                control={form.control}
                name="roundTo"
                label="Round to the nearest"
                type="number"
              />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormSwitch
              control={form.control}
              name="includeOvertime"
              label="Add approved overtime"
            />
            <FormSwitch
              control={form.control}
              name="includeLateFine"
              label="Apply late fines"
            />
            <FormSwitch
              control={form.control}
              name="includeUnpaidLeaveDeduction"
              label="Deduct unpaid leave"
            />
          </div>
        </SectionCard>
      ),
    },
    {
      value: "deductions",
      label: "Deductions",
      fields: ["taxEnabled", "festivalBonusEnabled", "taxPercent", "festivalBonusPerYear"],
      content: (
        <SectionCard
          icon={Landmark}
          title="Statutory deductions"
          description="Tax and bonus rules applied to every payslip."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FormSwitch control={form.control} name="taxEnabled" label="Deduct income tax" />
            <FormSwitch
              control={form.control}
              name="festivalBonusEnabled"
              label="Pay a festival bonus"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {taxEnabled && (
              <FormInput
                control={form.control}
                name="taxPercent"
                label="Tax rate (%)"
                type="number"
                step="0.1"
              />
            )}
            {festivalBonusEnabled && (
              <FormInput
                control={form.control}
                name="festivalBonusPerYear"
                label="Bonuses a year"
                type="number"
              />
            )}
          </div>

          <p className="rounded-lg border border-dashed bg-muted/20 p-3 text-sm text-muted-foreground">
            Provident fund contributions have their own rules.{" "}
            <Link
              to="/hrms/settings/provident-fund"
              className="font-medium text-primary hover:underline"
            >
              Open provident fund settings
            </Link>
            .
          </p>
        </SectionCard>
      ),
    },
    {
      value: "payslips",
      label: "Payslips",
      fields: ["payslipPrefix", "payslipNote"],
      content: (
        <SectionCard
          icon={Receipt}
          title="Payslips"
          description="How generated payslips are numbered and what they say at the bottom."
        >
          <FormInput
            control={form.control}
            name="payslipPrefix"
            label="Payslip number prefix"
            placeholder="PS"
            className="sm:max-w-xs"
          />
          <FormTextarea
            control={form.control}
            name="payslipNote"
            label="Footer note"
            placeholder="Anything that should appear on every payslip (optional)"
          />
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

export default function PayrollSettingsPage() {
  const access = useModulePermission("/hrms/settings/payroll");
  const { data: settings, isLoading } = useGetHrmsSettingsQuery();

  return (
    <>
      <PageHeader
        title="Payroll"
        description="The pay cycle, how a day of pay is calculated and the deductions applied to every payslip."
        actions={<BackLink to="/hrms/settings/overview" label="All settings" />}
      />

      {isLoading || !settings ? (
        <LoadingSpinner />
      ) : (
        <PayrollForm
          key={settings.updatedAt}
          payroll={settings.payroll}
          canEdit={access.canEdit}
        />
      )}
    </>
  );
}
