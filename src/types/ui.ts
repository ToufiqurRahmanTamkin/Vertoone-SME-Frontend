
import type { ReactNode } from "react";
import type { Pagination } from "./api";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export interface ModalProps extends DialogProps {
  isLoading?: boolean;
}

export interface FormFieldError {
  message: string;
  code?: string;
}

export interface FormField {
  name: string;
  value: string | number | boolean | undefined;
  error?: FormFieldError;
  isTouched?: boolean;
  isDirty?: boolean;
}

export interface FormState {
  fields: Record<string, FormField>;
  isSubmitting: boolean;
  isValid: boolean;
  errors?: Record<string, string>;
}

export type FilterFieldType = "text" | "select" | "date" | "date-range";

export interface FilterConfig {
  name: string;
  label: string;
  type: FilterFieldType;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface DataTableProps<T = unknown> {
  columns: Array<Record<string, unknown>>;
  data: T[];
  isLoading?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  currentFilters: Record<string, string | number | boolean | undefined>;
  onFilterChange: (name: string, value: string | number | undefined) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export interface ActionButtonProps {
  label: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export interface MenuItem {
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface BadgeProps {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  children: ReactNode;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface BaseLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export interface ConfirmDialogProps {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDangerous?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}
