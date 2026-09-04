import { z } from "zod";
import {
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_STATUSES,
  ANNOUNCEMENT_TYPES,
} from "@/types/domain/announcement";
import { AUDIENCE_TYPES, POLICY_CATEGORIES, POLICY_STATUSES } from "@/types/domain/policy";
import { numberField } from "./hrmsSettings";

const audienceFields = {
  audience: z.enum(AUDIENCE_TYPES),
  departmentIds: z.array(z.string()),
  designationIds: z.array(z.string()),
  employeeIds: z.array(z.string()),
  userIds: z.array(z.string()),
};

const audienceIsPicked = (values: {
  audience: string;
  departmentIds: string[];
  designationIds: string[];
  employeeIds: string[];
  userIds: string[];
}): boolean => {
  if (values.audience === "DEPARTMENTS") return values.departmentIds.length > 0;
  if (values.audience === "DESIGNATIONS") return values.designationIds.length > 0;
  if (values.audience === "EMPLOYEES") return values.employeeIds.length > 0;
  if (values.audience === "USERS") return values.userIds.length > 0;
  return true;
};

export const PolicySchema = z
  .object({
    title: z.string().trim().min(1, "A policy needs a title").max(160),
    code: z.string().trim().max(40),
    category: z.enum(POLICY_CATEGORIES),
    summary: z.string().trim().max(500),
    content: z.string().max(60000),
    status: z.enum(POLICY_STATUSES),
    effectiveFrom: z.string().trim(),
    reviewDueAt: z.string().trim(),
    requiresAcknowledgement: z.boolean(),
    acknowledgementDueDays: numberField(0, 365),
    ownerEmployeeId: z.string().trim(),
    ...audienceFields,
  })
  .refine(audienceIsPicked, {
    path: ["audience"],
    message: "Pick at least one group for this audience",
  })
  .refine((values) => Boolean(values.content.trim()) || values.status === "DRAFT", {
    path: ["content"],
    message: "Write the policy before publishing it",
  });

export type PolicyFormValues = z.infer<typeof PolicySchema>;

export const AnnouncementSchema = z
  .object({
    title: z.string().trim().min(1, "An announcement needs a title").max(160),
    summary: z.string().trim().max(400),
    body: z.string().trim().min(1, "Say something in the announcement").max(20000),
    type: z.enum(ANNOUNCEMENT_TYPES),
    priority: z.enum(ANNOUNCEMENT_PRIORITIES),
    status: z.enum(ANNOUNCEMENT_STATUSES),
    coverImageUrl: z.string().trim().max(1000),
    isPinned: z.boolean(),
    publishAt: z.string().trim(),
    expiresAt: z.string().trim(),
    authorEmployeeId: z.string().trim(),
    ...audienceFields,
  })
  .refine(audienceIsPicked, {
    path: ["audience"],
    message: "Pick at least one group for this audience",
  })
  .refine((values) => !values.expiresAt || !values.publishAt || values.expiresAt >= values.publishAt, {
    path: ["expiresAt"],
    message: "An announcement cannot expire before it goes out",
  });

export type AnnouncementFormValues = z.infer<typeof AnnouncementSchema>;
