import { BreakdownBars, type BreakdownRow } from "@/app/dashboard/components/BreakdownBars";
import { KpiCard } from "@/app/dashboard/components/KpiCard";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatGrid } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetPurchasesOverviewQuery } from "@/redux/apis/purchasesOverviewApis";
import {
  Banknote,
  ClipboardList,
  Coins,
  FileMinus,
  PackageCheck,
  ScrollText,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

const LIST_SKELETON = Array.from({ length: 5 });

const BAR_COLORS = ["blue", "violet", "green", "amber", "orange", "red"] as const;

export default function PurchasesOverviewPage() {
  const { data, isLoading } = useGetPurchasesOverviewQuery();

  const billAccess = useModulePermission("/sme/purchases/bills");
  const orderAccess = useModulePermission("/sme/purchases/orders");
  const supplierAccess = useModulePermission("/sme/purchases/suppliers");

  const currency = data?.currency ?? "BDT";
  const pipeline = data?.pipeline;
  const spend = data?.spend;
  const payable = data?.payable;
  const counts = data?.counts;

  const pipelineCards = [
    {
      label: "Waiting for approval",
      value: formatNumber(pipeline?.requisitionsAwaitingApproval),
      description: `${formatNumber(pipeline?.requisitionsApproved)} approved and ready to order`,
      icon: ClipboardList,
      color:
        (pipeline?.requisitionsAwaitingApproval ?? 0) > 0
          ? ("warning" as const)
          : ("default" as const),
    },
    {
      label: "Out for quotes",
      value: formatNumber(pipeline?.rfqsAwaitingResponse),
      description: `${formatNumber(pipeline?.rfqsQuoted)} with prices back and ready to award`,
      icon: ScrollText,
      color: "info" as const,
    },
    {
      label: "Awaiting delivery",
      value: formatNumber(pipeline?.openOrders),
      description: `${formatNumber(pipeline?.draftOrders)} orders still in draft`,
      icon: ShoppingCart,
      color: (pipeline?.openOrders ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Received, not billed",
      value: formatNumber(pipeline?.receiptsAwaitingBill),
      description: `${formatNumber(pipeline?.draftBills)} bills still in draft`,
      icon: PackageCheck,
      color:
        (pipeline?.receiptsAwaitingBill ?? 0) > 0 ? ("warning" as const) : ("success" as const),
    },
  ];

  const spendCards = [
    {
      label: "Ordered value",
      value: formatAmountValue(spend?.orderedValue),
      description: `${formatAmountValue(spend?.receivedValue)} of it has arrived`,
      icon: ShoppingCart,
      color: "default" as const,
    },
    {
      label: "Billed by suppliers",
      value: formatAmountValue(spend?.billedValue),
      description: `${formatAmountValue(spend?.paidThisMonth)} paid so far this month`,
      icon: ScrollText,
      color: "info" as const,
    },
    {
      label: "Landed costs",
      value: formatAmountValue(spend?.landedCostAllocated),
      description: "Freight and duty folded into your stock value",
      icon: Truck,
      color: "default" as const,
    },
    {
      label: "Sent back",
      value: formatAmountValue(spend?.returnedValue),
      description: `${formatAmountValue(payable?.unappliedCredit)} still to claim on debit notes`,
      icon: FileMinus,
      color: (spend?.returnedValue ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
  ];

  const payableCards = [
    {
      label: "Owed to suppliers",
      value: formatAmountValue(payable?.outstanding),
      description: `${formatAmountValue(payable?.dueThisWeek)} falls due this week`,
      icon: Coins,
      color: (payable?.outstanding ?? 0) > 0 ? ("warning" as const) : ("success" as const),
    },
    {
      label: "Overdue",
      value: formatAmountValue(payable?.overdueValue),
      description: `${formatNumber(payable?.overdueCount)} bills past their due date`,
      icon: Banknote,
      color: (payable?.overdueCount ?? 0) > 0 ? ("error" as const) : ("success" as const),
    },
    {
      label: "Advances paid",
      value: formatAmountValue(payable?.advancePaid),
      description: "Paid before the supplier billed you",
      icon: Banknote,
      color: "default" as const,
    },
    {
      label: "Suppliers",
      value: formatNumber(counts?.suppliers),
      description: `${formatNumber(counts?.orders)} orders · ${formatNumber(
        counts?.receipts
      )} receipts · ${formatNumber(counts?.bills)} bills`,
      icon: Truck,
      color: "default" as const,
    },
  ];

  const supplierRows: BreakdownRow[] = (data?.topSuppliers ?? []).map((point, index) => ({
    key: point._id || String(index),
    label: point.name,
    count: point.orderCount,
    color: BAR_COLORS[index % BAR_COLORS.length],
    valueLabel: formatAmountValue(point.spend),
  }));

  return (
    <>
      <PageHeader
        title="Purchases overview"
        description="Everything from the first request to buy through to the money leaving your account."
        actions={<CurrencyNote currency={currency} />}
      />

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {pipelineCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {spendCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {payableCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={Truck}
          title="Where the money goes"
          description="Your biggest suppliers by what you have ordered from them."
          action={
            supplierAccess.canView && (
              <Link
                to="/sme/purchases/suppliers"
                className="text-sm font-medium text-primary hover:underline"
              >
                All suppliers
              </Link>
            )
          }
        >
          <BreakdownBars
            rows={supplierRows}
            isLoading={isLoading}
            emptyMessage="No orders have been placed with a supplier yet."
            rowCount={5}
          />
        </SectionCard>

        <SectionCard
          icon={Banknote}
          title="Overdue bills"
          description="What suppliers are waiting on, oldest first."
          action={
            billAccess.canView && (
              <Link
                to="/sme/purchases/bills?overdue=yes"
                className="text-sm font-medium text-primary hover:underline"
              >
                All bills
              </Link>
            )
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.overdueBills ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing is overdue. Everything is paid on time.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.overdueBills ?? []).map((bill) => (
                <li key={bill._id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-medium uppercase">
                      {bill.billNumber}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {bill.supplierName}
                      {bill.dueDate ? ` · due ${formatDate(bill.dueDate)}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm tabular-nums">{formatAmountValue(bill.amountDue)}</p>
                    <StatusBadge color="red" label={`${bill.daysOverdue} days late`} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard
        icon={PackageCheck}
        title="Still to arrive"
        description="Orders placed with suppliers that have not been fully delivered."
        action={
          orderAccess.canView && (
            <Link
              to="/sme/purchases/orders"
              className="text-sm font-medium text-primary hover:underline"
            >
              All purchase orders
            </Link>
          )
        }
      >
        {isLoading ? (
          <div className="space-y-3">
            {LIST_SKELETON.map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : (data?.awaitingDelivery ?? []).length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nothing is outstanding with a supplier.
          </p>
        ) : (
          <ul className="divide-y">
            {(data?.awaitingDelivery ?? []).map((order) => (
              <li key={order._id} className="flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-medium uppercase">
                    {order.orderNumber}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {order.supplierName}
                    {order.expectedDate ? ` · expected ${formatDate(order.expectedDate)}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm tabular-nums">
                    {formatNumber(order.pendingQuantity)} units left
                  </p>
                  <StatusBadge
                    color={order.isLate ? "red" : "amber"}
                    label={order.isLate ? "Late" : formatAmountValue(order.grandTotal)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </>
  );
}
