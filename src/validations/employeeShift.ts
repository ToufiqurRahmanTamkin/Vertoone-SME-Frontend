import { z } from "zod";
import { SHIFT_ASSIGNMENT_TYPES } from "@/types/domain/employeeShift";
import { numberField } from "./hrmsSettings";

const weeklySlot = z.object({
  day: z.number().int().min(0).max(6),
  shiftId: z.string().trim(),
  isWeekOff: z.boolean(),
});

const shiftShape = {
  assignmentType: z.enum(SHIFT_ASSIGNMENT_TYPES),
  shiftId: z.string().trim(),
  weeklyShifts: z.array(weeklySlot).length(7),
  rotationShiftIds: z.array(z.string().trim()),
  rotationDaysPerShift: numberField(1, 30),
  effectiveFrom: z.string().trim().min(1, "Pick the date this starts"),
  note: z.string().trim().max(500),
};

const usable = (values: {
  assignmentType: (typeof SHIFT_ASSIGNMENT_TYPES)[number];
  shiftId: string;
  weeklyShifts: { isWeekOff: boolean; shiftId: string }[];
  rotationShiftIds: string[];
}): boolean => {
  if (values.assignmentType === "FIXED") return values.shiftId.length > 0;
  if (values.assignmentType === "WEEKLY") {
    return values.weeklyShifts.some((slot) => !slot.isWeekOff && slot.shiftId.length > 0);
  }
  return values.rotationShiftIds.length > 0 || values.shiftId.length > 0;
};

const SHAPE_MESSAGE =
  "Pick the shift for a fixed arrangement, a shift on at least one weekday, or the shifts to rotate through";

export const ShiftAssignmentSchema = z
  .object({
    employeeId: z.string().trim().min(1, "Pick an employee"),
    ...shiftShape,
    effectiveTo: z.string().trim(),
    isActive: z.boolean(),
  })
  .refine(usable, { path: ["shiftId"], message: SHAPE_MESSAGE })
  .refine(
    (values) =>
      !values.effectiveTo || new Date(values.effectiveTo) >= new Date(values.effectiveFrom),
    { path: ["effectiveTo"], message: "The end date cannot fall before the start date" }
  );

export type ShiftAssignmentFormValues = z.infer<typeof ShiftAssignmentSchema>;

export const BulkShiftAssignmentSchema = z
  .object({
    employeeIds: z.array(z.string().trim()).min(1, "Pick at least one employee"),
    ...shiftShape,
  })
  .refine(usable, { path: ["shiftId"], message: SHAPE_MESSAGE });

export type BulkShiftAssignmentFormValues = z.infer<typeof BulkShiftAssignmentSchema>;
