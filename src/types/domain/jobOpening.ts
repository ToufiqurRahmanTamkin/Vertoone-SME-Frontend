import type { StatusColor } from "@/components/shared/status-badge";
import type { DepartmentRef } from "./department";
import type { DesignationRef } from "./designation";
import type { EmployeeRef } from "./employee";

export const JOB_OPENING_STATUSES = [
  "DRAFT",
  "OPEN",
  "ON_HOLD",
  "CLOSED",
  "FILLED",
] as const;
export type JobOpeningStatus = (typeof JOB_OPENING_STATUSES)[number];

export const JOB_OPENING_STATUS_LABELS: Record<JobOpeningStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  ON_HOLD: "On hold",
  CLOSED: "Closed",
  FILLED: "Filled",
};

export const JOB_OPENING_STATUS_COLORS: Record<JobOpeningStatus, StatusColor> = {
  DRAFT: "zinc",
  OPEN: "green",
  ON_HOLD: "amber",
  CLOSED: "muted",
  FILLED: "blue",
};

export const JOB_EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "TEMPORARY",
] as const;
export type JobEmploymentType = (typeof JOB_EMPLOYMENT_TYPES)[number];

export const JOB_EMPLOYMENT_TYPE_LABELS: Record<JobEmploymentType, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  TEMPORARY: "Temporary",
};

export const JOB_WORKPLACE_TYPES = ["ON_SITE", "HYBRID", "REMOTE"] as const;
export type JobWorkplaceType = (typeof JOB_WORKPLACE_TYPES)[number];

export const JOB_WORKPLACE_TYPE_LABELS: Record<JobWorkplaceType, string> = {
  ON_SITE: "On site",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

export const JOB_EXPERIENCE_LEVELS = [
  "ENTRY",
  "JUNIOR",
  "MID",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
] as const;
export type JobExperienceLevel = (typeof JOB_EXPERIENCE_LEVELS)[number];

export const JOB_EXPERIENCE_LEVEL_LABELS: Record<JobExperienceLevel, string> = {
  ENTRY: "Entry level",
  JUNIOR: "Junior",
  MID: "Mid level",
  SENIOR: "Senior",
  LEAD: "Lead",
  EXECUTIVE: "Executive",
};

export const JOB_OPENING_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type JobOpeningPriority = (typeof JOB_OPENING_PRIORITIES)[number];

export const JOB_OPENING_PRIORITY_LABELS: Record<JobOpeningPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const JOB_OPENING_PRIORITY_COLORS: Record<JobOpeningPriority, StatusColor> = {
  LOW: "zinc",
  NORMAL: "blue",
  HIGH: "amber",
  URGENT: "red",
};

export interface JobSalaryRange {
  min: number;
  max: number;
  currency: string;
  isVisible: boolean;
}

export interface JobOpeningRef {
  _id: string;
  title: string;
  code: string;
  status: JobOpeningStatus;
}

export interface JobOpening extends JobOpeningRef {
  departmentId: string | null;
  department: DepartmentRef | null;
  designationId: string | null;
  designation: DesignationRef | null;
  hiringManagerId: string | null;
  hiringManager: EmployeeRef | null;
  recruiterId: string | null;
  recruiter: EmployeeRef | null;
  employmentType: JobEmploymentType;
  workplaceType: JobWorkplaceType;
  experienceLevel: JobExperienceLevel;
  priority: JobOpeningPriority;
  location: string;
  openings: number;
  filledCount: number;
  remainingCount: number;
  summary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string[];
  salary: JobSalaryRange;
  openedAt: string | null;
  closingAt: string | null;
  closedAt: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  applicantCount: number;
  isOpen: boolean;
  isClosingSoon: boolean;
  isOverdue: boolean;
  daysOpen: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobOpeningListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: JobOpeningStatus;
  departmentId?: string;
  designationId?: string;
  hiringManagerId?: string;
  employmentType?: JobEmploymentType;
  workplaceType?: JobWorkplaceType;
  experienceLevel?: JobExperienceLevel;
  priority?: JobOpeningPriority;
  isPublished?: boolean;
  closingSoon?: boolean;
}

export interface JobOpeningSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  openCount: number;
  draftCount: number;
  onHoldCount: number;
  closedCount: number;
  filledCount: number;
  publishedCount: number;
  totalPositions: number;
  positionsToFill: number;
  closingSoonCount: number;
}

export interface JobOpeningOption {
  _id: string;
  title: string;
  code: string;
  status: JobOpeningStatus;
}

export interface JobOpeningPayload {
  title: string;
  code?: string;
  departmentId?: string | null;
  designationId?: string | null;
  hiringManagerId?: string | null;
  recruiterId?: string | null;
  status?: JobOpeningStatus;
  employmentType?: JobEmploymentType;
  workplaceType?: JobWorkplaceType;
  experienceLevel?: JobExperienceLevel;
  priority?: JobOpeningPriority;
  location?: string;
  openings?: number;
  filledCount?: number;
  summary?: string;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  skills?: string[];
  salary?: Partial<JobSalaryRange>;
  openedAt?: string | null;
  closingAt?: string | null;
  isPublished?: boolean;
}
