export interface DashboardStats {
  plans: { total: number; active: number };
  subscriptions: {
    total: number;
    active: number;
    pending: number;
    expired: number;
    cancelled: number;
    suspended: number;
    expiringSoon: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    outstanding: number;
    currency: string;
  };
  guides: { total: number; published: number };
}

/** `month` is a `YYYY-MM` key covering the trailing 12 months. */
export interface RevenuePoint {
  month: string;
  revenue: number;
  sales: number;
}

export interface PlanBreakdownEntry {
  planId: string;
  planName: string;
  sales: number;
  revenue: number;
}

export interface RecentSale {
  _id: string;
  invoiceNumber: string;
  planName: string;
  customerName: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  revenueTrend: RevenuePoint[];
  planBreakdown: PlanBreakdownEntry[];
  recentSales: RecentSale[];
}
