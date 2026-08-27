export interface LeadSource {
  _id: string;
  name: string;
  color: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadSourceListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface CreateLeadSourcePayload {
  name: string;
  color: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateLeadSourcePayload = Partial<CreateLeadSourcePayload>;
