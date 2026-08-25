export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Pagination;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: Pagination;
}

export interface ApiErrorResponse {
  data?: {
    message?: string;
    errors?: Record<string, string[]>;
  };
  status?: number;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | undefined;
}

export interface AsyncState<T> {
  data?: T;
  isLoading: boolean;
  error?: ApiErrorResponse;
}
