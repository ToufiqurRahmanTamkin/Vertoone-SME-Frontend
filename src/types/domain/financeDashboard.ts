import type { InvoiceOrigin, InvoiceStatus, InvoiceType } from "./invoice";
import type { PaymentMethod } from "./soldSubscription";

export interface FinanceLedgerKpis {
  income: number;
  expense: number;
  net: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  netThisMonth: number;
  incomeLastMonth: number;
  expenseLastMonth: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  margin: number;
}

export interface FinanceReceivableKpis {
  receivable: number;
  payable: number;
  overdueReceivable: number;
  overduePayable: number;
  overdueCount: number;
  dueThisWeek: number;
}

export interface FinanceInvoiceKpis {
  total: number;
  draft: number;
  unpaid: number;
  paid: number;
  cancelled: number;
  closed: number;
  linked: number;
  collectionRate: number;
}

export interface FinanceEntryKpis {
  incomeCount: number;
  expenseCount: number;
  categoryCount: number;
  averageIncome: number;
  averageExpense: number;
}

export interface FinanceKpis {
  ledger: FinanceLedgerKpis;
  receivables: FinanceReceivableKpis;
  invoices: FinanceInvoiceKpis;
  entries: FinanceEntryKpis;
}

export interface FinanceTrendPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface InvoiceStatusPoint {
  status: InvoiceStatus;
  count: number;
  amount: number;
}

export interface InvoiceTypeStatusPoint {
  type: InvoiceType;
  status: InvoiceStatus;
  count: number;
  amount: number;
}

export interface CategoryBreakdownEntry {
  categoryId: string;
  categoryName: string;
  type: InvoiceType;
  count: number;
  amount: number;
  share: number;
}

export interface PaymentMethodEntry {
  method: PaymentMethod;
  count: number;
  amount: number;
}

export interface RecentInvoice {
  _id: string;
  invoiceNumber: string;
  title: string;
  party: string;
  type: InvoiceType;
  status: InvoiceStatus;
  origin: InvoiceOrigin;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string | null;
  categoryName: string;
  linked: boolean;
}

export interface OverdueInvoice extends RecentInvoice {
  daysOverdue: number;
}

export interface RecentEntry {
  _id: string;
  title: string;
  type: InvoiceType;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  date: string;
  party: string;
  categoryName: string;
  invoiceNumber: string | null;
}

export interface FinanceDashboard {
  generatedAt: string;
  currency: string;
  kpis: FinanceKpis;
  trend: FinanceTrendPoint[];
  invoiceStatusBreakdown: InvoiceStatusPoint[];
  invoiceTypeStatusBreakdown: InvoiceTypeStatusPoint[];
  incomeCategories: CategoryBreakdownEntry[];
  expenseCategories: CategoryBreakdownEntry[];
  paymentMethods: PaymentMethodEntry[];
  recentInvoices: RecentInvoice[];
  overdueInvoices: OverdueInvoice[];
  recentEntries: RecentEntry[];
}
