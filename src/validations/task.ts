import {
  MAX_TASK_CHECKLISTS,
  MAX_TASK_CHECKLIST_ITEMS,
  MAX_TASK_LABELS,
  MAX_TASK_LISTS,
  TASK_ASSIGNEE_KINDS,
  TASK_BOARD_VISIBILITIES,
  TASK_PRIORITIES,
} from "@/types/domain/task";
import { z } from "zod";
import { hexColorValidation } from "./color";

export const TaskListSchema = z.object({
  _id: z.string().optional(),
  name: z.string().trim().min(1, "A list needs a name").max(60),
  color: hexColorValidation,
  wipLimit: z.union([z.literal(""), z.number().int().min(0, "0 or more").max(999, "999 or less")]),
  isDoneList: z.boolean(),
  isArchived: z.boolean(),
});

export type TaskListFormValues = z.infer<typeof TaskListSchema>;

export const TaskLabelSchema = z.object({
  _id: z.string().optional(),
  name: z.string().trim().min(1, "A label needs a name").max(40),
  color: hexColorValidation,
});

export type TaskLabelFormValues = z.infer<typeof TaskLabelSchema>;

export const TaskBoardSchema = z.object({
  name: z.string().trim().min(1, "A board needs a name").max(80),
  description: z.string().trim().max(500),
  color: hexColorValidation,
  visibility: z.enum(TASK_BOARD_VISIBILITIES),
  ownerId: z.string(),
  memberIds: z.array(z.string()),
  isArchived: z.boolean(),
  lists: z
    .array(TaskListSchema)
    .min(1, "A board needs at least one list")
    .max(MAX_TASK_LISTS, `At most ${MAX_TASK_LISTS} lists`),
  labels: z.array(TaskLabelSchema).max(MAX_TASK_LABELS, `At most ${MAX_TASK_LABELS} labels`),
});

export type TaskBoardFormValues = z.infer<typeof TaskBoardSchema>;

export const TaskAssigneeSchema = z.object({
  kind: z.enum(TASK_ASSIGNEE_KINDS),
  refId: z.string().min(1),
});

export const TaskChecklistItemSchema = z.object({
  _id: z.string().optional(),
  title: z.string().trim().min(1, "An item needs a title").max(200),
  isChecked: z.boolean(),
  dueAt: z.string().trim(),
});

export const TaskChecklistSchema = z.object({
  _id: z.string().optional(),
  title: z.string().trim().min(1, "A checklist needs a title").max(120),
  items: z.array(TaskChecklistItemSchema).max(MAX_TASK_CHECKLIST_ITEMS),
});

export type TaskChecklistFormValues = z.infer<typeof TaskChecklistSchema>;

export const TaskSchema = z.object({
  boardId: z.string().min(1, "Pick a board"),
  listId: z.string(),
  title: z.string().trim().min(1, "A task needs a title").max(200),
  description: z.string().trim().max(5000),
  priority: z.enum(TASK_PRIORITIES),
  labelIds: z.array(z.string()),
  assignees: z.array(TaskAssigneeSchema),
  checklists: z.array(TaskChecklistSchema).max(MAX_TASK_CHECKLISTS),
  coverColor: z.string().trim(),
  startDate: z.string().trim(),
  dueAt: z.string().trim(),
  reminderAt: z.string().trim(),
  isCompleted: z.boolean(),
});

export type TaskFormValues = z.infer<typeof TaskSchema>;
