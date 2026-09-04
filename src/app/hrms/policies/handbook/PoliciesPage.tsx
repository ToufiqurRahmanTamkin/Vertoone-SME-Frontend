import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeletePolicyMutation,
  useGetPoliciesQuery,
  useGetPolicySummaryQuery,
  usePublishPolicyMutation,
} from "@/redux/apis/policyApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  POLICY_CATEGORIES,
  POLICY_CATEGORY_LABELS,
  POLICY_STATUSES,
  POLICY_STATUS_COLORS,
  POLICY_STATUS_LABELS,
  type Policy,
  type PolicyCategory,
  type PolicyStatus,
} from "@/types/domain/policy";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Plus, Send, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { PolicyFormModal } from "./components/PolicyFormModal";
import { PolicyViewModal } from "./components/PolicyViewModal";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: POLICY_STATUSES.map((value) => ({ label: POLICY_STATUS_LABELS[value], value })),
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: POLICY_CATEGORIES.map((value) => ({ label: POLICY_CATEGORY_LABELS[value], value })),
  },
  {
    name: "reviewDueOnly",
    label: "Review",
    type: "select",
    options: [{ label: "Due for review", value: "true" }],
  },
];

const formatDay = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function PoliciesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/hrms/policies/handbook");

  const { data, isLoading, isFetching } = useGetPoliciesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as PolicyStatus | undefined,
    category: filters.category as PolicyCategory | undefined,
    reviewDueOnly: filters.reviewDueOnly === "true" ? true : undefined,
  });

  const { data: summary } = useGetPolicySummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Policy | null>(null);
  const [viewing, setViewing] = React.useState<Policy | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Policy | null>(null);
  const [pendingPublish, setPendingPublish] = React.useState<Policy | null>(null);

  const [deletePolicy, { isLoading: isDeleting }] = useDeletePolicyMutation();
  const [publishPolicy, { isLoading: isPublishing }] = usePublishPolicyMutation();

  const onEdit = React.useCallback((policy: Policy) => {
    setEditing(policy);
    setFormOpen(true);
  }, []);

  const rowMenu = React.useCallback(
    (policy: Policy) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 cursor-pointer"
              aria-label={`More actions for ${policy.title}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setViewing(policy)}>
              <Eye className="size-4" />
              Read it
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!access.canEdit} onSelect={() => onEdit(policy)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!access.canEdit}
              onSelect={() => setPendingPublish(policy)}
            >
              <Send className="size-4" />
              {policy.status === "PUBLISHED" ? "Publish a new version" : "Publish"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={!access.canDelete}
              onSelect={() => setPendingDelete(policy)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    [access.canEdit, access.canDelete, onEdit]
  );

  const columns = React.useMemo<ColumnDef<Policy>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Policy",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              <span className="font-mono">{row.original.code}</span> · v{row.original.version}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-[10px]">
            {POLICY_CATEGORY_LABELS[row.original.category]}
          </Badge>
        ),
      },
      {
        accessorKey: "audienceLabel",
        header: "Applies to",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.audienceLabel}</span>
        ),
      },
      {
        accessorKey: "acknowledgementRate",
        header: "Acknowledged",
        cell: ({ row }) =>
          row.original.requiresAcknowledgement ? (
            <div className="w-28 space-y-1">
              <Progress value={row.original.acknowledgementRate} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {row.original.acknowledgedCount} of {row.original.audienceCount}
              </p>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Not asked for</span>
          ),
      },
      {
        accessorKey: "reviewDueAt",
        header: "Review by",
        cell: ({ row }) => (
          <span
            className={
              row.original.isReviewDue
                ? "text-sm font-medium text-red-600 dark:text-red-400"
                : row.original.isReviewDueSoon
                  ? "text-sm font-medium text-amber-600 dark:text-amber-400"
                  : "text-sm text-muted-foreground"
            }
          >
            {formatDay(row.original.reviewDueAt)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            color={POLICY_STATUS_COLORS[row.original.status]}
            label={POLICY_STATUS_LABELS[row.original.status]}
          />
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => rowMenu(row.original),
      },
    ],
    [rowMenu]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deletePolicy(pendingDelete._id).unwrap();
      toast.success("Policy removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the policy");
    }
  };

  const confirmPublish = async () => {
    if (!pendingPublish) return;
    try {
      await publishPolicy({ id: pendingPublish._id, body: {} }).unwrap();
      toast.success("Policy published");
      setPendingPublish(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not publish the policy");
    }
  };

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Policies & handbook"
        description="The rules everyone works to, who they apply to, and who has confirmed reading them."
        actions={<BackLink to="/hrms/policies/overview" label="Policies overview" />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Published</StatLabel>
          <StatValue>{summary?.publishedCount ?? 0}</StatValue>
          <StatDescription>{summary?.draftCount ?? 0} still in draft</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Acknowledgement</StatLabel>
          <StatValue>{summary?.acknowledgementRate ?? 0}%</StatValue>
          <StatDescription>
            Across {summary?.needsAcknowledgementCount ?? 0} policies that ask for it
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Due for review</StatLabel>
          <StatValue>{summary?.reviewDueCount ?? 0}</StatValue>
          <StatDescription>Past their review date</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Waiting on you</StatLabel>
          <StatValue>{summary?.pendingForMe ?? 0}</StatValue>
          <StatDescription>Policies you have not acknowledged</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search policies..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New policy"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} policies. Remove one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} policies your plan allows. Remove one or upgrade your
          subscription to add more.
        </p>
      )}

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
        onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
        getRowId={(row) => row._id}
        mobileCard={(policy) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{policy.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="font-mono">{policy.code}</span> · v{policy.version}
                </p>
              </div>
              <StatusBadge
                color={POLICY_STATUS_COLORS[policy.status]}
                label={POLICY_STATUS_LABELS[policy.status]}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {POLICY_CATEGORY_LABELS[policy.category]}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {policy.audienceLabel}
              </Badge>
              {policy.requiresAcknowledgement && (
                <Badge variant="outline" className="text-[10px]">
                  {policy.acknowledgementRate}% acknowledged
                </Badge>
              )}
            </div>

            <div className="mt-3 border-t pt-3">{rowMenu(policy)}</div>
          </div>
        )}
      />

      <PolicyFormModal open={formOpen} onOpenChange={setFormOpen} policy={editing} />

      <PolicyViewModal
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
        policy={viewing}
      />

      <ConfirmDialog
        open={Boolean(pendingPublish)}
        onOpenChange={(open) => !open && setPendingPublish(null)}
        title={`Publish "${pendingPublish?.title ?? ""}"?`}
        description={
          pendingPublish?.status === "PUBLISHED"
            ? "The current text is filed as a version and everyone is asked to acknowledge the new one."
            : "Everyone it applies to will see it, and can acknowledge it."
        }
        confirmText="Publish"
        isLoading={isPublishing}
        onConfirm={confirmPublish}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove "${pendingDelete?.title ?? ""}"?`}
        description="Its version history and every acknowledgement go with it."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
