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
import { useGetInventoryOverviewQuery } from "@/redux/apis/inventoryOverviewApis";
import {
  AlarmClock,
  ArrowLeftRight,
  Boxes,
  ClipboardList,
  Coins,
  Hash,
  PackageCheck,
  TrendingDown,
  Warehouse,
} from "lucide-react";
import { Link } from "react-router-dom";

const LIST_SKELETON = Array.from({ length: 5 });

const BAR_COLORS = ["blue", "violet", "green", "amber", "orange", "red", "zinc", "muted"] as const;

export default function InventoryOverviewPage() {
  const { data, isLoading } = useGetInventoryOverviewQuery();

  const stockAccess = useModulePermission("/sme/inventory/stock");
  const batchAccess = useModulePermission("/sme/inventory/batches");
  const reorderAccess = useModulePermission("/sme/inventory/reorder-rules");

  const currency = data?.currency ?? "BDT";
  const stock = data?.stock;
  const movement = data?.movement;
  const tracking = data?.tracking;

  const stockCards = [
    {
      label: "Stock value",
      value: formatAmountValue(stock?.stockValue),
      description: `${formatAmountValue(stock?.retailValue)} at retail`,
      icon: Coins,
      color: "default" as const,
    },
    {
      label: "Tracked products",
      value: formatNumber(stock?.trackedProducts),
      description: `${formatNumber(stock?.inStockCount)} sitting comfortably`,
      icon: Boxes,
      color: "info" as const,
    },
    {
      label: "Running low",
      value: formatNumber(stock?.lowStockCount),
      description: `${formatNumber(stock?.outOfStockCount)} already out of stock`,
      icon: TrendingDown,
      color: (stock?.lowStockCount ?? 0) > 0 ? ("warning" as const) : ("success" as const),
    },
    {
      label: "Warehouses",
      value: formatNumber(stock?.warehouseCount),
      description: `${formatNumber(stock?.reservedQuantity)} units reserved on open orders`,
      icon: Warehouse,
      color: "default" as const,
    },
  ];

  const movementCards = [
    {
      label: "Movements this month",
      value: formatNumber(movement?.movementsThisMonth),
      description: `${formatNumber(movement?.inboundUnits)} in · ${formatNumber(
        movement?.outboundUnits
      )} out`,
      icon: ArrowLeftRight,
      color: "info" as const,
    },
    {
      label: "Open transfers",
      value: formatNumber(movement?.openTransfers),
      description: "Stock on the move between warehouses",
      icon: PackageCheck,
      color: (movement?.openTransfers ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Counts under way",
      value: formatNumber(movement?.openCounts),
      description: `${formatNumber(movement?.draftAdjustments)} adjustments still in draft`,
      icon: ClipboardList,
      color: (movement?.openCounts ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Below minimum",
      value: formatNumber(tracking?.belowMinimumCount),
      description: `${formatNumber(tracking?.suggestedUnits)} units suggested to order`,
      icon: AlarmClock,
      color: (tracking?.belowMinimumCount ?? 0) > 0 ? ("error" as const) : ("success" as const),
    },
  ];

  const trackingCards = [
    {
      label: "Batches",
      value: formatNumber(tracking?.batches),
      description: `${formatNumber(tracking?.expiringBatches)} expiring · ${formatNumber(
        tracking?.expiredBatches
      )} expired`,
      icon: AlarmClock,
      color:
        (tracking?.expiringBatches ?? 0) + (tracking?.expiredBatches ?? 0) > 0
          ? ("warning" as const)
          : ("success" as const),
    },
    {
      label: "Value at risk",
      value: formatAmountValue(tracking?.expiringValue),
      description: "Held in batches close to or past their date",
      icon: Coins,
      color: (tracking?.expiringValue ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Serial numbers",
      value: formatNumber(tracking?.serials),
      description: `${formatNumber(tracking?.serialsInStock)} still in stock`,
      icon: Hash,
      color: "default" as const,
    },
    {
      label: "Bin locations",
      value: formatNumber(tracking?.bins),
      description: `${formatNumber(tracking?.reorderRules)} reorder rules in place`,
      icon: Warehouse,
      color: "default" as const,
    },
  ];

  const warehouseRows: BreakdownRow[] = (data?.warehouses ?? []).map((point, index) => ({
    key: point._id,
    label: point.name,
    count: Math.round(point.quantity),
    color: BAR_COLORS[index % BAR_COLORS.length],
    valueLabel: formatAmountValue(point.stockValue),
  }));

  return (
    <>
      <PageHeader
        title="Inventory overview"
        description="Stock value, what is moving, and everything that needs attention before it becomes a problem."
        actions={<CurrencyNote currency={currency} />}
      />

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {stockCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {movementCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {trackingCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={Warehouse}
          title="Where your stock sits"
          description="Value held in each warehouse."
          action={
            stockAccess.canView && (
              <Link
                to="/sme/inventory/valuation"
                className="text-sm font-medium text-primary hover:underline"
              >
                Full valuation
              </Link>
            )
          }
        >
          <BreakdownBars
            rows={warehouseRows}
            isLoading={isLoading}
            emptyMessage="No stock recorded against a warehouse yet."
            rowCount={5}
          />
        </SectionCard>

        <SectionCard
          icon={TrendingDown}
          title="Running low"
          description="The products closest to running out."
          action={
            stockAccess.canView && (
              <Link
                to="/sme/inventory/stock"
                className="text-sm font-medium text-primary hover:underline"
              >
                Stock on hand
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
          ) : (data?.lowStock ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing is running low.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.lowStock ?? []).map((row) => (
                <li key={row.productId} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.product?.name ?? "—"}</p>
                    <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                      {row.product?.sku ?? ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge
                      color={row.quantity <= 0 ? "red" : "amber"}
                      label={
                        row.quantity <= 0
                          ? "Out of stock"
                          : `${formatNumber(row.quantity)} left of ${formatNumber(
                              row.lowStockAlert
                            )}`
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={AlarmClock}
          title="Running out of shelf life"
          description="Batches expiring soon, or already past their date."
          action={
            batchAccess.canView && (
              <Link
                to="/sme/inventory/batches"
                className="text-sm font-medium text-primary hover:underline"
              >
                All batches
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
          ) : (data?.expiringBatches ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing is close to expiring.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.expiringBatches ?? []).map((batch) => (
                <li key={batch._id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{batch.product?.name ?? "—"}</p>
                    <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                      {batch.batchNumber} · {batch.warehouse?.name ?? "—"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge
                      color={batch.status === "EXPIRED" ? "red" : "amber"}
                      label={
                        batch.expiresAt
                          ? `${batch.status === "EXPIRED" ? "Expired" : "Expires"} ${formatDate(
                              batch.expiresAt
                            )}`
                          : "No expiry"
                      }
                    />
                    <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                      {formatNumber(batch.quantity)} units left
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={ClipboardList}
          title="What needs doing"
          description="Open work sitting across the inventory module."
          action={
            reorderAccess.canView && (
              <Link
                to="/sme/inventory/reorder-rules"
                className="text-sm font-medium text-primary hover:underline"
              >
                Reorder rules
              </Link>
            )
          }
        >
          <ul className="divide-y">
            <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Transfers still in flight</span>
              <span className="font-medium tabular-nums">
                {formatNumber(movement?.openTransfers ?? 0)}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Adjustments waiting to be approved</span>
              <span className="font-medium tabular-nums">
                {formatNumber(movement?.draftAdjustments ?? 0)}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Stock counts left open</span>
              <span className="font-medium tabular-nums">
                {formatNumber(movement?.openCounts ?? 0)}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Products below their minimum</span>
              <span className="font-medium tabular-nums">
                {formatNumber(tracking?.belowMinimumCount ?? 0)}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Units suggested to order</span>
              <span className="font-medium tabular-nums">
                {formatNumber(tracking?.suggestedUnits ?? 0)}
              </span>
            </li>
          </ul>
        </SectionCard>
      </div>
    </>
  );
}
