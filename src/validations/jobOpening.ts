import {
  JOB_EMPLOYMENT_TYPES,
  JOB_EXPERIENCE_LEVELS,
  JOB_OPENING_PRIORITIES,
  JOB_OPENING_STATUSES,
  JOB_WORKPLACE_TYPES,
} from "@/types/domain/jobOpening";
import { z } from "zod";

const wholeNumber = (min: number, max: number, message: string) =>
  z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value) && value >= min && value <= max, { message });

export const JobOpeningSchema = z
  .object({
    title: z.string().trim().min(1, "A job opening needs a title").max(160),
    code: z.string().trim().max(20),
    departmentId: z.string(),
    designationId: z.string(),
    hiringManagerId: z.string(),
    recruiterId: z.string(),
    status: z.enum(JOB_OPENING_STATUSES),
    employmentType: z.enum(JOB_EMPLOYMENT_TYPES),
    workplaceType: z.enum(JOB_WORKPLACE_TYPES),
    experienceLevel: z.enum(JOB_EXPERIENCE_LEVELS),
    priority: z.enum(JOB_OPENING_PRIORITIES),
    location: z.string().trim().max(160),
    openings: wholeNumber(1, 999, "Hire between 1 and 999 people"),
    filledCount: wholeNumber(0, 999, "Enter a number between 0 and 999"),
    summary: z.string().trim().max(500),
    description: z.string().trim().max(20000),
    responsibilities: z.string().trim().max(20000),
    requirements: z.string().trim().max(20000),
    skills: z.array(z.string().trim().max(60)).max(25),
    salaryMin: wholeNumber(0, 1_000_000_000, "Enter a valid amount"),
    salaryMax: wholeNumber(0, 1_000_000_000, "Enter a valid amount"),
    salaryIsVisible: z.boolean(),
    openedAt: z.string(),
    closingAt: z.string(),
    isPublished: z.boolean(),
  })
  .refine((values) => values.salaryMax === 0 || values.salaryMin <= values.salaryMax, {
    message: "The floor cannot be above the ceiling",
    path: ["salaryMin"],
  })
  .refine((values) => values.filledCount <= values.openings, {
    message: "More filled than there are positions",
    path: ["filledCount"],
  })
  .refine(
    (values) =>
      !values.openedAt ||
      !values.closingAt ||
      new Date(values.closingAt) >= new Date(values.openedAt),
    { message: "Closing cannot be before opening", path: ["closingAt"] }
  );

export type JobOpeningFormValues = z.input<typeof JobOpeningSchema>;

export type JobOpeningFormOutput = z.output<typeof JobOpeningSchema>;
