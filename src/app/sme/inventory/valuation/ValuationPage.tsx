import { BreakdownBars, type BreakdownRow } from "@/app/dashboard/components/BreakdownBars";
import { BackLink } from "@/components/shared/back-link";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { safeDistanceToNow } from "@/lib/date";
import { useGetBrandOptionsQuery } from "@/redux/apis/brandApis";
import {
  useGetValuationBreakdownQuery,
  useGetValuationQuery,
  useGetValuationSummaryQuery,
} from "@/redux/apis/inventoryValuationApis";
import { useGetProductCategoryOptionsQuery } from "@/redux/apis/productCategoryApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import {
  VALUATION_GROUPINGS,
  VALUATION_GROUPING_LABELS,
  VALUATION_METHODS,
  VALUATION_METHOD_LABELS,
  type ValuationGrouping,
  type ValuationMethod,
} from "@/types/domain/inventoryValuation";
import { Boxes, Coins, Layers } from "lucide-react";
import * as React from "react";
import { valuationColumns } from "./valuation.columns";

const BAR_COLORS = ["blue", "violet", "green", "amber", "orange", "red", "zinc", "muted"] as const;

export default function ValuationPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();

  const method = (filters.method as ValuationMethod | undefined) ?? "AVERAGE_COST";
  const groupBy = (filters.groupBy as ValuationGrouping | undefined) ?? "CATEGORY";
  const warehouseId = filters.warehouseId as string | undefined;

  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();
  const { data: categories = [] } = useGetProductCategoryOptionsQuery();
  const { data: brands = [] } = useGetBrandOptionsQuery();

  const { data, isLoading, isFetching } = useGetValuationQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    categoryId: filters.categoryId as string | undefined,
    brandId: filters.brandId as string | undefined,
    warehouseId,
    method,
    deadStockOnly: filters.deadStockOnly === "true" ? true : undefined,
  });

  const { data: summary } = useGetValuationSummaryQuery({ warehouseId, method });
  const { data: breakdown = [], isLoading: isLoadingBreakdown } = useGetValuationBreakdownQuery({
    groupBy,
    warehouseId,
    method,
  });

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "method",
        label: "Costed at",
        type: "select",
        hideAllOption: true,
        defaultValue: "AVERAGE_COST",
        options: VALUATION_METHODS.map((entry) => ({
          label: VALUATION_METHOD_LABELS[entry],
          value: entry,
        })),
      },
      {
        name: "warehouseId",
        label: "Warehouse",
        type: "select",
        options: warehouses.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse._id,
        })),
      },
      {
        name: "categoryId",
        label: "Category",
        type: "select",
        options: categories.map((category) => ({ label: category.name, value: category._id })),
      },
      {
        name: "brandId",
        label: "Brand",
        type: "select",
        options: brands.map((brand) => ({ label: brand.name, value: brand._id })),
      },
      {
        name: "deadStockOnly",
        label: "Dead stock",
        type: "select",
        options: [{ label: "Only dead stock", value: "true" }],
      },
      {
        name: "groupBy",
        label: "Break down by",
        type: "select",
        hideAllOption: true,
        defaultValue: "CATEGORY",
        options: VALUATION_GROUPINGS.filter((entry) => entry !== "WAREHOUSE").map((entry) => ({
          label: VALUATION_GROUPING_LABELS[entry],
          value: entry,
        })),
      },
    ],
    [warehouses, categories, brands]
  );

  const columns = React.useMemo(() => valuationColumns(), []);

  const breakdownRows: BreakdownRow[] = breakdown.slice(0, 8).map((row, index) => ({
    key: row._id,
    label: row.label,
    count: row.productCount,
    color: BAR_COLORS[index % BAR_COLORS.length],
    valueLabel: formatAmountValue(row.costValue),
  }));

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Stock valuation"
        description="What your stock is worth at cost and at retail, and how much of it has stopped moving."
        actions={
          <>
            <CurrencyNote currency={summary?.currency ?? "BDT"} />
            <BackLink to="/sme/inventory/overview" label="Inventory overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Value at cost</StatLabel>
          <StatValue>{formatAmountValue(summary?.costValue)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.quantity ?? 0)} units across{" "}
            {formatNumber(summary?.skuCount ?? 0)} products
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Value at retail</StatLabel>
          <StatValue>{formatAmountValue(summary?.retailValue)}</StatValue>
          <StatDescription>
            {formatAmountValue(summary?.potentialProfit)} of profit waiting in it
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Margin held</StatLabel>
          <StatValue>{summary?.marginPercent ?? 0}%</StatValue>
          <StatDescription>
            {VALUATION_METHOD_LABELS[summary?.method ?? "AVERAGE_COST"]}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Dead stock</StatLabel>
          <StatValue>{formatAmountValue(summary?.deadStockValue)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.deadStockCount ?? 0)} products idle for 90 days or more
          </StatDescription>
        </Stat>
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={Layers}
          title={`Value by ${VALUATION_GROUPING_LABELS[groupBy].toLowerCase()}`}
          description="Where the money in your stock is concentrated."
        >
          <BreakdownBars
            rows={breakdownRows}
            isLoading={isLoadingBreakdown}
            emptyMessage="Nothing in stock yet."
            rowCount={6}
          />
        </SectionCard>

        <SectionCard
          icon={Coins}
          title="Worth knowing"
          description="Numbers that usually need a decision behind them."
        >
          <ul className="divide-y">
            <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Warehouses holding stock</span>
              <span className="font-medium tabular-nums">
                {formatNumber(summary?.warehouseCount ?? 0)}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Products with negative stock</span>
              <span className="font-medium tabular-nums">
                {formatNumber(summary?.negativeStockCount ?? 0)}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Dead stock share of value</span>
              <span className="font-medium tabular-nums">
                {summary && summary.costValue > 0
                  ? `${Math.round((summary.deadStockValue / summary.costValue) * 100)}%`
                  : "0%"}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Average cost per unit</span>
              <span className="font-medium tabular-nums">
                {summary && summary.quantity > 0
                  ? formatAmountValue(summary.costValue / summary.quantity)
                  : formatAmountValue(0)}
              </span>
            </li>
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        icon={Boxes}
        title="Every product, valued"
        description="Sorted by the value each product is holding."
        contentClassName="gap-4"
      >
        <DataTableToolbar
          searchValue={filters.search}
          onSearchChange={(value) => setFilter("search", value)}
          searchPlaceholder="Search products or SKUs..."
          filters={tableFilters}
          currentFilters={filters}
          onFilterChange={setFilter}
          onClear={clearFilters}
          isLoading={isFetching}
        />

        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          pagination={
            meta
              ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
              : undefined
          }
          onPageChange={(page) => setFilter("page", page)}
          onLimitChange={(limit) => setFilter("limit", limit)}
          getRowId={(row) => row._id}
          mobileCard={(row) => (
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{row.name}</p>
                  <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                    {row.sku}
                  </p>
                </div>
                {row.isDeadStock ? (
                  <StatusBadge color="red" label="Dead stock" />
                ) : (
                  <StatusBadge
                    color={row.marginPercent >= 30 ? "green" : "amber"}
                    label={`${row.marginPercent}%`}
                  />
                )}
              </div>

              <dl className="mt-3 grid gap-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">On hand</dt>
                  <dd className="font-medium tabular-nums">{formatNumber(row.quantity)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">At cost</dt>
                  <dd className="font-medium tabular-nums">{formatAmountValue(row.costValue)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">At retail</dt>
                  <dd className="font-medium tabular-nums">
                    {formatAmountValue(row.retailValue)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Last moved</dt>
                  <dd className="font-medium">
                    {row.lastMovementAt ? safeDistanceToNow(row.lastMovementAt) : "Never"}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        />
      </SectionCard>
    </>
  );
}
