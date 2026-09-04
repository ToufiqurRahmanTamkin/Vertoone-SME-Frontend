import { z } from "zod";
import {
  ATTENDANCE_CAPTURE_METHODS,
  FINE_DEDUCTION_TYPES,
  FINE_RESET_CYCLES,
  LEAVE_ACCRUAL_CYCLES,
  OVERTIME_BASES,
  OVERTIME_PAYOUTS,
  MAX_PF_WITHDRAWAL_RULES,
  PAYROLL_DAY_BASES,
  PAY_CYCLES,
  PF_CONTRIBUTION_BASES,
  PF_ELIGIBILITY_MODES,
  PF_WITHDRAWAL_TYPES,
  ROUNDING_MODES,
} from "@/types/domain/hrmsSettings";

export const numberField = (min: number, max: number) =>
  z
    .union([z.literal(""), z.number()])
    .refine(
      (value) => value !== "" && Number.isFinite(value) && value >= min && value <= max,
      `Enter a number between ${min} and ${max}`
    );

export const toNumber = (value: number | ""): number => (value === "" ? 0 : value);

const timeField = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use a 24-hour time such as 09:00");

export const WeekSettingsSchema = z.object({
  weekStartsOn: z.string().trim().min(1, "Pick the day your week starts on"),
  weekendDays: z.array(z.string()).max(6, "At least one day must be worked"),
  workingHoursPerDay: numberField(1, 24),
  workingDaysPerWeek: numberField(1, 7),
});

export type WeekSettingsFormValues = z.infer<typeof WeekSettingsSchema>;

export const LeavePolicySchema = z
  .object({
    leaveYearStartMonth: z.string().trim().min(1, "Pick the month the leave year starts"),
    accrualCycle: z.enum(LEAVE_ACCRUAL_CYCLES),
    allowNegativeBalance: z.boolean(),
    maxNegativeBalanceDays: numberField(0, 60),
    carryForwardEnabled: z.boolean(),
    maxCarryForwardDays: numberField(0, 365),
    carryForwardExpiryMonths: numberField(0, 36),
    encashmentEnabled: z.boolean(),
    maxEncashmentDays: numberField(0, 365),
    requireApproval: z.boolean(),
    approvalLevels: numberField(1, 3),
    minNoticeDays: numberField(0, 90),
    maxConsecutiveDays: numberField(1, 365),
    allowHalfDay: z.boolean(),
    countWeekendsAsLeave: z.boolean(),
    countHolidaysAsLeave: z.boolean(),
    probationMonths: numberField(0, 24),
    allowLeaveDuringProbation: z.boolean(),
    documentRequiredAfterDays: numberField(0, 30),
  })
  .refine(
    (values) => !values.carryForwardEnabled || toNumber(values.maxCarryForwardDays) > 0,
    { path: ["maxCarryForwardDays"], message: "Set how many days may carry over" }
  )
  .refine(
    (values) => !values.encashmentEnabled || toNumber(values.maxEncashmentDays) > 0,
    { path: ["maxEncashmentDays"], message: "Set how many days may be cashed in" }
  );

export type LeavePolicyFormValues = z.infer<typeof LeavePolicySchema>;

export const AttendanceRuleSchema = z
  .object({
    timezone: z.string().trim().min(1, "Pick a time zone"),
    graceMinutes: numberField(0, 240),
    halfDayAfterMinutes: numberField(0, 600),
    minHoursFullDay: numberField(1, 24),
    minHoursHalfDay: numberField(0, 24),
    earlyLeaveGraceMinutes: numberField(0, 240),
    autoAbsentAfterMinutes: numberField(0, 1440),
    autoClockOutEnabled: z.boolean(),
    autoClockOutAfterHours: numberField(1, 24),
    allowMultipleSessions: z.boolean(),
    captureMethods: z.array(z.enum(ATTENDANCE_CAPTURE_METHODS)).min(1, "Pick at least one"),
    allowRemoteClockIn: z.boolean(),
    requireGeofence: z.boolean(),
    geofenceRadiusMeters: numberField(10, 5000),
    requireSelfie: z.boolean(),
    requireNoteOnLate: z.boolean(),
    regularizationEnabled: z.boolean(),
    regularizationWindowDays: numberField(0, 90),
    maxRegularizationsPerMonth: numberField(0, 31),
    weekOffPaid: z.boolean(),
    countHolidayAsPresent: z.boolean(),
  })
  .refine(
    (values) => toNumber(values.minHoursHalfDay) <= toNumber(values.minHoursFullDay),
    { path: ["minHoursHalfDay"], message: "A half day cannot be longer than a full day" }
  );

export type AttendanceRuleFormValues = z.infer<typeof AttendanceRuleSchema>;

export const LateFineSchema = z
  .object({
    enabled: z.boolean(),
    lateAfterMinutes: numberField(0, 240),
    graceLatesPerCycle: numberField(0, 31),
    resetCycle: z.enum(FINE_RESET_CYCLES),
    rules: z
      .array(
        z.object({
          lateCount: numberField(1, 60),
          deductionType: z.enum(FINE_DEDUCTION_TYPES),
          value: numberField(0, 1_000_000),
        })
      )
      .max(10, "At most ten steps"),
    earlyLeaveCountsAsLate: z.boolean(),
    earlyLeaveAfterMinutes: numberField(0, 240),
    absentDeductionDays: numberField(0, 10),
    halfDayDeductionDays: numberField(0, 10),
    maxDeductionPercentOfBasic: numberField(0, 100),
    roundToNearest: numberField(0, 1000),
  })
  .refine(
    (values) => {
      const counts = values.rules.map((rule) => toNumber(rule.lateCount));
      return new Set(counts).size === counts.length;
    },
    { path: ["rules"], message: "Each step needs a different late count" }
  );

export type LateFineFormValues = z.infer<typeof LateFineSchema>;

export const OvertimeSchema = z.object({
  enabled: z.boolean(),
  requireApproval: z.boolean(),
  calculationBase: z.enum(OVERTIME_BASES),
  payout: z.enum(OVERTIME_PAYOUTS),
  dailyThresholdHours: numberField(0, 24),
  dailyMultiplier: numberField(1, 5),
  weeklyThresholdHours: numberField(0, 168),
  weeklyMultiplier: numberField(1, 5),
  monthlyThresholdHours: numberField(0, 744),
  monthlyMultiplier: numberField(1, 5),
  weekOffMultiplier: numberField(1, 5),
  holidayMultiplier: numberField(1, 5),
  nightMultiplier: numberField(1, 5),
  nightStartTime: timeField,
  nightEndTime: timeField,
  minMinutesToCount: numberField(0, 480),
  roundToMinutes: numberField(1, 60),
  maxDailyHours: numberField(0, 16),
  maxMonthlyHours: numberField(0, 400),
});

export type OvertimeFormValues = z.infer<typeof OvertimeSchema>;

export const PayrollSchema = z
  .object({
    payCycle: z.enum(PAY_CYCLES),
    payDay: numberField(1, 31),
    cutoffDay: numberField(1, 31),
    dayBasis: z.enum(PAYROLL_DAY_BASES),
    fixedDaysPerMonth: numberField(1, 31),
    roundingMode: z.enum(ROUNDING_MODES),
    roundTo: numberField(0, 1000),
    basicPercentOfGross: numberField(0, 100),
    includeOvertime: z.boolean(),
    includeLateFine: z.boolean(),
    includeUnpaidLeaveDeduction: z.boolean(),
    taxEnabled: z.boolean(),
    taxPercent: numberField(0, 100),
    festivalBonusEnabled: z.boolean(),
    festivalBonusPerYear: numberField(0, 12),
    payslipPrefix: z.string().trim().max(8),
    payslipNote: z.string().trim().max(400),
    autoGeneratePayslips: z.boolean(),
    lockAfterApproval: z.boolean(),
  })
  .refine((values) => !values.taxEnabled || toNumber(values.taxPercent) > 0, {
    path: ["taxPercent"],
    message: "Set the tax rate you deduct",
  });

export type PayrollFormValues = z.infer<typeof PayrollSchema>;

export const PfWithdrawalRuleSchema = z.object({
  type: z.enum(PF_WITHDRAWAL_TYPES),
  minMonthsOfService: numberField(0, 600),
  maxPercentOfBalance: numberField(0, 100),
  requiresApproval: z.boolean(),
});

export const ProvidentFundSchema = z
  .object({
    enabled: z.boolean(),
    schemeName: z.string().trim().max(120),
    registrationNumber: z.string().trim().max(60),
    trustName: z.string().trim().max(120),
    contributionBase: z.enum(PF_CONTRIBUTION_BASES),
    employeePercent: numberField(0, 100),
    employerPercent: numberField(0, 100),
    wageCeilingEnabled: z.boolean(),
    wageCeilingAmount: numberField(0, 100_000_000),
    minMonthlyContribution: numberField(0, 100_000_000),
    roundingMode: z.enum(ROUNDING_MODES),
    roundTo: numberField(0, 1000),
    allowVoluntaryTopUp: z.boolean(),
    maxVoluntaryPercent: numberField(0, 100),
    eligibilityMode: z.enum(PF_ELIGIBILITY_MODES),
    eligibilityAfterMonths: numberField(0, 60),
    minAgeYears: numberField(0, 70),
    excludeContractStaff: z.boolean(),
    excludeInterns: z.boolean(),
    employerContributionVests: z.boolean(),
    vestingAfterMonths: numberField(0, 120),
    forfeitUnvestedOnExit: z.boolean(),
    interestEnabled: z.boolean(),
    annualInterestPercent: numberField(0, 100),
    interestCreditMonth: z.string().trim().min(1, "Pick the month interest is credited"),
    loansEnabled: z.boolean(),
    maxLoanPercentOfBalance: numberField(0, 100),
    maxLoanTenureMonths: numberField(1, 120),
    minMonthsBetweenLoans: numberField(0, 120),
    withdrawalRules: z.array(PfWithdrawalRuleSchema).max(MAX_PF_WITHDRAWAL_RULES),
    requireNominee: z.boolean(),
    maxNominees: numberField(1, 10),
    statementFrequencyMonths: numberField(1, 12),
    notes: z.string().trim().max(1000),
  })
  .refine(
    (values) =>
      !values.enabled ||
      toNumber(values.employeePercent) + toNumber(values.employerPercent) > 0,
    { path: ["employeePercent"], message: "Set an employee or employer rate" }
  )
  .refine(
    (values) => !values.wageCeilingEnabled || toNumber(values.wageCeilingAmount) > 0,
    { path: ["wageCeilingAmount"], message: "A ceiling needs an amount above zero" }
  )
  .refine(
    (values) => !values.allowVoluntaryTopUp || toNumber(values.maxVoluntaryPercent) > 0,
    { path: ["maxVoluntaryPercent"], message: "Set how much extra an employee may add" }
  )
  .refine((values) => !values.interestEnabled || toNumber(values.annualInterestPercent) > 0, {
    path: ["annualInterestPercent"],
    message: "Set the annual interest rate you credit",
  })
  .refine(
    (values) => !values.employerContributionVests || toNumber(values.vestingAfterMonths) > 0,
    { path: ["vestingAfterMonths"], message: "Set how long the employer share takes to vest" }
  )
  .refine(
    (values) =>
      new Set(values.withdrawalRules.map((rule) => rule.type)).size ===
      values.withdrawalRules.length,
    { path: ["withdrawalRules"], message: "Each reason can only be listed once" }
  );

export type ProvidentFundFormValues = z.infer<typeof ProvidentFundSchema>;
