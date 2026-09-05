import { FORECAST_PERIOD_TYPES } from "@/types/domain/forecast";
import { SUPPORTED_CURRENCIES } from "@/types/domain/plan";
import { z } from "zod";

export const ForecastTargetSchema = z
  .object({
    periodType: z.enum(FORECAST_PERIOD_TYPES),
    period: z
      .string()
      .trim()
      .regex(/^\d{4}-(0[1-9]|1[0-2]|Q[1-4])$/i, "Use a period like 2026-01 or 2026-Q1"),
    ownerId: z.string(),
    pipelineId: z.string(),
    amount: z.union([
      z.literal(""),
      z.number().min(0, "0 or more").max(1_000_000_000_000),
    ]),
    currency: z.enum(SUPPORTED_CURRENCIES),
    notes: z.string().trim().max(300),
  })
  .refine(
    (values) =>
      values.periodType === "MONTH"
        ? /^\d{4}-(0[1-9]|1[0-2])$/.test(values.period)
        : /^\d{4}-Q[1-4]$/i.test(values.period),
    {
      message: "A monthly target uses 2026-01, a quarterly one uses 2026-Q1",
      path: ["period"],
    }
  );

export type ForecastTargetFormValues = z.infer<typeof ForecastTargetSchema>;
