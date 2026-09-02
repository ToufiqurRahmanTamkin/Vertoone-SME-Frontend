import {
  GOAL_CATEGORIES,
  GOAL_METRIC_TYPES,
  GOAL_PRIORITIES,
  GOAL_PROGRESS_MODES,
  GOAL_STATUSES,
  MAX_GOAL_KEY_RESULTS,
  MAX_GOAL_MEMBERS,
  MAX_GOAL_TAGS,
} from "@/types/domain/goal";
import { z } from "zod";
import { hexColorValidation } from "./color";

const metricValue = z.union([
  z.literal(""),
  z.number().min(-1e12, "Too small").max(1e12, "Too large"),
]);

export const GoalKeyResultSchema = z.object({
  _id: z.string().optional(),
  title: z.string().trim().min(1, "A key result needs a title").max(200),
  metricType: z.enum(GOAL_METRIC_TYPES),
  unit: z.string().trim().max(20),
  startValue: metricValue,
  targetValue: metricValue,
  currentValue: metricValue,
  weight: z.union([z.literal(""), z.number().int().min(1, "1 or more").max(100, "100 or less")]),
  ownerId: z.string(),
  dueDate: z.string().trim(),
  isCompleted: z.boolean(),
});

export type GoalKeyResultFormValues = z.infer<typeof GoalKeyResultSchema>;

export const GoalSchema = z
  .object({
    title: z.string().trim().min(1, "A goal needs a title").max(200),
    description: z.string().trim().max(2000),
    color: hexColorValidation,
    category: z.enum(GOAL_CATEGORIES),
    status: z.enum(GOAL_STATUSES),
    priority: z.enum(GOAL_PRIORITIES),
    progressMode: z.enum(GOAL_PROGRESS_MODES),
    metricType: z.enum(GOAL_METRIC_TYPES),
    unit: z.string().trim().max(20),
    startValue: metricValue,
    targetValue: metricValue,
    currentValue: metricValue,
    keyResults: z
      .array(GoalKeyResultSchema)
      .max(MAX_GOAL_KEY_RESULTS, `At most ${MAX_GOAL_KEY_RESULTS} key results`),
    ownerId: z.string(),
    memberIds: z.array(z.string()).max(MAX_GOAL_MEMBERS, `At most ${MAX_GOAL_MEMBERS} people`),
    departmentId: z.string(),
    parentGoalId: z.string(),
    boardId: z.string(),
    tagIds: z.array(z.string()).max(MAX_GOAL_TAGS, `At most ${MAX_GOAL_TAGS} tags`),
    startDate: z.string().trim(),
    dueDate: z.string().trim(),
    isArchived: z.boolean(),
  })
  .refine((values) => values.progressMode !== "AUTO" || values.keyResults.length > 0, {
    message: "Add at least one key result, or switch to tracking one number on the goal",
    path: ["keyResults"],
  })
  .refine(
    (values) =>
      !values.startDate ||
      !values.dueDate ||
      new Date(values.startDate).getTime() <= new Date(values.dueDate).getTime(),
    { message: "The end date cannot fall before the start date", path: ["dueDate"] }
  );

export type GoalFormValues = z.infer<typeof GoalSchema>;

export const GoalCheckInSchema = z.object({
  note: z.string().trim().max(1000),
  status: z.enum(GOAL_STATUSES),
  currentValue: metricValue,
  keyResults: z.array(
    z.object({
      _id: z.string(),
      title: z.string(),
      currentValue: metricValue,
      isCompleted: z.boolean(),
    })
  ),
});

export type GoalCheckInFormValues = z.infer<typeof GoalCheckInSchema>;
