import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";

export const EMPLOYEE_REQUEST_KINDS = [
  "OVERTIME",
  "MOVEMENT",
  "TRAVEL",
  "EXPENSE_CLAIM",
  "LOAN_ADVANCE",
  "ASSET_REQUEST",
  "LETTER",
  "PROFILE_UPDATE",
  "HELPDESK",
] as const;

export type EmployeeRequestKind = (typeof EMPLOYEE_REQUEST_KINDS)[number];

export const EMPLOYEE_REQUEST_KIND_LABELS: Record<EmployeeRequestKind, string> = {
  OVERTIME: "Overtime",
  MOVEMENT: "Movement",
  TRAVEL: "Travel",
  EXPENSE_CLAIM: "Expense claim",
  LOAN_ADVANCE: "Loan or advance",
  ASSET_REQUEST: "Asset request",
  LETTER: "Letter or certificate",
  PROFILE_UPDATE: "Profile update",
  HELPDESK: "Helpdesk ticket",
};

export const EMPLOYEE_REQUEST_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export type EmployeeRequestStatus = (typeof EMPLOYEE_REQUEST_STATUSES)[number];

export const EMPLOYEE_REQUEST_STATUS_COLORS: Record<EmployeeRequestStatus, StatusColor> = {
  PENDING: "amber",
  IN_PROGRESS: "blue",
  APPROVED: "green",
  REJECTED: "red",
  CANCELLED: "zinc",
};

export const REQUEST_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

export const REQUEST_PRIORITY_LABELS: Record<RequestPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const REQUEST_PRIORITY_COLORS: Record<RequestPriority, StatusColor> = {
  LOW: "zinc",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

export const LETTER_TYPES = [
  "SALARY_CERTIFICATE",
  "EMPLOYMENT_CERTIFICATE",
  "EXPERIENCE_LETTER",
  "NO_OBJECTION_CERTIFICATE",
  "VISA_SUPPORT_LETTER",
  "ADDRESS_PROOF",
  "OTHER",
] as const;

export type LetterType = (typeof LETTER_TYPES)[number];

export const LETTER_TYPE_LABELS: Record<LetterType, string> = {
  SALARY_CERTIFICATE: "Salary certificate",
  EMPLOYMENT_CERTIFICATE: "Employment certificate",
  EXPERIENCE_LETTER: "Experience letter",
  NO_OBJECTION_CERTIFICATE: "No objection certificate",
  VISA_SUPPORT_LETTER: "Visa support letter",
  ADDRESS_PROOF: "Address proof",
  OTHER: "Something else",
};

export const MOVEMENT_TYPES = ["OFFICIAL_VISIT", "CLIENT_MEETING", "FIELD_WORK", "OTHER"] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  OFFICIAL_VISIT: "Official visit",
  CLIENT_MEETING: "Client meeting",
  FIELD_WORK: "Field work",
  OTHER: "Something else",
};

export const TRAVEL_MODES = ["ROAD", "RAIL", "AIR", "SEA", "OTHER"] as const;

export type TravelMode = (typeof TRAVEL_MODES)[number];

export const TRAVEL_MODE_LABELS: Record<TravelMode, string> = {
  ROAD: "Road",
  RAIL: "Rail",
  AIR: "Air",
  SEA: "Sea",
  OTHER: "Other",
};

export const EXPENSE_CATEGORIES = [
  "TRAVEL",
  "ACCOMMODATION",
  "MEALS",
  "FUEL",
  "SUPPLIES",
  "CLIENT_ENTERTAINMENT",
  "TRAINING",
  "OTHER",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  TRAVEL: "Travel",
  ACCOMMODATION: "Accommodation",
  MEALS: "Meals",
  FUEL: "Fuel",
  SUPPLIES: "Supplies",
  CLIENT_ENTERTAINMENT: "Client entertainment",
  TRAINING: "Training",
  OTHER: "Something else",
};

export const FINANCE_REQUEST_TYPES = ["LOAN", "SALARY_ADVANCE"] as const;

export type FinanceRequestType = (typeof FINANCE_REQUEST_TYPES)[number];

export const FINANCE_REQUEST_TYPE_LABELS: Record<FinanceRequestType, string> = {
  LOAN: "Loan",
  SALARY_ADVANCE: "Salary advance",
};

export const HELPDESK_CATEGORIES = [
  "PAYROLL",
  "ATTENDANCE",
  "LEAVE",
  "BENEFITS",
  "IT_SUPPORT",
  "FACILITIES",
  "GRIEVANCE",
  "OTHER",
] as const;

export type HelpdeskCategory = (typeof HELPDESK_CATEGORIES)[number];

export const HELPDESK_CATEGORY_LABELS: Record<HelpdeskCategory, string> = {
  PAYROLL: "Payroll",
  ATTENDANCE: "Attendance",
  LEAVE: "Leave",
  BENEFITS: "Benefits",
  IT_SUPPORT: "IT support",
  FACILITIES: "Facilities",
  GRIEVANCE: "Grievance",
  OTHER: "Something else",
};

export const PROFILE_UPDATE_FIELDS = [
  "NAME",
  "PHONE",
  "EMAIL",
  "PRESENT_ADDRESS",
  "PERMANENT_ADDRESS",
  "EMERGENCY_CONTACT",
  "BANK_ACCOUNT",
  "NATIONAL_ID",
  "MARITAL_STATUS",
  "OTHER",
] as const;

export type ProfileUpdateField = (typeof PROFILE_UPDATE_FIELDS)[number];

export const PROFILE_UPDATE_FIELD_LABELS: Record<ProfileUpdateField, string> = {
  NAME: "Name",
  PHONE: "Phone number",
  EMAIL: "Email address",
  PRESENT_ADDRESS: "Present address",
  PERMANENT_ADDRESS: "Permanent address",
  EMERGENCY_CONTACT: "Emergency contact",
  BANK_ACCOUNT: "Bank account",
  NATIONAL_ID: "National ID",
  MARITAL_STATUS: "Marital status",
  OTHER: "Something else",
};

export interface RequestAttachment {
  url: string;
  fileName: string;
}

export interface RequestMessage {
  authorName: string;
  isStaff: boolean;
  body: string;
  createdAt: string;
}

export interface EmployeeRequest {
  _id: string;
  employeeId: string;
  employee: EmployeeRef | null;
  kind: EmployeeRequestKind;
  kindLabel: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  priority: RequestPriority;
  priorityLabel: string;
  startDate: string | null;
  endDate: string | null;
  startAt: string | null;
  endAt: string | null;
  hours: number;
  amount: number;
  currency: string;
  quantity: number;
  installments: number;
  monthlyInstalment: number;
  location: string;
  addressedTo: string;
  fieldName: string;
  currentValue: string;
  requestedValue: string;
  attachments: RequestAttachment[];
  messages: RequestMessage[];
  status: EmployeeRequestStatus;
  statusLabel: string;
  reviewedByName: string;
  reviewedAt: string | null;
  reviewNote: string;
  isPending: boolean;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRequestListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  employeeId?: string;
  kind?: EmployeeRequestKind;
  status?: EmployeeRequestStatus;
  category?: string;
  priority?: RequestPriority;
  from?: string;
  to?: string;
}

export interface EmployeeRequestSummary {
  kind: EmployeeRequestKind | null;
  total: number;
  pending: number;
  inProgress: number;
  approved: number;
  rejected: number;
  cancelled: number;
  open: number;
  totalAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  totalHours: number;
  approvedHours: number;
  currency: string;
}

export interface CreateEmployeeRequestPayload {
  kind: EmployeeRequestKind;
  title?: string;
  description: string;
  category?: string;
  priority?: RequestPriority;
  startDate?: string | null;
  endDate?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  amount?: number;
  quantity?: number;
  installments?: number;
  location?: string;
  addressedTo?: string;
  fieldName?: string;
  currentValue?: string;
  requestedValue?: string;
  attachments?: RequestAttachment[];
}

export interface ReviewEmployeeRequestPayload {
  reviewNote?: string;
}

export interface AddRequestMessagePayload {
  body: string;
}

export const formatRequestHours = (value: number): string =>
  `${value % 1 === 0 ? value : value.toFixed(2)}h`;
