import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useDeletePromotionMutation,
  useGetPromotionSummaryQuery,
  useGetPromotionsQuery,
} from "@/redux/apis/promotionApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PROMOTION_SCOPES,
  PROMOTION_SCOPE_LABELS,
  PROMOTION_STATUSES,
  PROMOTION_STATUS_COLORS,
  PROMOTION_STATUS_LABELS,
  PROMOTION_TYPES,
  PROMOTION_TYPE_LABELS,
  type Promotion,
  type PromotionScope,
  type PromotionStatus,
  type PromotionType,
} from "@/types/domain/promotion";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { PromotionFormModal } from "./components/PromotionFormModal";
import { PromotionRowActions, promotionColumns, rewardLabel } from "./promotions.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: PROMOTION_STATUSES.map((status) => ({
      label: PROMOTION_STATUS_LABELS[status],
      value: status,
    })),
  },
  {
    name: "type",
    label: "Offer",
    type: "select",
    options: PROMOTION_TYPES.map((type) => ({
      label: PROMOTION_TYPE_LABELS[type],
      value: type,
    })),
  },
  {
    name: "appliesTo",
    label: "Covers",
    type: "select",
    options: PROMOTION_SCOPES.map((scope) => ({
      label: PROMOTION_SCOPE_LABELS[scope],
      value: scope,
    })),
  },
  {
    name: "channel",
    label: "Channel",
    type: "select",
    options: [
      { label: "Point of Sale", value: "pos" },
      { label: "Online shop", value: "shop" },
    ],
  },
];

export default function PromotionsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/products/promotions");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();

  const { data, isLoading, isFetching } = useGetPromotionsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as PromotionStatus | undefined,
    type: filters.type as PromotionType | undefined,
    appliesTo: filters.appliesTo as PromotionScope | undefined,
    channel: filters.channel as "pos" | "shop" | undefined,
  });

  const { data: summary } = useGetPromotionSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Promotion | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Promotion | null>(null);
  const [deletePromotion, { isLoading: isDeleting }] = useDeletePromotionMutation();

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deletePromotion(pendingDelete._id).unwrap();
      toast.success("Promotion deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the promotion");
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: (promotion: Promotion) => {
        setEditing(promotion);
        setFormOpen(true);
      },
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => promotionColumns(rowActions), [rowActions]);

  const promotions = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Promotions & discounts"
        description="Time-boxed offers, coupon codes and the rules that decide when they apply."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/products/overview" label="Products overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Promotions</StatLabel>
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
          <StatLabel>Coupon codes</StatLabel>
          <StatValue>{formatNumber(summary?.couponCount ?? 0)}</StatValue>
          <StatDescription>The rest apply automatically</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Redemptions</StatLabel>
          <StatValue>{formatNumber(summary?.redemptionCount ?? 0)}</StatValue>
          <StatDescription>Times an offer has been used</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search promotions or coupon codes..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New promotion"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} promotions. Delete one or upgrade to add more.`
                  : undefined
              }
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} promotions your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={promotions}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(promotion) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{promotion.name}</p>
                <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                  {promotion.couponCode || "Automatic"}
                </p>
              </div>
              <StatusBadge
                color={PROMOTION_STATUS_COLORS[promotion.status]}
                label={PROMOTION_STATUS_LABELS[promotion.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Offer</dt>
                <dd className="font-medium">{rewardLabel(promotion)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Covers</dt>
                <dd className="font-medium">{PROMOTION_SCOPE_LABELS[promotion.appliesTo]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Runs</dt>
                <dd className="font-medium">
                  {formatDate(promotion.startsAt)}
                  {promotion.endsAt ? ` → ${formatDate(promotion.endsAt)}` : ""}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Used</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(promotion.usageCount)}
                  {promotion.usageLimit === null
                    ? ""
                    : ` / ${formatNumber(promotion.usageLimit)}`}
                </dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <PromotionRowActions promotion={promotion} {...rowActions} />
            </div>
          </div>
        )}
      />

      <PromotionFormModal open={formOpen} onOpenChange={setFormOpen} promotion={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The offer stops applying straight away. Past orders keep the discount they were given."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
