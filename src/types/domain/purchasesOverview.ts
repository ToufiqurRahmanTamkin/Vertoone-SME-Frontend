export interface PurchasesModuleTally {
  suppliers: number;
  requisitions: number;
  rfqs: number;
  orders: number;
  receipts: number;
  bills: number;
  payments: number;
  debitNotes: number;
  landedCosts: number;
  returns: number;
}

export type PurchasesOverviewLimits = Record<keyof PurchasesModuleTally, number | null>;

export interface PurchasesPipelineKpis {
  requisitionsAwaitingApproval: number;
  requisitionsApproved: number;
  rfqsAwaitingResponse: number;
  rfqsQuoted: number;
  draftOrders: number;
  openOrders: number;
  receiptsAwaitingBill: number;
  draftBills: number;
}

export interface PurchasesSpendKpis {
  orderedValue: number;
  receivedValue: number;
  billedValue: number;
  paidThisMonth: number;
  landedCostAllocated: number;
  returnedValue: number;
}

export interface PurchasesPayableKpis {
  outstanding: number;
  overdueValue: number;
  overdueCount: number;
  dueThisWeek: number;
  unappliedCredit: number;
  advancePaid: number;
}

export interface TopSupplierPoint {
  _id: string;
  name: string;
  code: string;
  orderCount: number;
  spend: number;
  sharePercent: number;
}

export interface OverdueBillRow {
  _id: string;
  billNumber: string;
  supplierName: string;
  dueDate: string | null;
  amountDue: number;
  daysOverdue: number;
}

export interface AwaitingDeliveryRow {
  _id: string;
  orderNumber: string;
  supplierName: string;
  expectedDate: string | null;
  pendingQuantity: number;
  grandTotal: number;
  isLate: boolean;
}

export interface PurchasesOverview {
  counts: PurchasesModuleTally;
  limits: PurchasesOverviewLimits;
  pipeline: PurchasesPipelineKpis;
  spend: PurchasesSpendKpis;
  payable: PurchasesPayableKpis;
  topSuppliers: TopSupplierPoint[];
  overdueBills: OverdueBillRow[];
  awaitingDelivery: AwaitingDeliveryRow[];
  currency: string;
}
