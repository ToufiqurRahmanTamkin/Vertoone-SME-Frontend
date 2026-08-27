export const TAG_SCOPES = [
  "EMPLOYEE",
  "TEAM",
  "LEAD",
  "CONTACT",
  "ACCOUNT",
  "DEAL",
  "TICKET",
  "PRODUCT",
  "SUPPLIER",
  "CUSTOMER",
  "INVOICE",
  "TASK",
] as const;

export type TagScope = (typeof TAG_SCOPES)[number];

export interface TagRef {
  _id: string;
  name: string;
  color: string;
}

export interface Tag extends TagRef {
  description: string;
  scopes: TagScope[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TagListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
  scope?: TagScope;
}

export interface TagOptionQuery {
  scope?: TagScope;
  search?: string;
}

export interface TagSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
}

export interface CreateTagPayload {
  name: string;
  color: string;
  description?: string;
  scopes?: TagScope[];
  isActive?: boolean;
}

export type UpdateTagPayload = Partial<CreateTagPayload>;
