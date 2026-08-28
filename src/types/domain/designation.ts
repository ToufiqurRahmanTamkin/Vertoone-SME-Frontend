export interface DesignationRef {
  _id: string;
  name: string;
  code: string;
}

export interface Designation extends DesignationRef {
  description: string;
  level: number;
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DesignationListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface DesignationOptionQuery {
  search?: string;
}

export interface DesignationSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  unassignedEmployeeCount: number;
}

export interface DesignationPayload {
  name: string;
  code?: string;
  description?: string;
  level?: number;
  isActive?: boolean;
}
