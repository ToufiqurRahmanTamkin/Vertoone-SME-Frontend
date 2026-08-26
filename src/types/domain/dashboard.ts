export interface RevenueKpis {
  total: number;
  thisMonth: number;
  lastMonth: number;
  changePercent: number;
  outstanding: number;
  refunded: number;
  averageSaleValue: number;
}

export interface SubscriptionKpis {
  total: number;
  active: number;
  pending: number;
  expired: number;
  cancelled: number;
  suspended: number;
  expiringSoon: number;
  newThisMonth: number;
  newLastMonth: number;
  changePercent: number;
  awaitingApproval: number;
  autoRenewEnabled: number;
}

export interface CompanyKpis {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  registeredThisMonth: number;
}

export interface PlanKpis {
  total: number;
  active: number;
  inactive: number;
}

export interface FinanceKpis {
  income: number;
  expense: number;
  net: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  netThisMonth: number;
}

export interface GuideKpis {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
}

export interface EmailKpis {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  lastSentAt: string | null;
}

export interface SecurityKpis {
  logins: number;
  failedLogins: number;
  distinctDevices: number;
  windowDays: number;
}

export interface DashboardKpis {
  revenue: RevenueKpis;
  subscriptions: SubscriptionKpis;
  companies: CompanyKpis;
  plans: PlanKpis;
  finance: FinanceKpis;
  guides: GuideKpis;
  emails: EmailKpis;
  security: SecurityKpis;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  sales: number;
  companies: number;
}

export interface FinancePoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface BreakdownEntry {
  key: string;
  count: number;
  amount: number;
}

export interface PlanBreakdownEntry {
  planId: string;
  planName: string;
  sales: number;
  revenue: number;
  activeCount: number;
}

export interface TopCustomer {
  customerName: string;
  companyName: string;
  customerEmail: string;
  purchases: number;
  totalSpend: number;
  currency: string;
}

export interface RecentSale {
  _id: string;
  invoiceNumber: string;
  planName: string;
  customerName: string;
  companyName: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  billingOrigin: string;
  createdAt: string;
}

export interface PendingCompany {
  _id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  planName: string;
  employeeRange: string;
  createdAt: string;
}

export interface UpcomingRenewal {
  _id: string;
  invoiceNumber: string;
  planName: string;
  customerName: string;
  companyName: string;
  amount: number;
  currency: string;
  endDate: string;
  autoRenew: boolean;
  daysRemaining: number;
}

export interface RecentLogin {
  _id: string;
  email: string;
  status: string;
  failureReason: string | null;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  loginAt: string;
}

export interface DashboardOverview {
  generatedAt: string;
  currency: string;
  kpis: DashboardKpis;
  revenueTrend: RevenuePoint[];
  financeTrend: FinancePoint[];
  subscriptionStatusBreakdown: BreakdownEntry[];
  paymentStatusBreakdown: BreakdownEntry[];
  paymentMethodBreakdown: BreakdownEntry[];
  employeeRangeBreakdown: BreakdownEntry[];
  planBreakdown: PlanBreakdownEntry[];
  topCustomers: TopCustomer[];
  recentSales: RecentSale[];
  pendingCompanies: PendingCompany[];
  upcomingRenewals: UpcomingRenewal[];
  recentLogins: RecentLogin[];
}
