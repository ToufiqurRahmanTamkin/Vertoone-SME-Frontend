export const LEAVE_ACCRUAL_CYCLES = ["MONTHLY", "QUARTERLY", "YEARLY"] as const;
export type LeaveAccrualCycle = (typeof LEAVE_ACCRUAL_CYCLES)[number];

export const FINE_RESET_CYCLES = ["WEEKLY", "MONTHLY", "YEARLY"] as const;
export type FineResetCycle = (typeof FINE_RESET_CYCLES)[number];

export const FINE_DEDUCTION_TYPES = ["BASIC_DAYS", "FIXED_AMOUNT", "PERCENT_OF_BASIC"] as const;
export type FineDeductionType = (typeof FINE_DEDUCTION_TYPES)[number];

export const ATTENDANCE_CAPTURE_METHODS = ["WEB", "MOBILE", "BIOMETRIC", "QR"] as const;
export type AttendanceCaptureMethod = (typeof ATTENDANCE_CAPTURE_METHODS)[number];

export const OVERTIME_BASES = ["BASIC", "GROSS", "BASIC_PLUS_ALLOWANCES"] as const;
export type OvertimeBase = (typeof OVERTIME_BASES)[number];

export const OVERTIME_PAYOUTS = ["PAYROLL", "COMPENSATORY_OFF"] as const;
export type OvertimePayout = (typeof OVERTIME_PAYOUTS)[number];

export const PAY_CYCLES = ["WEEKLY", "BIWEEKLY", "SEMI_MONTHLY", "MONTHLY"] as const;
export type PayCycle = (typeof PAY_CYCLES)[number];

export const PAYROLL_DAY_BASES = ["FIXED_DAYS", "CALENDAR_DAYS", "WORKING_DAYS"] as const;
export type PayrollDayBasis = (typeof PAYROLL_DAY_BASES)[number];

export const ROUNDING_MODES = ["NONE", "NEAREST", "UP", "DOWN"] as const;
export type RoundingMode = (typeof ROUNDING_MODES)[number];

export const PF_CONTRIBUTION_BASES = ["BASIC", "GROSS", "BASIC_PLUS_ALLOWANCES"] as const;
export type PfContributionBase = (typeof PF_CONTRIBUTION_BASES)[number];

export const PF_ELIGIBILITY_MODES = [
  "ALL_EMPLOYEES",
  "AFTER_PROBATION",
  "AFTER_MONTHS",
] as const;
export type PfEligibilityMode = (typeof PF_ELIGIBILITY_MODES)[number];

export const PF_WITHDRAWAL_TYPES = [
  "RESIGNATION",
  "RETIREMENT",
  "MEDICAL",
  "EDUCATION",
  "HOUSING",
  "MARRIAGE",
] as const;
export type PfWithdrawalType = (typeof PF_WITHDRAWAL_TYPES)[number];

export const MAX_PF_WITHDRAWAL_RULES = 10;

export const WEEK_DAYS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
] as const;

export const LEAVE_ACCRUAL_CYCLE_LABELS: Record<LeaveAccrualCycle, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

export const FINE_RESET_CYCLE_LABELS: Record<FineResetCycle, string> = {
  WEEKLY: "Every week",
  MONTHLY: "Every month",
  YEARLY: "Every year",
};

export const FINE_DEDUCTION_TYPE_LABELS: Record<FineDeductionType, string> = {
  BASIC_DAYS: "Days of basic pay",
  FIXED_AMOUNT: "Fixed amount",
  PERCENT_OF_BASIC: "Percent of basic pay",
};

export const ATTENDANCE_CAPTURE_METHOD_LABELS: Record<AttendanceCaptureMethod, string> = {
  WEB: "Web app",
  MOBILE: "Mobile app",
  BIOMETRIC: "Biometric device",
  QR: "QR code",
};

export const OVERTIME_BASE_LABELS: Record<OvertimeBase, string> = {
  BASIC: "Basic salary",
  GROSS: "Gross salary",
  BASIC_PLUS_ALLOWANCES: "Basic plus allowances",
};

export const OVERTIME_PAYOUT_LABELS: Record<OvertimePayout, string> = {
  PAYROLL: "Paid with payroll",
  COMPENSATORY_OFF: "Given back as time off",
};

export const PAY_CYCLE_LABELS: Record<PayCycle, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Every two weeks",
  SEMI_MONTHLY: "Twice a month",
  MONTHLY: "Monthly",
};

export const PAYROLL_DAY_BASIS_LABELS: Record<PayrollDayBasis, string> = {
  FIXED_DAYS: "Fixed days per month",
  CALENDAR_DAYS: "Calendar days in the month",
  WORKING_DAYS: "Working days in the month",
};

export const ROUNDING_MODE_LABELS: Record<RoundingMode, string> = {
  NONE: "No rounding",
  NEAREST: "To the nearest",
  UP: "Always up",
  DOWN: "Always down",
};

export const PF_CONTRIBUTION_BASE_LABELS: Record<PfContributionBase, string> = {
  BASIC: "Basic salary",
  GROSS: "Gross salary",
  BASIC_PLUS_ALLOWANCES: "Basic plus allowances",
};

export const PF_ELIGIBILITY_MODE_LABELS: Record<PfEligibilityMode, string> = {
  ALL_EMPLOYEES: "Everyone from day one",
  AFTER_PROBATION: "Once probation is passed",
  AFTER_MONTHS: "After a set number of months",
};

export const PF_WITHDRAWAL_TYPE_LABELS: Record<PfWithdrawalType, string> = {
  RESIGNATION: "Resignation",
  RETIREMENT: "Retirement",
  MEDICAL: "Medical need",
  EDUCATION: "Education",
  HOUSING: "Housing",
  MARRIAGE: "Marriage",
};

export interface WeekSettings {
  weekStartsOn: number;
  weekendDays: number[];
  workingHoursPerDay: number;
  workingDaysPerWeek: number;
}

export interface LeaveSettings {
  leaveYearStartMonth: number;
  accrualCycle: LeaveAccrualCycle;
  allowNegativeBalance: boolean;
  maxNegativeBalanceDays: number;
  carryForwardEnabled: boolean;
  maxCarryForwardDays: number;
  carryForwardExpiryMonths: number;
  encashmentEnabled: boolean;
  maxEncashmentDays: number;
  requireApproval: boolean;
  approvalLevels: number;
  minNoticeDays: number;
  maxConsecutiveDays: number;
  allowHalfDay: boolean;
  countWeekendsAsLeave: boolean;
  countHolidaysAsLeave: boolean;
  probationMonths: number;
  allowLeaveDuringProbation: boolean;
  documentRequiredAfterDays: number;
}

export interface AttendanceSettings {
  graceMinutes: number;
  halfDayAfterMinutes: number;
  minHoursFullDay: number;
  minHoursHalfDay: number;
  earlyLeaveGraceMinutes: number;
  autoAbsentAfterMinutes: number;
  autoClockOutEnabled: boolean;
  autoClockOutAfterHours: number;
  allowMultipleSessions: boolean;
  captureMethods: AttendanceCaptureMethod[];
  allowRemoteClockIn: boolean;
  requireGeofence: boolean;
  geofenceRadiusMeters: number;
  requireSelfie: boolean;
  requireNoteOnLate: boolean;
  regularizationEnabled: boolean;
  regularizationWindowDays: number;
  maxRegularizationsPerMonth: number;
  weekOffPaid: boolean;
  countHolidayAsPresent: boolean;
}

export interface LateFineRule {
  lateCount: number;
  deductionType: FineDeductionType;
  value: number;
}

export interface LateFineSettings {
  enabled: boolean;
  lateAfterMinutes: number;
  graceLatesPerCycle: number;
  resetCycle: FineResetCycle;
  rules: LateFineRule[];
  earlyLeaveCountsAsLate: boolean;
  earlyLeaveAfterMinutes: number;
  absentDeductionDays: number;
  halfDayDeductionDays: number;
  maxDeductionPercentOfBasic: number;
  roundToNearest: number;
}

export interface OvertimeSettings {
  enabled: boolean;
  requireApproval: boolean;
  calculationBase: OvertimeBase;
  payout: OvertimePayout;
  dailyThresholdHours: number;
  dailyMultiplier: number;
  weeklyThresholdHours: number;
  weeklyMultiplier: number;
  monthlyThresholdHours: number;
  monthlyMultiplier: number;
  weekOffMultiplier: number;
  holidayMultiplier: number;
  nightMultiplier: number;
  nightStartTime: string;
  nightEndTime: string;
  minMinutesToCount: number;
  roundToMinutes: number;
  maxDailyHours: number;
  maxMonthlyHours: number;
}

export interface PayrollSettings {
  payCycle: PayCycle;
  payDay: number;
  cutoffDay: number;
  dayBasis: PayrollDayBasis;
  fixedDaysPerMonth: number;
  roundingMode: RoundingMode;
  roundTo: number;
  basicPercentOfGross: number;
  includeOvertime: boolean;
  includeLateFine: boolean;
  includeUnpaidLeaveDeduction: boolean;
  taxEnabled: boolean;
  taxPercent: number;
  festivalBonusEnabled: boolean;
  festivalBonusPerYear: number;
  payslipPrefix: string;
  payslipNote: string;
  autoGeneratePayslips: boolean;
  lockAfterApproval: boolean;
}

export interface PfWithdrawalRule {
  type: PfWithdrawalType;
  minMonthsOfService: number;
  maxPercentOfBalance: number;
  requiresApproval: boolean;
}

export interface ProvidentFundSettings {
  enabled: boolean;
  schemeName: string;
  registrationNumber: string;
  trustName: string;
  contributionBase: PfContributionBase;
  employeePercent: number;
  employerPercent: number;
  wageCeilingEnabled: boolean;
  wageCeilingAmount: number;
  minMonthlyContribution: number;
  roundingMode: RoundingMode;
  roundTo: number;
  allowVoluntaryTopUp: boolean;
  maxVoluntaryPercent: number;
  eligibilityMode: PfEligibilityMode;
  eligibilityAfterMonths: number;
  minAgeYears: number;
  excludeContractStaff: boolean;
  excludeInterns: boolean;
  employerContributionVests: boolean;
  vestingAfterMonths: number;
  forfeitUnvestedOnExit: boolean;
  interestEnabled: boolean;
  annualInterestPercent: number;
  interestCreditMonth: number;
  loansEnabled: boolean;
  maxLoanPercentOfBalance: number;
  maxLoanTenureMonths: number;
  minMonthsBetweenLoans: number;
  withdrawalRules: PfWithdrawalRule[];
  requireNominee: boolean;
  maxNominees: number;
  statementFrequencyMonths: number;
  notes: string;
}

export interface HrmsSettings {
  _id: string;
  week: WeekSettings;
  leave: LeaveSettings;
  attendance: AttendanceSettings;
  lateFine: LateFineSettings;
  overtime: OvertimeSettings;
  payroll: PayrollSettings;
  providentFund: ProvidentFundSettings;
  updatedAt: string;
}

export type HrmsSettingsSection = keyof Pick<
  HrmsSettings,
  "week" | "leave" | "attendance" | "lateFine" | "overtime" | "payroll" | "providentFund"
>;

export interface HrmsSettingsSummary {
  leave: {
    types: number;
    activeTypes: number;
    paidTypes: number;
    totalPaidDays: number;
    carryForwardEnabled: boolean;
  };
  shifts: {
    total: number;
    active: number;
    defaultShiftName: string;
    weekStartLabel: string;
    weekendLabel: string;
  };
  attendance: {
    graceMinutes: number;
    minHoursFullDay: number;
    regularizationEnabled: boolean;
    captureMethods: AttendanceCaptureMethod[];
  };
  lateFine: {
    enabled: boolean;
    lateAfterMinutes: number;
    rules: number;
    firstRuleLabel: string;
  };
  overtime: {
    enabled: boolean;
    dailyThresholdHours: number;
    dailyMultiplier: number;
    weeklyThresholdHours: number;
    weeklyMultiplier: number;
  };
  holidays: {
    total: number;
    upcoming: number;
    thisYear: number;
    nextHolidayName: string;
    nextHolidayDate: string | null;
  };
  payroll: {
    payCycle: PayCycle;
    payDay: number;
    dayBasis: PayrollDayBasis;
    taxEnabled: boolean;
  };
  providentFund: {
    enabled: boolean;
    employeePercent: number;
    employerPercent: number;
    contributionBase: PfContributionBase;
    eligibilityMode: PfEligibilityMode;
    loansEnabled: boolean;
    withdrawalRules: number;
    totalPercent: number;
  };
  employeeRoles: {
    total: number;
    active: number;
    assignedEmployees: number;
    unassignedEmployees: number;
  };
  updatedAt: string;
}
