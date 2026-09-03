import { z } from "zod";
import { numberField, toNumber } from "./hrmsSettings";

const timeField = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use a 24-hour time such as 09:00");

export const ShiftSchema = z
  .object({
    name: z.string().trim().min(1, "A shift needs a name").max(60),
    code: z.string().trim().max(10),
    color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
    description: z.string().trim().max(300),
    startTime: timeField,
    endTime: timeField,
    breakMinutes: numberField(0, 480),
    workingDays: z.array(z.string()).min(1, "Pick at least one working day"),
    graceMinutes: numberField(0, 240),
    earlyLeaveGraceMinutes: numberField(0, 240),
    minHoursFullDay: numberField(0, 24),
    minHoursHalfDay: numberField(0, 24),
    isDefault: z.boolean(),
    isActive: z.boolean(),
    sortOrder: numberField(0, 999),
  })
  .refine((values) => values.startTime !== values.endTime, {
    path: ["endTime"],
    message: "A shift must start and end at different times",
  })
  .refine(
    (values) => toNumber(values.minHoursHalfDay) <= toNumber(values.minHoursFullDay),
    { path: ["minHoursHalfDay"], message: "A half day cannot be longer than a full day" }
  );

export type ShiftFormValues = z.infer<typeof ShiftSchema>;
