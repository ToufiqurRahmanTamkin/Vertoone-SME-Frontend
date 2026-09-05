import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useDeletePriceListItemMutation,
  useDeletePriceListMutation,
  useGetPriceListItemsQuery,
  useGetPriceListOptionsQuery,
  useGetPriceListSummaryQuery,
  useGetPriceListsQuery,
} from "@/redux/apis/priceListApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PRICE_LIST_CHANNELS,
  PRICE_LIST_CHANNEL_LABELS,
  PRICE_LIST_STATUSES,
  PRICE_LIST_STATUS_COLORS,
  PRICE_LIST_STATUS_LABELS,
  PRICE_LIST_TYPES,
  PRICE_LIST_TYPE_LABELS,
  type PriceList,
  type PriceListChannel,
  type PriceListItem,
  type PriceListStatus,
  type PriceListType,
} from "@/types/domain/priceList";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { PriceListFormModal } from "./components/PriceListFormModal";
import { PriceListItemFormModal } from "./components/PriceListItemFormModal";
import {
  PriceListItemRowActions,
  PriceListRowActions,
  priceListColumns,
  priceListItemColumns,
} from "./price-lists.columns";

export default function PriceListsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/products/price-lists");
  const [tab, setTab] = React.useState("lists");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
  const { data: listOptions = [] } = useGetPriceListOptionsQuery();

  const isLists = tab === "lists";

  const {
    data: lists,
    isLoading: isLoadingLists,
    isFetching: isFetchingLists,
  } = useGetPriceListsQuery(
    {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      type: filters.type as PriceListType | undefined,
      channel: filters.channel as PriceListChannel | undefined,
      status: filters.status as PriceListStatus | undefined,
    },
    { skip: !isLists }
  );

  const {
    data: items,
    isLoading: isLoadingItems,
    isFetching: isFetchingItems,
  } = useGetPriceListItemsQuery(
    {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      priceListId: filters.priceListId as string | undefined,
      isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
    },
    { skip: isLists }
  );

  const { data: summary } = useGetPriceListSummaryQuery();

  const [listFormOpen, setListFormOpen] = React.useState(false);
  const [itemFormOpen, setItemFormOpen] = React.useState(false);
  const [editingList, setEditingList] = React.useState<PriceList | null>(null);
  const [editingItem, setEditingItem] = React.useState<PriceListItem | null>(null);
  const [pendingList, setPendingList] = React.useState<PriceList | null>(null);
  const [pendingItem, setPendingItem] = React.useState<PriceListItem | null>(null);

  const [deleteList, { isLoading: isDeletingList }] = useDeletePriceListMutation();
  const [deleteItem, { isLoading: isDeletingItem }] = useDeletePriceListItemMutation();

  const listFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "type",
        label: "Applies to",
        type: "select",
        options: PRICE_LIST_TYPES.map((type) => ({
          label: PRICE_LIST_TYPE_LABELS[type],
          value: type,
        })),
      },
      {
        name: "channel",
        label: "Channel",
        type: "select",
        options: PRICE_LIST_CHANNELS.map((channel) => ({
          label: PRICE_LIST_CHANNEL_LABELS[channel],
          value: channel,
        })),
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: PRICE_LIST_STATUSES.map((status) => ({
          label: PRICE_LIST_STATUS_LABELS[status],
          value: status,
        })),
      },
    ],
    []
  );

  const itemFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "priceListId",
        label: "Price list",
        type: "select",
        options: listOptions.map((list) => ({ label: list.name, value: list._id })),
      },
      {
        name: "isActive",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
    ],
    [listOptions]
  );

  const openPrices = React.useCallback(
    (list: PriceList) => {
      setTab("prices");
      setFilter("priceListId", list._id);
    },
    [setFilter]
  );

  const listRowActions = React.useMemo(
    () => ({
      onEdit: (list: PriceList) => {
        setEditingList(list);
        setListFormOpen(true);
      },
      onDelete: setPendingList,
      onOpenPrices: openPrices,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete, openPrices]
  );

  const itemRowActions = React.useMemo(
    () => ({
      onEdit: (item: PriceListItem) => {
        setEditingItem(item);
        setItemFormOpen(true);
      },
      onDelete: setPendingItem,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const listColumns = React.useMemo(() => priceListColumns(listRowActions), [listRowActions]);
  const itemColumns = React.useMemo(
    () => priceListItemColumns(itemRowActions),
    [itemRowActions]
  );

  const confirmListDelete = async () => {
    if (!pendingList) return;
    try {
      await deleteList(pendingList._id).unwrap();
      toast.success("Price list deleted");
      setPendingList(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the price list");
    }
  };

  const confirmItemDelete = async () => {
    if (!pendingItem) return;
    try {
      await deleteItem(pendingItem._id).unwrap();
      toast.success("Price removed");
      setPendingItem(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the price");
    }
  };

  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;
  const activeMeta = isLists ? lists?.meta : items?.meta;

  return (
    <>
      <PageHeader
        title="Price lists"
        description="Customer, channel and quantity based pricing that overrides the catalogue price."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/products/overview" label="Products overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Price lists</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Running now</StatLabel>
          <StatValue>{formatNumber(summary?.activeCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.scheduledCount ?? 0)} scheduled ·{" "}
            {formatNumber(summary?.expiredCount ?? 0)} ended
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Prices recorded</StatLabel>
          <StatValue>{formatNumber(summary?.itemCount ?? 0)}</StatValue>
          <StatDescription>Across every list</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Products priced</StatLabel>
          <StatValue>{formatNumber(summary?.pricedProductCount ?? 0)}</StatValue>
          <StatDescription>Products with at least one special price</StatDescription>
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
          <TabsTrigger value="lists">Price lists</TabsTrigger>
          <TabsTrigger value="prices">Prices</TabsTrigger>
        </TabsList>

        <TabsContent value="lists" className="mt-4 flex flex-col gap-4">
          <DataTableToolbar
            searchValue={filters.search}
            onSearchChange={(value) => setFilter("search", value)}
            searchPlaceholder="Search price lists..."
            filters={listFilters}
            currentFilters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            isLoading={isFetchingLists}
            actions={
              access.canCreate && (
                <ActionButton
                  icon={Plus}
                  label="New price list"
                  disabled={isLimitReached}
                  title={
                    isLimitReached
                      ? `Your plan allows ${limit} price lists. Delete one or upgrade to add more.`
                      : undefined
                  }
                  onClick={() => {
                    setEditingList(null);
                    setListFormOpen(true);
                  }}
                />
              )
            }
          />

          {isLimitReached && (
            <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
              You have used all {limit} price lists your plan allows. Delete one or upgrade your
              subscription to add more.
            </p>
          )}

          <DataTable
            columns={listColumns}
            data={lists?.data ?? []}
            isLoading={isLoadingLists}
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
            mobileCard={(list) => (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{list.name}</p>
                    <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                      {list.code}
                    </p>
                  </div>
                  <StatusBadge
                    color={PRICE_LIST_STATUS_COLORS[list.status]}
                    label={PRICE_LIST_STATUS_LABELS[list.status]}
                  />
                </div>

                <dl className="mt-3 grid gap-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Applies to</dt>
                    <dd className="font-medium">{PRICE_LIST_TYPE_LABELS[list.type]}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Channel</dt>
                    <dd className="font-medium">{PRICE_LIST_CHANNEL_LABELS[list.channel]}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Runs</dt>
                    <dd className="font-medium">
                      {list.validFrom ? formatDate(list.validFrom) : "Always"}
                      {list.validTo ? ` → ${formatDate(list.validTo)}` : ""}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Prices</dt>
                    <dd className="font-medium tabular-nums">{list.itemCount}</dd>
                  </div>
                </dl>

                <div className="mt-3 border-t pt-3">
                  <PriceListRowActions list={list} {...listRowActions} />
                </div>
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="prices" className="mt-4 flex flex-col gap-4">
          <DataTableToolbar
            searchValue={filters.search}
            onSearchChange={(value) => setFilter("search", value)}
            searchPlaceholder="Search prices by product or SKU..."
            filters={itemFilters}
            currentFilters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            isLoading={isFetchingItems}
            actions={
              access.canCreate && (
                <ActionButton
                  icon={Plus}
                  label="Add price"
                  onClick={() => {
                    setEditingItem(null);
                    setItemFormOpen(true);
                  }}
                />
              )
            }
          />

          <DataTable
            columns={itemColumns}
            data={items?.data ?? []}
            isLoading={isLoadingItems}
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
            mobileCard={(item) => (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{item.name}</p>
                    <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                      {item.sku}
                    </p>
                  </div>
                  <StatusBadge
                    color={item.isActive ? "green" : "zinc"}
                    label={item.isActive ? "Active" : "Inactive"}
                  />
                </div>

                <dl className="mt-3 grid gap-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Price list</dt>
                    <dd className="truncate font-medium">{item.priceList?.name ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">From quantity</dt>
                    <dd className="font-medium tabular-nums">{item.minQuantity}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Price</dt>
                    <dd className="font-medium tabular-nums">{formatAmountValue(item.price)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Against list</dt>
                    <dd className="font-medium tabular-nums">
                      {item.difference > 0 ? "+" : ""}
                      {item.differencePercent}%
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 border-t pt-3">
                  <PriceListItemRowActions item={item} {...itemRowActions} />
                </div>
              </div>
            )}
          />
        </TabsContent>
      </Tabs>

      <PriceListFormModal
        open={listFormOpen}
        onOpenChange={setListFormOpen}
        priceList={editingList}
      />

      <PriceListItemFormModal
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        item={editingItem}
        defaultPriceListId={filters.priceListId as string | undefined}
      />

      <ConfirmDialog
        open={Boolean(pendingList)}
        onOpenChange={(open) => !open && setPendingList(null)}
        title={`Delete "${pendingList?.name ?? ""}"?`}
        description="Every price on this list goes with it. Products keep their catalogue price."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeletingList}
        onConfirm={confirmListDelete}
      />

      <ConfirmDialog
        open={Boolean(pendingItem)}
        onOpenChange={(open) => !open && setPendingItem(null)}
        title={`Remove the price for "${pendingItem?.name ?? ""}"?`}
        description="The product falls back to its catalogue price on this list."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeletingItem}
        onConfirm={confirmItemDelete}
      />
    </>
  );
}
