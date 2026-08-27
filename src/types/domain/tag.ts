export interface Tag {
  _id: string;
  name: string;
  color: string;
  description: string;
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
  isActive?: boolean;
}

export type UpdateTagPayload = Partial<CreateTagPayload>;
