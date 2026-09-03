import { z } from "zod";
import { HOLIDAY_TYPES } from "@/types/domain/holiday";

export const HolidaySchema = z
  .object({
    name: z.string().trim().min(1, "A holiday needs a name").max(80),
    description: z.string().trim().max(300),
    color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Pick a colour"),
    type: z.enum(HOLIDAY_TYPES),
    date: z.string().trim().min(1, "Pick the date"),
    endDate: z.string().trim(),
    isRecurringYearly: z.boolean(),
    isPaid: z.boolean(),
    isOptional: z.boolean(),
    isActive: z.boolean(),
  })
  .refine((values) => !values.endDate || new Date(values.endDate) >= new Date(values.date), {
    path: ["endDate"],
    message: "A holiday cannot end before it starts",
  });

export type HolidayFormValues = z.infer<typeof HolidaySchema>;

export const CopyHolidaysSchema = z
  .object({
    fromYear: z.string().trim().min(1, "Pick the year to copy from"),
    toYear: z.string().trim().min(1, "Pick the year to copy into"),
  })
  .refine((values) => values.fromYear !== values.toYear, {
    path: ["toYear"],
    message: "Pick two different years",
  });

export type CopyHolidaysFormValues = z.infer<typeof CopyHolidaysSchema>;
