
export type Status =
  | "ACTIVE"
  | "INACTIVE"
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "SUSPENDED"
  | "CANCELLED";

export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: string | null;
}

export interface QueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  from?: string;
  to?: string;
  status?: string;
  [key: string]: string | number | undefined;
}

export interface FilterState {
  filters: QueryFilters;
  setFilter: (name: string, value: string | number | undefined) => void;
  clearFilters: () => void;
  resetFilter: (name: string) => void;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface DateRangeString {
  from?: string;
  to?: string;
}

export type Maybe<T> = T | null | undefined;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export interface ValidationErrorType {
  name: "ValidationError";
  message: string;
  field?: string;
}

export interface NotFoundErrorType {
  name: "NotFoundError";
  message: string;
}

export interface UnauthorizedErrorType {
  name: "UnauthorizedError";
  message: string;
}

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface LoadingState {
  status: AsyncStatus;
  isLoading: boolean;
  isDone: boolean;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
}

export type KeyedCollection<T> = Record<string, T>;
