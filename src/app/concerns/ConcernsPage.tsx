import { ActionButton, CardActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useDeleteConcernMutation, useGetConcernsQuery, useGetConcernSummaryQuery } from "@/redux/apis/concernApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { grantedMenuCount, type Concern } from "@/types/domain/concern";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ConcernFormModal, type ConcernFormStepId } from "./components/ConcernFormModal";
import { concernColumns } from "./concerns.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "isActive",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
];

const describeAllowance = (used: number, limit: number | null): string =>
  limit === null
    ? `${used} in use · unlimited on your plan`
    : `${used} of ${limit} allowed by your plan`;

export default function ConcernsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/settings/company/concerns");

  const { data, isLoading, isFetching } = useGetConcernsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });
  const { data: summary } = useGetConcernSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [formStep, setFormStep] = React.useState<ConcernFormStepId>("details");
  const [editing, setEditing] = React.useState<Concern | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Concern | null>(null);
  const [removeConcern, { isLoading: isDeleting }] = useDeleteConcernMutation();

  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const openCreate = () => {
    setEditing(null);
    setFormStep("details");
    setFormOpen(true);
  };

  const openEdit = (concern: Concern) => {
    setEditing(concern);
    setFormStep("details");
    setFormOpen(true);
  };

  const openHead = (concern: Concern) => {
    setEditing(concern);
    setFormStep("head");
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await removeConcern(pendingDelete._id).unwrap();
      toast.success("Concern removed");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the concern");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () =>
      concernColumns({
        onEdit: openEdit,
        onManageHead: openHead,
        onDelete: setPendingDelete,
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const concerns = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Concerns"
        description="The businesses running under your company, each with a head who signs in to manage it."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Concerns</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>{describeAllowance(used, limit)}</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Trading right now</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Heads who can sign in</StatLabel>
          <StatValue>{summary?.activeHeadCount ?? 0}</StatValue>
          <StatDescription>
            {summary?.headCount ?? 0} head account{(summary?.headCount ?? 0) === 1 ? "" : "s"} in
            total
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search concerns..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="Add concern"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} concerns. Remove one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} concerns allowed on your plan. Remove one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={concerns}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(concern) => (
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground">{concern.address || "No address on record"}</p>
            {concern.website && <p className="text-muted-foreground">{concern.website}</p>}
            {concern.notes && <p>{concern.notes}</p>}
          </div>
        )}
        mobileCard={(concern) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{concern.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {concern.head?.email ?? "No head account yet"}
                </p>
              </div>
              {concern.isActive ? (
                <StatusBadge color="green" label="Active" />
              ) : (
                <StatusBadge color="zinc" label="Inactive" />
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {concern.industry || "Industry not set"} · {concern.code}
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-[10px]">
                {grantedMenuCount(concern.head)} menus
              </Badge>
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <CardActionButton
                icon={KeyRound}
                label="Head"
                onClick={() => openHead(concern)}
                disabled={!access.canEdit || !concern.head}
              />
              <CardActionButton
                icon={Pencil}
                label="Edit"
                onClick={() => openEdit(concern)}
                disabled={!access.canEdit}
              />
              <CardActionButton
                icon={Trash2}
                label="Remove"
                className="text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(concern)}
                disabled={!access.canDelete}
              />
            </div>
          </div>
        )}
      />

      <ConcernFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        concern={editing}
        initialStep={formStep}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.name ?? ""}"?`}
        description="The concern and its head's sign-in are both removed, and the head is signed out immediately."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
