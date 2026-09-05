import { ActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue } from "@/lib/amount";
import { useGetContactTypeOptionsQuery } from "@/redux/apis/contactTypeApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import {
  useDeletePipelineMutation,
  useGetPipelineSummaryQuery,
  useGetPipelinesQuery,
} from "@/redux/apis/pipelineApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { PipelineWithStats } from "@/types/domain/pipeline";
import { Plus, Star } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PipelineFormModal } from "./components/PipelineFormModal";
import { formatMoney } from "./pipeline.helpers";
import { PipelineRowActions, pipelineColumns } from "./pipelines.columns";

export default function PipelinesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/crm/pipelines");
  const navigate = useNavigate();

  const { data: contactTypeOptions = [] } = useGetContactTypeOptionsQuery();
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: systemConfig } = useGetPublicSystemConfigQuery();

  const { data, isLoading, isFetching } = useGetPipelinesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
    contactTypeId: filters.contactTypeId as string | undefined,
    ownerId: filters.ownerId as string | undefined,
  });

  const { data: summary } = useGetPipelineSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PipelineWithStats | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<PipelineWithStats | null>(null);
  const [deletePipeline, { isLoading: isDeleting }] = useDeletePipelineMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "contactTypeId",
        label: "Contact type",
        type: "select",
        options: contactTypeOptions.map((type) => ({ label: type.name, value: type._id })),
      },
      {
        name: "ownerId",
        label: "Owner",
        type: "select",
        options: employeeOptions.map((employee) => ({
          label: employee.name,
          value: employee._id,
        })),
      },
      {
        name: "isActive",
        label: "Availability",
        type: "select",
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
    ],
    [contactTypeOptions, employeeOptions]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (pipeline: PipelineWithStats) => {
    setEditing(pipeline);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deletePipeline(pendingDelete._id).unwrap();
      toast.success("Pipeline deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the pipeline");
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: openEdit,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => pipelineColumns(rowActions), [rowActions]);

  const pipelines = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Pipelines"
        description="The stages a deal moves through, from first contact to close. Open one to work its board."
        actions={<CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Pipelines</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Deals</StatLabel>
          <StatValue>{summary?.dealCount ?? 0}</StatValue>
          <StatDescription>Sitting on a stage right now</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Open value</StatLabel>
          <StatValue>{formatAmountValue(summary?.openValue)}</StatValue>
          <StatDescription>Still in play across every pipeline</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Won value</StatLabel>
          <StatValue>{formatAmountValue(summary?.wonValue)}</StatValue>
          <StatDescription>Closed and won to date</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search pipelines..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New pipeline"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} pipelines. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} pipelines your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={pipelines}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        onRowClick={(pipeline) => navigate(`/crm/pipelines/${pipeline._id}`)}
        mobileCard={(pipeline) => (
          <div
            role="button"
            tabIndex={0}
            className="cursor-pointer rounded-xl border bg-card p-4 text-left"
            onClick={() => navigate(`/crm/pipelines/${pipeline._id}`)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              navigate(`/crm/pipelines/${pipeline._id}`);
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: pipeline.color }}
                  aria-hidden
                />
                <p className="truncate font-semibold">{pipeline.name}</p>
                {pipeline.isDefault && (
                  <Star
                    className="size-3.5 shrink-0 fill-amber-400 text-amber-500"
                    aria-label="Default"
                  />
                )}
              </div>
              <StatusBadge
                color={pipeline.isActive ? "green" : "zinc"}
                label={pipeline.isActive ? "Active" : "Inactive"}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Stages</dt>
                <dd className="font-medium">{pipeline.stages.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Deals</dt>
                <dd className="font-medium">{pipeline.dealCount}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Open value</dt>
                <dd className="font-medium">
                  {formatMoney(pipeline.openValue, pipeline.currency)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Owner</dt>
                <dd className="truncate font-medium">{pipeline.owner?.name || "Unassigned"}</dd>
              </div>
            </dl>

            {pipeline.contactType && (
              <div className="mt-3">
                <ColorChip
                  color={pipeline.contactType.color}
                  label={pipeline.contactType.name}
                />
              </div>
            )}

            <div className="mt-3 border-t pt-3" onClick={(event) => event.stopPropagation()}>
              <PipelineRowActions pipeline={pipeline} {...rowActions} />
            </div>
          </div>
        )}
      />

      <PipelineFormModal open={formOpen} onOpenChange={setFormOpen} pipeline={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="Its cards and their activity history go with it. The contacts themselves are kept."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
