export interface ContactTypeRef {
  _id: string;
  name: string;
  color: string;
}

export interface ContactType extends ContactTypeRef {
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactTypeListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface ContactTypeOptionQuery {
  search?: string;
}

export interface ContactTypeSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
}

export interface CreateContactTypePayload {
  name: string;
  color: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateContactTypePayload = Partial<CreateContactTypePayload>;
