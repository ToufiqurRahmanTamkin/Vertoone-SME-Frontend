import type { EmployeeRange } from "./company";

export interface SisterConcern {
  _id: string;
  name: string;
  registrationNo: string;
  industry: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  employeeRange: EmployeeRange;
  hrmsEnabled: boolean;
  smeEnabled: boolean;
  crmEnabled: boolean;
  isActive: boolean;
  notes: string;
  createdAt: string;
}

export const sisterConcernModules = (concern: SisterConcern): string[] =>
  [
    concern.hrmsEnabled ? "HRMS" : null,
    concern.smeEnabled ? "SME" : null,
    concern.crmEnabled ? "CRM" : null,
  ].filter((module): module is string => module !== null);
