/**
 * Common/Utility types
 * Shared types used across the application
 */

// Status enums
export type Status =
  | "ACTIVE"
  | "INACTIVE"
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "SUSPENDED"
  | "CANCELLED";

// Entity base types
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: string | null;
}

// Query and filter types
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

// Date range types
export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface DateRangeString {
  from?: string;
  to?: string;
}

// Utility types
export type Maybe<T> = T | null | undefined;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

// Result type for error handling
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// Error type definitions (actual classes should be in utils/errors.ts)
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

// Async operation states
export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface LoadingState {
  status: AsyncStatus;
  isLoading: boolean;
  isDone: boolean;
}

// Selection/Multi-select types
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
}

// Keyed collection
export type KeyedCollection<T> = Record<string, T>;
