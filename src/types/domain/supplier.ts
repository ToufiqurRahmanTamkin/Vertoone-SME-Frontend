import type { TagRef } from "./tag";

export const SUPPLIER_PAYMENT_TERMS = [
  "CASH",
  "ADVANCE",
  "NET_7",
  "NET_15",
  "NET_30",
  "NET_45",
  "NET_60",
] as const;

export type SupplierPaymentTerm = (typeof SUPPLIER_PAYMENT_TERMS)[number];

export const PAYMENT_TERM_LABELS: Record<SupplierPaymentTerm, string> = {
  CASH: "Cash on delivery",
  ADVANCE: "Payment in advance",
  NET_7: "Net 7 days",
  NET_15: "Net 15 days",
  NET_30: "Net 30 days",
  NET_45: "Net 45 days",
  NET_60: "Net 60 days",
};

export interface SupplierAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SupplierBankAccount {
  bankName: string;
  branchName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
}

export interface SupplierRef {
  _id: string;
  name: string;
  code: string;
}

export interface Supplier extends SupplierRef {
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone: string;
  website: string;
  taxId: string;
  address: SupplierAddress;
  paymentTerms: SupplierPaymentTerm;
  creditLimit: number;
  openingBalance: number;
  bankAccount: SupplierBankAccount;
  tags: TagRef[];
  tagIds: string[];
  notes: string;
  isActive: boolean;
  openOrderCount: number;
  payableOutstanding: number;
  overdueValue: number;
  billedValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
  paymentTerms?: SupplierPaymentTerm;
  tagIds?: string;
}

export interface SupplierOptionQuery {
  search?: string;
}

export interface SupplierSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  openingBalanceTotal: number;
  payableOutstanding: number;
  overdueValue: number;
  suppliersWithOverdue: number;
}

export interface SupplierPayload {
  name: string;
  code?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  website?: string;
  taxId?: string;
  address?: Partial<SupplierAddress>;
  paymentTerms?: SupplierPaymentTerm;
  creditLimit?: number;
  openingBalance?: number;
  bankAccount?: Partial<SupplierBankAccount>;
  tagIds?: string[];
  notes?: string;
  isActive?: boolean;
}
