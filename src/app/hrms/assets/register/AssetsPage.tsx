import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue } from "@/lib/amount";
import {
  useDeleteAssetMutation,
  useGetAssetCategoriesQuery,
  useGetAssetSummaryQuery,
  useGetAssetsQuery,
} from "@/redux/apis/assetApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  ASSET_CONDITIONS,
  ASSET_CONDITION_LABELS,
  ASSET_STATUSES,
  ASSET_STATUS_COLORS,
  ASSET_STATUS_LABELS,
  type Asset,
  type AssetCondition,
  type AssetStatus,
} from "@/types/domain/asset";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AssetRowMenu, assetColumns } from "./assets.columns";
import { AssetFormModal } from "./components/AssetFormModal";
import { AssignAssetModal } from "./components/AssignAssetModal";
import { ReturnAssetModal } from "./components/ReturnAssetModal";

export default function AssetsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/assets/register");
  const assignAccess = useModulePermission("/hrms/assets/assignments");

  const { data, isLoading, isFetching } = useGetAssetsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as AssetStatus | undefined,
    condition: filters.condition as AssetCondition | undefined,
    categoryId: filters.categoryId as string | undefined,
  });

  const { data: summary } = useGetAssetSummaryQuery();
  const { data: categories } = useGetAssetCategoriesQuery({ limit: 100 });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Asset | null>(null);
  const [assigning, setAssigning] = React.useState<Asset | null>(null);
  const [returning, setReturning] = React.useState<Asset | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Asset | null>(null);
  const [deleteAsset, { isLoading: isDeleting }] = useDeleteAssetMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ASSET_STATUSES.map((value) => ({
          label: ASSET_STATUS_LABELS[value],
          value,
        })),
      },
      {
        name: "condition",
        label: "Condition",
        type: "select",
        options: ASSET_CONDITIONS.map((value) => ({
          label: ASSET_CONDITION_LABELS[value],
          value,
        })),
      },
      {
        name: "categoryId",
        label: "Category",
        type: "select",
        options: (categories?.data ?? []).map((row) => ({ label: row.name, value: row._id })),
      },
    ],
    [categories]
  );

  const rowActions = React.useMemo(
    () => ({
      onEdit: (asset: Asset) => {
        setEditing(asset);
        setFormOpen(true);
      },
      onAssign: setAssigning,
      onReturn: setReturning,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canAssign: assignAccess.canCreate,
    }),
    [access.canEdit, access.canDelete, assignAccess.canCreate]
  );

  const columns = React.useMemo(() => assetColumns(rowActions), [rowActions]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteAsset(pendingDelete._id).unwrap();
      toast.success("Asset removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the asset");
    }
  };

  const assets = data?.data ?? [];
  const meta = data?.meta;
  const currency = summary?.currency ?? "BDT";
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Asset register"
        description="Everything the company owns, what it is worth now, and who is holding it."
        actions={
          <>
            <BackLink to="/hrms/assets/overview" label="Assets overview" />
            <CurrencyNote currency={currency} />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Assets</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Worth now</StatLabel>
          <StatValue>{formatAmountValue(summary?.currentValue ?? 0)}</StatValue>
          <StatDescription>
            Bought for {formatAmountValue(summary?.totalValue ?? 0)}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Out with people</StatLabel>
          <StatValue>{summary?.assignedCount ?? 0}</StatValue>
          <StatDescription>{summary?.availableCount ?? 0} still on the shelf</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Warranty ending</StatLabel>
          <StatValue>{summary?.warrantyExpiringCount ?? 0}</StatValue>
          <StatDescription>Within the next 30 days</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search assets..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New asset"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} assets. Remove one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} assets your plan allows. Remove one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={assets}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
        getRowId={(row) => row._id}
        mobileCard={(asset) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{asset.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="font-mono">{asset.assetCode}</span>
                  {asset.category && ` · ${asset.category.name}`}
                </p>
              </div>
              <StatusBadge
                color={ASSET_STATUS_COLORS[asset.status]}
                label={ASSET_STATUS_LABELS[asset.status]}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {ASSET_CONDITION_LABELS[asset.condition]}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {formatAmountValue(asset.currentValue)}
              </Badge>
              {asset.holder && (
                <Badge variant="outline" className="text-[10px]">
                  {asset.holder.name}
                </Badge>
              )}
            </div>

            <div className="mt-3 border-t pt-3">
              <AssetRowMenu asset={asset} actions={rowActions} />
            </div>
          </div>
        )}
      />

      <AssetFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        asset={editing}
        currency={currency}
      />

      <AssignAssetModal
        open={Boolean(assigning)}
        onOpenChange={(open) => !open && setAssigning(null)}
        asset={assigning}
      />

      <ReturnAssetModal
        open={Boolean(returning)}
        onOpenChange={(open) => !open && setReturning(null)}
        asset={returning}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.name ?? ""}"?`}
        description="Its handover history and maintenance jobs go with it."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
