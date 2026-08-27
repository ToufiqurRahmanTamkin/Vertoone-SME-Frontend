import type { TagRef } from "./tag";

export const EMPLOYEE_STATUSES = [
  "ACTIVE",
  "PROBATION",
  "ON_LEAVE",
  "SUSPENDED",
  "RESIGNED",
  "TERMINATED",
] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERN",
  "TEMPORARY",
  "CONSULTANT",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof GENDERS)[number];

export const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"] as const;
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface BankAccount {
  bankName: string;
  branchName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
}

export interface EmployeeSalary {
  amount: number;
  currency: string;
}

export interface EmployeeRef {
  _id: string;
  name: string;
  employeeCode: string;
  designation: string;
}

export interface Employee {
  _id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  maritalStatus: MaritalStatus | null;
  bloodGroup: BloodGroup | null;
  nationalId: string;
  photoUrl: string | null;
  photoPublicId: string | null;
  presentAddress: string;
  permanentAddress: string;
  emergencyContact: EmergencyContact;
  department: string;
  designation: string;
  employmentType: EmploymentType;
  workLocation: string;
  joiningDate: string;
  confirmationDate: string | null;
  resignationDate: string | null;
  reportsTo: EmployeeRef | null;
  status: EmployeeStatus;
  salary: EmployeeSalary;
  bankAccount: BankAccount;
  tags: TagRef[];
  tagIds: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  department?: string;
  designation?: string;
  tagIds?: string;
}

export interface EmployeeOptionQuery {
  search?: string;
  status?: EmployeeStatus;
}

export interface EmployeeSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  onLeaveCount: number;
}

export interface EmployeePayload {
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  maritalStatus?: MaritalStatus | null;
  bloodGroup?: BloodGroup | null;
  nationalId?: string;
  presentAddress?: string;
  permanentAddress?: string;
  emergencyContact?: Partial<EmergencyContact>;
  department?: string;
  designation?: string;
  employmentType?: EmploymentType;
  workLocation?: string;
  joiningDate: string;
  confirmationDate?: string | null;
  resignationDate?: string | null;
  reportsToId?: string | null;
  status?: EmployeeStatus;
  salary?: Partial<EmployeeSalary>;
  bankAccount?: Partial<BankAccount>;
  tagIds?: string[];
  notes?: string;
}
