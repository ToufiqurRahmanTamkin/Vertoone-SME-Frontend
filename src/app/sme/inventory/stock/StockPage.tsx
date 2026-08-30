import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetProductCategoryOptionsQuery } from "@/redux/apis/productCategoryApis";
import {
  useGetStockMovementsQuery,
  useGetStockQuery,
  useGetStockSummaryQuery,
} from "@/redux/apis/stockApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import {
  STOCK_STATUSES,
  STOCK_STATUS_LABELS,
  type StockRow,
  type StockStatus,
} from "@/types/domain/stock";
import {
  STOCK_DIRECTIONS,
  STOCK_DIRECTION_LABELS,
  STOCK_REFERENCE_LABELS,
  STOCK_REFERENCE_TYPES,
  type StockDirection,
  type StockReferenceType,
} from "@/types/domain/trade";
import * as React from "react";
import { StockBreakdownDialog } from "./components/StockBreakdownDialog";
import { stockColumns, stockMovementColumns } from "./stock.columns";

export default function StockPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const [tab, setTab] = React.useState("levels");
  const [inspecting, setInspecting] = React.useState<StockRow | null>(null);

  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();
  const { data: categoryOptions = [] } = useGetProductCategoryOptionsQuery();

  const levelFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: STOCK_STATUSES.map((status) => ({
          label: STOCK_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "warehouseId",
        label: "Warehouse",
        type: "select",
        options: warehouseOptions.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse._id,
        })),
      },
      {
        name: "categoryId",
        label: "Category",
        type: "select",
        options: categoryOptions.map((category) => ({
          label: category.name,
          value: category._id,
        })),
      },
    ],
    [warehouseOptions, categoryOptions]
  );

  const movementFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "direction",
        label: "Direction",
        type: "select",
        options: STOCK_DIRECTIONS.map((direction) => ({
          label: STOCK_DIRECTION_LABELS[direction],
          value: direction,
        })),
      },
      {
        name: "refType",
        label: "Source",
        type: "select",
        options: STOCK_REFERENCE_TYPES.map((refType) => ({
          label: STOCK_REFERENCE_LABELS[refType],
          value: refType,
        })),
      },
      {
        name: "warehouseId",
        label: "Warehouse",
        type: "select",
        options: warehouseOptions.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse._id,
        })),
      },
    ],
    [warehouseOptions]
  );

  const isLevels = tab === "levels";

  const {
    data: levels,
    isLoading: isLoadingLevels,
    isFetching: isFetchingLevels,
  } = useGetStockQuery(
    {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      status: filters.status as StockStatus | undefined,
      warehouseId: filters.warehouseId as string | undefined,
      categoryId: filters.categoryId as string | undefined,
    },
    { skip: !isLevels }
  );

  const {
    data: movements,
    isLoading: isLoadingMovements,
    isFetching: isFetchingMovements,
  } = useGetStockMovementsQuery(
    {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      direction: filters.direction as StockDirection | undefined,
      refType: filters.refType as StockReferenceType | undefined,
      warehouseId: filters.warehouseId as string | undefined,
    },
    { skip: isLevels }
  );

  const { data: summary } = useGetStockSummaryQuery();

  const levelColumns = React.useMemo(
    () => stockColumns({ onInspect: setInspecting }),
    []
  );
  const movementColumns = React.useMemo(() => stockMovementColumns(), []);

  const activeMeta = isLevels ? levels?.meta : movements?.meta;

  return (
    <>
      <PageHeader
        title="Stock overview"
        description="Live quantity on hand across every warehouse, and the ledger behind it."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Stock value</StatLabel>
          <StatValue>{formatAmount(summary?.stockValue ?? 0)}</StatValue>
          <StatDescription>
            At average cost across {summary?.warehouseCount ?? 0} warehouse
            {summary?.warehouseCount === 1 ? "" : "s"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Tracked products</StatLabel>
          <StatValue>{formatNumber(summary?.trackedProducts ?? 0)}</StatValue>
          <StatDescription>{summary?.inStockCount ?? 0} sitting comfortably</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Running low</StatLabel>
          <StatValue>{formatNumber(summary?.lowStockCount ?? 0)}</StatValue>
          <StatDescription>At or below their low stock alert</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Out of stock</StatLabel>
          <StatValue>{formatNumber(summary?.outOfStockCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.reservedQuantity ?? 0)} units reserved on open orders
          </StatDescription>
        </Stat>
      </StatGrid>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value);
          clearFilters();
        }}
      >
        <TabsList>
          <TabsTrigger value="levels">Stock on hand</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="mt-4 flex flex-col gap-4">
          <DataTableToolbar
            searchValue={filters.search}
            onSearchChange={(value) => setFilter("search", value)}
            searchPlaceholder="Search by product, SKU or barcode..."
            filters={levelFilters}
            currentFilters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            isLoading={isFetchingLevels}
          />

          <DataTable
            columns={levelColumns}
            data={levels?.data ?? []}
            isLoading={isLoadingLevels}
            pagination={
              activeMeta
                ? {
                    page: activeMeta.page,
                    limit: activeMeta.limit,
                    total: activeMeta.total,
                    pages: activeMeta.totalPages,
                  }
                : undefined
            }
            onPageChange={(page) => setFilter("page", page)}
            onLimitChange={(limit) => setFilter("limit", limit)}
            getRowId={(row) => row.productId}
            mobileCard={(row) => (
              <button
                type="button"
                className="w-full rounded-xl border bg-card p-4 text-left"
                onClick={() => setInspecting(row)}
              >
                <p className="truncate font-semibold">{row.product?.name ?? "—"}</p>
                <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                  {row.product?.sku ?? ""}
                </p>
                <dl className="mt-3 grid gap-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">On hand</dt>
                    <dd className="font-medium tabular-nums">{formatNumber(row.quantity)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Free to sell</dt>
                    <dd className="font-medium tabular-nums">
                      {formatNumber(row.availableQuantity)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Value</dt>
                    <dd className="font-medium tabular-nums">{formatAmount(row.stockValue)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="font-medium">{STOCK_STATUS_LABELS[row.status]}</dd>
                  </div>
                </dl>
              </button>
            )}
          />
        </TabsContent>

        <TabsContent value="movements" className="mt-4 flex flex-col gap-4">
          <DataTableToolbar
            searchValue={filters.search}
            onSearchChange={(value) => setFilter("search", value)}
            searchPlaceholder="Search by document number..."
            filters={movementFilters}
            currentFilters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            isLoading={isFetchingMovements}
          />

          <DataTable
            columns={movementColumns}
            data={movements?.data ?? []}
            isLoading={isLoadingMovements}
            pagination={
              activeMeta
                ? {
                    page: activeMeta.page,
                    limit: activeMeta.limit,
                    total: activeMeta.total,
                    pages: activeMeta.totalPages,
                  }
                : undefined
            }
            onPageChange={(page) => setFilter("page", page)}
            onLimitChange={(limit) => setFilter("limit", limit)}
            getRowId={(row) => row._id}
            mobileCard={(movement) => (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{movement.product?.name ?? "—"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {STOCK_REFERENCE_LABELS[movement.refType]} · {movement.refNumber || "—"}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">
                    {movement.direction === "IN" ? "+" : "−"}
                    {formatNumber(movement.quantity)}
                  </span>
                </div>
                <dl className="mt-3 grid gap-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Warehouse</dt>
                    <dd className="font-medium">{movement.warehouse?.name ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">When</dt>
                    <dd className="font-medium">{formatDate(movement.occurredAt)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Value</dt>
                    <dd className="font-medium tabular-nums">{formatAmount(movement.value)}</dd>
                  </div>
                </dl>
              </div>
            )}
          />
        </TabsContent>
      </Tabs>

      <StockBreakdownDialog
        row={inspecting}
        onOpenChange={(open) => !open && setInspecting(null)}
      />
    </>
  );
}
