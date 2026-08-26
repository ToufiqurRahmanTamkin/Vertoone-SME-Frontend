export type ReportKey =
  | "revenue"
  | "subscriptions"
  | "plans"
  | "finance"
  | "customers"
  | "security";

export type ReportGroupBy = "day" | "week" | "month";

export interface ReportRangeQuery {
  from?: string;
  to?: string;
  groupBy?: ReportGroupBy;
}

export interface ReportPeriod {
  from: string;
  to: string;
  groupBy: ReportGroupBy;
}

export interface ReportDefinition {
  key: ReportKey;
  title: string;
  description: string;
  endpoint: string;
}

export interface ReportSummaryCard {
  key: string;
  label: string;
  value: number;
  format: "currency" | "number" | "percent";
  helper: string;
}

export interface ReportSummary {
  period: ReportPeriod;
  currency: string;
  cards: ReportSummaryCard[];
  reports: ReportDefinition[];
}

export interface RevenueReportRow {
  period: string;
  grossRevenue: number;
  collectedRevenue: number;
  outstanding: number;
  refunded: number;
  sales: number;
}

export interface RevenueReport {
  period: ReportPeriod;
  currency: string;
  rows: RevenueReportRow[];
  totals: {
    grossRevenue: number;
    collectedRevenue: number;
    outstanding: number;
    refunded: number;
    sales: number;
    averageSaleValue: number;
  };
}

export interface SubscriptionReportRow {
  period: string;
  created: number;
  activated: number;
  expired: number;
  cancelled: number;
}

export interface SubscriptionStatusRow {
  status: string;
  count: number;
  amount: number;
}

export interface SubscriptionReport {
  period: ReportPeriod;
  currency: string;
  rows: SubscriptionReportRow[];
  statusBreakdown: SubscriptionStatusRow[];
  totals: {
    created: number;
    active: number;
    expiringSoon: number;
    renewalRate: number;
  };
}

export interface PlanReportRow {
  planId: string;
  planName: string;
  billingCycle: string;
  price: number;
  sales: number;
  collectedRevenue: number;
  outstanding: number;
  activeSubscriptions: number;
  share: number;
}

export interface PlanReport {
  period: ReportPeriod;
  currency: string;
  rows: PlanReportRow[];
  totals: {
    plans: number;
    sales: number;
    collectedRevenue: number;
  };
}

export interface FinanceReportRow {
  period: string;
  income: number;
  expense: number;
  net: number;
}

export interface FinanceCategoryRow {
  categoryId: string;
  categoryName: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  entries: number;
  share: number;
}

export interface FinanceReport {
  period: ReportPeriod;
  currency: string;
  rows: FinanceReportRow[];
  categories: FinanceCategoryRow[];
  totals: {
    income: number;
    expense: number;
    net: number;
    margin: number;
  };
}

export interface CustomerReportRow {
  customerEmail: string;
  customerName: string;
  companyName: string;
  subscriptions: number;
  collectedRevenue: number;
  outstanding: number;
  lastPurchaseAt: string | null;
}

export interface CustomerReport {
  period: ReportPeriod;
  currency: string;
  rows: CustomerReportRow[];
  totals: {
    customers: number;
    collectedRevenue: number;
    averageRevenuePerCustomer: number;
  };
}

export interface SecurityReportRow {
  period: string;
  successful: number;
  failed: number;
}

export interface SecurityDeviceRow {
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  logins: number;
  lastSeenAt: string | null;
}

export interface SecurityReport {
  period: ReportPeriod;
  rows: SecurityReportRow[];
  devices: SecurityDeviceRow[];
  totals: {
    successful: number;
    failed: number;
    distinctIps: number;
  };
}
