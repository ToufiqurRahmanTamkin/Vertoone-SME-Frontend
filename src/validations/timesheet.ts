import { z } from "zod";
import { TIMESHEET_WORK_TYPES } from "@/types/domain/timesheet";
import { numberField } from "./hrmsSettings";

export const TimesheetEntrySchema = z
  .object({
    date: z.string().trim().min(1, "Pick the day these hours went on"),
    hours: numberField(0.25, 24).refine(
      (value) => value !== "" && Math.round(value * 4) === value * 4,
      "Hours go in quarter-hour steps"
    ),
    workType: z.enum(TIMESHEET_WORK_TYPES),
    taskId: z.string(),
    goalId: z.string(),
    activity: z.string().trim().max(200),
    isBillable: z.boolean(),
    note: z.string().trim().max(500),
  })
  .refine((values) => Boolean(values.taskId || values.goalId || values.activity), {
    path: ["activity"],
    message: "Say what the hours went against",
  });

export type TimesheetEntryFormValues = z.infer<typeof TimesheetEntrySchema>;
