import { BackLink } from "@/components/shared/back-link";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useModulePermission } from "@/hooks/use-permission";
import {
  useGetHrmsSettingsQuery,
  useUpdateProvidentFundSettingsMutation,
} from "@/redux/apis/hrmsSettingsApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  MAX_PF_WITHDRAWAL_RULES,
  PF_CONTRIBUTION_BASES,
  PF_CONTRIBUTION_BASE_LABELS,
  PF_ELIGIBILITY_MODES,
  PF_ELIGIBILITY_MODE_LABELS,
  PF_WITHDRAWAL_TYPES,
  PF_WITHDRAWAL_TYPE_LABELS,
  ROUNDING_MODES,
  ROUNDING_MODE_LABELS,
  type ProvidentFundSettings,
} from "@/types/domain/hrmsSettings";
import {
  ProvidentFundSchema,
  toNumber,
  type ProvidentFundFormValues,
} from "@/validations/hrmsSettings";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgePercent,
  Banknote,
  HandCoins,
  Landmark,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { SettingsFieldset } from "../components/SettingsFieldset";
import { SettingsFormFooter } from "../components/SettingsFormFooter";
import { SettingsTabs, useSettingsTabs, type SettingsTab } from "../components/SettingsTabs";

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

const BASE_OPTIONS = PF_CONTRIBUTION_BASES.map((value) => ({
  value,
  label: PF_CONTRIBUTION_BASE_LABELS[value],
}));

const ELIGIBILITY_OPTIONS = PF_ELIGIBILITY_MODES.map((value) => ({
  value,
  label: PF_ELIGIBILITY_MODE_LABELS[value],
}));

const ROUNDING_OPTIONS = ROUNDING_MODES.map((value) => ({
  value,
  label: ROUNDING_MODE_LABELS[value],
}));

const WITHDRAWAL_OPTIONS = PF_WITHDRAWAL_TYPES.map((value) => ({
  value,
  label: PF_WITHDRAWAL_TYPE_LABELS[value],
}));

const monthWord = (months: number): string => `${months} month${months === 1 ? "" : "s"}`;

const toFormValues = (fund: ProvidentFundSettings): ProvidentFundFormValues => ({
  enabled: fund.enabled,
  schemeName: fund.schemeName,
  registrationNumber: fund.registrationNumber,
  trustName: fund.trustName,
  contributionBase: fund.contributionBase,
  employeePercent: fund.employeePercent,
  employerPercent: fund.employerPercent,
  wageCeilingEnabled: fund.wageCeilingEnabled,
  wageCeilingAmount: fund.wageCeilingAmount,
  minMonthlyContribution: fund.minMonthlyContribution,
  roundingMode: fund.roundingMode,
  roundTo: fund.roundTo,
  allowVoluntaryTopUp: fund.allowVoluntaryTopUp,
  maxVoluntaryPercent: fund.maxVoluntaryPercent,
  eligibilityMode: fund.eligibilityMode,
  eligibilityAfterMonths: fund.eligibilityAfterMonths,
  minAgeYears: fund.minAgeYears,
  excludeContractStaff: fund.excludeContractStaff,
  excludeInterns: fund.excludeInterns,
  employerContributionVests: fund.employerContributionVests,
  vestingAfterMonths: fund.vestingAfterMonths,
  forfeitUnvestedOnExit: fund.forfeitUnvestedOnExit,
  interestEnabled: fund.interestEnabled,
  annualInterestPercent: fund.annualInterestPercent,
  interestCreditMonth: String(fund.interestCreditMonth),
  loansEnabled: fund.loansEnabled,
  maxLoanPercentOfBalance: fund.maxLoanPercentOfBalance,
  maxLoanTenureMonths: fund.maxLoanTenureMonths,
  minMonthsBetweenLoans: fund.minMonthsBetweenLoans,
  withdrawalRules: fund.withdrawalRules.map((rule) => ({
    type: rule.type,
    minMonthsOfService: rule.minMonthsOfService,
    maxPercentOfBalance: rule.maxPercentOfBalance,
    requiresApproval: rule.requiresApproval,
  })),
  requireNominee: fund.requireNominee,
  maxNominees: fund.maxNominees,
  statementFrequencyMonths: fund.statementFrequencyMonths,
  notes: fund.notes,
});

function ProvidentFundForm({
  fund,
  canEdit,
}: {
  fund: ProvidentFundSettings;
  canEdit: boolean;
}) {
  const [updateProvidentFund, { isLoading }] = useUpdateProvidentFundSettingsMutation();

  const form = useForm<ProvidentFundFormValues>({
    resolver: zodResolver(ProvidentFundSchema),
    defaultValues: toFormValues(fund),
    disabled: !canEdit,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "withdrawalRules",
  });

  const enabled = useWatch({ control: form.control, name: "enabled" });
  const contributionBase = useWatch({ control: form.control, name: "contributionBase" });
  const employeePercent = useWatch({ control: form.control, name: "employeePercent" });
  const employerPercent = useWatch({ control: form.control, name: "employerPercent" });
  const wageCeilingEnabled = useWatch({ control: form.control, name: "wageCeilingEnabled" });
  const roundingMode = useWatch({ control: form.control, name: "roundingMode" });
  const allowVoluntaryTopUp = useWatch({ control: form.control, name: "allowVoluntaryTopUp" });
  const eligibilityMode = useWatch({ control: form.control, name: "eligibilityMode" });
  const employerContributionVests = useWatch({
    control: form.control,
    name: "employerContributionVests",
  });
  const interestEnabled = useWatch({ control: form.control, name: "interestEnabled" });
  const loansEnabled = useWatch({ control: form.control, name: "loansEnabled" });
  const maxLoanPercentOfBalance = useWatch({
    control: form.control,
    name: "maxLoanPercentOfBalance",
  });
  const maxLoanTenureMonths = useWatch({ control: form.control, name: "maxLoanTenureMonths" });
  const requireNominee = useWatch({ control: form.control, name: "requireNominee" });
  const rules = useWatch({ control: form.control, name: "withdrawalRules" });

  const usedTypes = new Set((rules ?? []).map((rule) => rule.type));
  const nextType = PF_WITHDRAWAL_TYPES.find((type) => !usedTypes.has(type));

  const onSubmit = async (values: ProvidentFundFormValues) => {
    try {
      await updateProvidentFund({
        enabled: values.enabled,
        schemeName: values.schemeName,
        registrationNumber: values.registrationNumber,
        trustName: values.trustName,
        contributionBase: values.contributionBase,
        employeePercent: toNumber(values.employeePercent),
        employerPercent: toNumber(values.employerPercent),
        wageCeilingEnabled: values.wageCeilingEnabled,
        wageCeilingAmount: toNumber(values.wageCeilingAmount),
        minMonthlyContribution: toNumber(values.minMonthlyContribution),
        roundingMode: values.roundingMode,
        roundTo: toNumber(values.roundTo),
        allowVoluntaryTopUp: values.allowVoluntaryTopUp,
        maxVoluntaryPercent: toNumber(values.maxVoluntaryPercent),
        eligibilityMode: values.eligibilityMode,
        eligibilityAfterMonths: toNumber(values.eligibilityAfterMonths),
        minAgeYears: toNumber(values.minAgeYears),
        excludeContractStaff: values.excludeContractStaff,
        excludeInterns: values.excludeInterns,
        employerContributionVests: values.employerContributionVests,
        vestingAfterMonths: toNumber(values.vestingAfterMonths),
        forfeitUnvestedOnExit: values.forfeitUnvestedOnExit,
        interestEnabled: values.interestEnabled,
        annualInterestPercent: toNumber(values.annualInterestPercent),
        interestCreditMonth: Number(values.interestCreditMonth),
        loansEnabled: values.loansEnabled,
        maxLoanPercentOfBalance: toNumber(values.maxLoanPercentOfBalance),
        maxLoanTenureMonths: toNumber(values.maxLoanTenureMonths),
        minMonthsBetweenLoans: toNumber(values.minMonthsBetweenLoans),
        withdrawalRules: values.withdrawalRules.map((rule) => ({
          type: rule.type,
          minMonthsOfService: toNumber(rule.minMonthsOfService),
          maxPercentOfBalance: toNumber(rule.maxPercentOfBalance),
          requiresApproval: rule.requiresApproval,
        })),
        requireNominee: values.requireNominee,
        maxNominees: toNumber(values.maxNominees),
        statementFrequencyMonths: toNumber(values.statementFrequencyMonths),
        notes: values.notes,
      }).unwrap();

      form.reset(values);
      toast.success("Provident fund settings saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the provident fund settings");
    }
  };

  const tabs: SettingsTab[] = [
    {
      value: "scheme",
      label: "Scheme",
      fields: ["enabled", "schemeName", "registrationNumber", "trustName", "notes"],
      content: (
        <SectionCard
          icon={Landmark}
          title="The fund itself"
          description="Turn the fund on and record who administers it. These details print on statements."
        >
          <FormSwitch
            control={form.control}
            name="enabled"
            label="Run a provident fund"
            description="While this is off no contribution is deducted and the rest of these rules sit idle."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              control={form.control}
              name="schemeName"
              label="Scheme name"
              placeholder="Employees Provident Fund"
            />
            <FormInput
              control={form.control}
              name="registrationNumber"
              label="Registration number"
              placeholder="Issued by the regulator"
            />
            <FormInput
              control={form.control}
              name="trustName"
              label="Trust or administrator"
              placeholder="Who holds the money"
            />
          </div>

          <FormTextarea
            control={form.control}
            name="notes"
            label="Internal notes"
            placeholder="Anything your payroll team should know about this scheme (optional)"
          />
        </SectionCard>
      ),
    },
    {
      value: "contributions",
      label: "Contributions",
      fields: [
        "contributionBase",
        "employeePercent",
        "employerPercent",
        "wageCeilingEnabled",
        "wageCeilingAmount",
        "minMonthlyContribution",
        "roundingMode",
        "roundTo",
        "allowVoluntaryTopUp",
        "maxVoluntaryPercent",
      ],
      content: (
        <SectionCard
          icon={BadgePercent}
          title="What goes in each month"
          description="The share each side puts in, what it is a share of, and where it is capped."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <FormSelect
              control={form.control}
              name="contributionBase"
              label="Contribution is a share of"
              options={BASE_OPTIONS}
            />
            <FormInput
              control={form.control}
              name="employeePercent"
              label="Employee share (%)"
              type="number"
              step="0.1"
            />
            <FormInput
              control={form.control}
              name="employerPercent"
              label="Employer share (%)"
              type="number"
              step="0.1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormSwitch
              control={form.control}
              name="wageCeilingEnabled"
              label="Cap the wage it is worked out on"
              description="Pay above the ceiling is ignored."
            />
            {wageCeilingEnabled && (
              <FormInput
                control={form.control}
                name="wageCeilingAmount"
                label="Wage ceiling"
                type="number"
              />
            )}
            <FormInput
              control={form.control}
              name="minMonthlyContribution"
              label="Minimum a month"
              type="number"
              description="Floor applied once someone is enrolled."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect
              control={form.control}
              name="roundingMode"
              label="Round each contribution"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <FormSwitch
              control={form.control}
              name="allowVoluntaryTopUp"
              label="Allow a voluntary top-up"
              description="Employees may put in more than the standard share."
            />
            {allowVoluntaryTopUp && (
              <FormInput
                control={form.control}
                name="maxVoluntaryPercent"
                label="Most they may add (%)"
                type="number"
                step="0.1"
              />
            )}
          </div>

          {enabled && (
            <div className="rounded-lg border border-dashed bg-muted/20 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">In plain English</p>
              <p className="text-sm">
                Every month{" "}
                <span className="font-medium">{toNumber(employeePercent)}%</span> comes out of the
                employee&apos;s{" "}
                {PF_CONTRIBUTION_BASE_LABELS[contributionBase].toLowerCase()} and the company adds{" "}
                <span className="font-medium">{toNumber(employerPercent)}%</span> on top, so{" "}
                <span className="font-medium">
                  {toNumber(employeePercent) + toNumber(employerPercent)}%
                </span>{" "}
                lands in the fund.
              </p>
            </div>
          )}
        </SectionCard>
      ),
    },
    {
      value: "eligibility",
      label: "Eligibility",
      fields: [
        "eligibilityMode",
        "eligibilityAfterMonths",
        "minAgeYears",
        "excludeContractStaff",
        "excludeInterns",
        "employerContributionVests",
        "vestingAfterMonths",
        "forfeitUnvestedOnExit",
      ],
      content: (
        <>
          <SectionCard
            icon={UserCheck}
            title="Who joins, and when"
            description="The point at which an employee starts contributing, and who is left out."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <FormSelect
                control={form.control}
                name="eligibilityMode"
                label="Employees join"
                options={ELIGIBILITY_OPTIONS}
              />
              {eligibilityMode === "AFTER_MONTHS" && (
                <FormInput
                  control={form.control}
                  name="eligibilityAfterMonths"
                  label="After (months)"
                  type="number"
                />
              )}
              <FormInput
                control={form.control}
                name="minAgeYears"
                label="Minimum age"
                type="number"
                description="Nobody younger is enrolled."
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormSwitch
                control={form.control}
                name="excludeContractStaff"
                label="Leave contract staff out"
              />
              <FormSwitch
                control={form.control}
                name="excludeInterns"
                label="Leave interns out"
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={ShieldCheck}
            title="Vesting"
            description="How long somebody must stay before the employer's share is theirs to keep."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <FormSwitch
                control={form.control}
                name="employerContributionVests"
                label="Employer share vests over time"
                description="Off means it is theirs from the first month."
              />
              {employerContributionVests && (
                <>
                  <FormInput
                    control={form.control}
                    name="vestingAfterMonths"
                    label="Vests after (months)"
                    type="number"
                  />
                  <FormSwitch
                    control={form.control}
                    name="forfeitUnvestedOnExit"
                    label="Forfeit the unvested part on exit"
                    description="Unvested money returns to the fund."
                  />
                </>
              )}
            </div>
          </SectionCard>
        </>
      ),
    },
    {
      value: "growth",
      label: "Interest & loans",
      fields: [
        "interestEnabled",
        "annualInterestPercent",
        "interestCreditMonth",
        "loansEnabled",
        "maxLoanPercentOfBalance",
        "maxLoanTenureMonths",
        "minMonthsBetweenLoans",
      ],
      content: (
        <>
          <SectionCard
            icon={Banknote}
            title="Interest credited to balances"
            description="What the fund pays on a member's balance, and when it lands."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <FormSwitch
                control={form.control}
                name="interestEnabled"
                label="Credit interest"
              />
              {interestEnabled && (
                <>
                  <FormInput
                    control={form.control}
                    name="annualInterestPercent"
                    label="Annual rate (%)"
                    type="number"
                    step="0.1"
                  />
                  <FormSelect
                    control={form.control}
                    name="interestCreditMonth"
                    label="Credited in"
                    options={MONTHS}
                  />
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard
            icon={HandCoins}
            title="Loans against the fund"
            description="Whether members may borrow from their own balance, and on what terms."
          >
            <div className="grid gap-4 sm:grid-cols-4">
              <FormSwitch
                control={form.control}
                name="loansEnabled"
                label="Allow loans"
              />
              {loansEnabled && (
                <>
                  <FormInput
                    control={form.control}
                    name="maxLoanPercentOfBalance"
                    label="Most of the balance (%)"
                    type="number"
                  />
                  <FormInput
                    control={form.control}
                    name="maxLoanTenureMonths"
                    label="Longest tenure (months)"
                    type="number"
                  />
                  <FormInput
                    control={form.control}
                    name="minMonthsBetweenLoans"
                    label="Gap between loans (months)"
                    type="number"
                  />
                </>
              )}
            </div>

            {loansEnabled && (
              <p className="rounded-lg border border-dashed bg-muted/20 p-3 text-sm">
                A member may borrow up to{" "}
                <span className="font-medium">{toNumber(maxLoanPercentOfBalance)}%</span> of
                their balance, repaid over at most{" "}
                <span className="font-medium">{monthWord(toNumber(maxLoanTenureMonths))}</span>
                .
              </p>
            )}
          </SectionCard>
        </>
      ),
    },
    {
      value: "withdrawals",
      label: "Withdrawals",
      fields: [
        "withdrawalRules",
        "requireNominee",
        "maxNominees",
        "statementFrequencyMonths",
      ],
      content: (
        <>
          <SectionCard
            icon={HandCoins}
            title="When money can be taken out"
            description="Add a rule per reason. Anything not listed here cannot be withdrawn early."
            action={
              canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  disabled={fields.length >= MAX_PF_WITHDRAWAL_RULES || !nextType}
                  onClick={() =>
                    nextType &&
                    append({
                      type: nextType,
                      minMonthsOfService: 12,
                      maxPercentOfBalance: 50,
                      requiresApproval: true,
                    })
                  }
                >
                  <Plus className="size-3.5" />
                  Add reason
                </Button>
              )
            }
          >
            {fields.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                No reasons yet. Add one to say when a member may draw on the fund.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid items-end gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[1fr_1fr_1fr_auto_auto]"
                  >
                    <FormSelect
                      control={form.control}
                      name={`withdrawalRules.${index}.type`}
                      label="Reason"
                      options={WITHDRAWAL_OPTIONS}
                    />
                    <FormInput
                      control={form.control}
                      name={`withdrawalRules.${index}.minMonthsOfService`}
                      label="After (months of service)"
                      type="number"
                    />
                    <FormInput
                      control={form.control}
                      name={`withdrawalRules.${index}.maxPercentOfBalance`}
                      label="Up to (% of balance)"
                      type="number"
                    />
                    <FormSwitch
                      control={form.control}
                      name={`withdrawalRules.${index}.requiresApproval`}
                      label="Needs approval"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 cursor-pointer text-destructive hover:text-destructive"
                      aria-label={`Remove reason ${index + 1}`}
                      disabled={!canEdit}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {form.formState.errors.withdrawalRules?.root?.message && (
              <p className="text-sm text-destructive">
                {form.formState.errors.withdrawalRules.root.message}
              </p>
            )}
          </SectionCard>

          <SectionCard
            icon={ShieldCheck}
            title="Nominees and statements"
            description="Who the balance passes to, and how often members are told where they stand."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <FormSwitch
                control={form.control}
                name="requireNominee"
                label="Require a nominee"
                description="Members must name who inherits the balance."
              />
              {requireNominee && (
                <FormInput
                  control={form.control}
                  name="maxNominees"
                  label="Nominees allowed"
                  type="number"
                />
              )}
              <FormInput
                control={form.control}
                name="statementFrequencyMonths"
                label="Statement every (months)"
                type="number"
              />
            </div>
          </SectionCard>
        </>
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

export default function ProvidentFundSettingsPage() {
  const access = useModulePermission("/hrms/settings/provident-fund");
  const { data: settings, isLoading } = useGetHrmsSettingsQuery();

  return (
    <>
      <PageHeader
        title="Provident fund"
        description="Contribution rates, who joins and when, vesting, loans and the reasons money may be drawn out."
        actions={<BackLink to="/hrms/settings/overview" label="All settings" />}
      />

      {isLoading || !settings ? (
        <LoadingSpinner />
      ) : (
        <ProvidentFundForm
          key={settings.updatedAt}
          fund={settings.providentFund}
          canEdit={access.canEdit}
        />
      )}
    </>
  );
}
