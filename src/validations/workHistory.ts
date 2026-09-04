import { z } from "zod";
import { WORK_HISTORY_TYPES } from "@/types/domain/workHistory";

export const WorkHistorySchema = z
  .object({
    employeeId: z.string().trim().min(1, "Pick an employee"),
    type: z.enum(WORK_HISTORY_TYPES),
    title: z.string().trim().max(140),
    effectiveDate: z.string().trim().min(1, "Pick the date this took effect"),
    endDate: z.string().trim(),
    fromLabel: z.string().trim().max(160),
    toLabel: z.string().trim().max(160),
    note: z.string().trim().max(2000),
  })
  .refine(
    (values) =>
      !values.endDate || new Date(values.endDate) >= new Date(values.effectiveDate),
    { path: ["endDate"], message: "The end date cannot fall before the start date" }
  );

export type WorkHistoryFormValues = z.infer<typeof WorkHistorySchema>;
