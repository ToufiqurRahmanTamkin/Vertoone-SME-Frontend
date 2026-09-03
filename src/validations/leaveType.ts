import { z } from "zod";
import { LEAVE_ACCRUALS, LEAVE_GENDERS } from "@/types/domain/leaveType";
import { numberField, toNumber } from "./hrmsSettings";

export const LeaveTypeSchema = z
  .object({
    name: z.string().trim().min(1, "A leave type needs a name").max(60),
    code: z.string().trim().max(10),
    color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
    description: z.string().trim().max(300),
    daysPerYear: numberField(0, 365),
    isPaid: z.boolean(),
    accrual: z.enum(LEAVE_ACCRUALS),
    carryForward: z.boolean(),
    maxCarryForwardDays: numberField(0, 365),
    encashable: z.boolean(),
    allowHalfDay: z.boolean(),
    requiresApproval: z.boolean(),
    requiresDocument: z.boolean(),
    documentAfterDays: numberField(0, 30),
    minDaysPerRequest: numberField(0, 365),
    maxDaysPerRequest: numberField(0, 365),
    maxConsecutiveDays: numberField(0, 365),
    noticeDays: numberField(0, 90),
    applicableGender: z.enum(LEAVE_GENDERS),
    availableAfterMonths: numberField(0, 24),
    countWeekends: z.boolean(),
    countHolidays: z.boolean(),
    sortOrder: numberField(0, 999),
    isActive: z.boolean(),
  })
  .refine(
    (values) => toNumber(values.minDaysPerRequest) <= toNumber(values.maxDaysPerRequest),
    { path: ["minDaysPerRequest"], message: "The minimum cannot exceed the maximum" }
  )
  .refine((values) => !values.carryForward || toNumber(values.maxCarryForwardDays) > 0, {
    path: ["maxCarryForwardDays"],
    message: "Set how many days may carry over",
  });

export type LeaveTypeFormValues = z.infer<typeof LeaveTypeSchema>;
