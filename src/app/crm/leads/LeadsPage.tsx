import { ActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatDate } from "@/lib/date";
import {
  useDeleteLeadMutation,
  useGetLeadSummaryQuery,
  useGetLeadsQuery,
} from "@/redux/apis/leadApis";
import { useGetLeadSourceOptionsQuery } from "@/redux/apis/leadSourceApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  LEAD_PRIORITIES,
  LEAD_PRIORITY_COLORS,
  LEAD_PRIORITY_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
  type Lead,
  type LeadPriority,
  type LeadStatus,
} from "@/types/domain/lead";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ConvertLeadDialog } from "./components/ConvertLeadDialog";
import { LeadFormModal } from "./components/LeadFormModal";
import { LeadRowActions, leadColumns } from "./leads.columns";

export default function LeadsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/crm/leads");
  const contactAccess = useModulePermission("/crm/contacts");
  const dealAccess = useModulePermission("/crm/deals");

  const { data: leadSourceOptions = [] } = useGetLeadSourceOptionsQuery();

  const { data, isLoading, isFetching } = useGetLeadsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
    status: filters.status as LeadStatus | undefined,
    priority: filters.priority as LeadPriority | undefined,
    leadSourceId: filters.leadSourceId as string | undefined,
  });

  const { data: summary } = useGetLeadSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Lead | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Lead | null>(null);
  const [pendingConvert, setPendingConvert] = React.useState<Lead | null>(null);
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();

  const canConvert = access.canEdit && contactAccess.canCreate;

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: LEAD_STATUSES.map((status) => ({
          label: LEAD_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        options: LEAD_PRIORITIES.map((priority) => ({
          label: LEAD_PRIORITY_LABELS[priority],
          value: priority,
        })),
      },
      {
        name: "leadSourceId",
        label: "Source",
        type: "select",
        options: leadSourceOptions.map((source) => ({ label: source.name, value: source._id })),
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
    [leadSourceOptions]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteLead(pendingDelete._id).unwrap();
      toast.success("Lead deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the lead");
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: openEdit,
      onDelete: setPendingDelete,
      onConvert: setPendingConvert,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canConvert,
    }),
    [access.canEdit, access.canDelete, canConvert]
  );

  const columns = React.useMemo(() => leadColumns(rowActions), [rowActions]);

  const leads = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Leads"
        description="Unqualified interest captured from every channel, with what it is worth and who is chasing it."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Leads</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Open</StatLabel>
          <StatValue>{summary?.openCount ?? 0}</StatValue>
          <StatDescription>Still being worked, not yet won or lost</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Pipeline value</StatLabel>
          <StatValue>{(summary?.pipelineValue ?? 0).toLocaleString()}</StatValue>
          <StatDescription>Estimated value of every open lead</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Won</StatLabel>
          <StatValue>{summary?.wonCount ?? 0}</StatValue>
          <StatDescription>
            {(summary?.wonValue ?? 0).toLocaleString()} in closed value
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search leads..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New lead"
              onClick={openCreate}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} leads. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} leads your plan allows. Delete one or upgrade your subscription
          to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={leads}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(lead) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{lead.title}</p>
                <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                  {lead.code}
                </p>
              </div>
              <StatusBadge
                color={LEAD_STATUS_COLORS[lead.status]}
                label={LEAD_STATUS_LABELS[lead.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Person</dt>
                <dd className="truncate font-medium">{lead.name || lead.companyName || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Value</dt>
                <dd className="font-medium tabular-nums">
                  {lead.estimatedValue ? lead.estimatedValue.toLocaleString() : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Expected close</dt>
                <dd className="font-medium">{formatDate(lead.expectedCloseDate)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Owner</dt>
                <dd className="truncate font-medium">{lead.owner?.name || "Unassigned"}</dd>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge
                color={LEAD_PRIORITY_COLORS[lead.priority]}
                label={LEAD_PRIORITY_LABELS[lead.priority]}
              />
              {lead.leadSource && (
                <ColorChip color={lead.leadSource.color} label={lead.leadSource.name} />
              )}
              <TagList tags={lead.tags} emptyLabel="" />
            </div>

            <div className="mt-3 border-t pt-3">
              <LeadRowActions lead={lead} {...rowActions} />
            </div>
          </div>
        )}
      />

      <LeadFormModal open={formOpen} onOpenChange={setFormOpen} lead={editing} />

      <ConvertLeadDialog
        lead={pendingConvert}
        open={Boolean(pendingConvert)}
        onOpenChange={(open) => !open && setPendingConvert(null)}
        canCreateDeal={dealAccess.canCreate}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="The lead drops off your pipeline. Any contact it was converted into is kept."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
