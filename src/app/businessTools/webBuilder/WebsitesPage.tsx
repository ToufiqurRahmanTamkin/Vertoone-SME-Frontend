import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  useDeleteWebSiteMutation,
  useGetWebSiteSummaryQuery,
  useGetWebSitesQuery,
  useUpdateWebSiteMutation,
} from "@/redux/apis/webBuilderApis";
import type { WebSiteListItem } from "@/types/domain/webBuilder";
import { Plus } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SiteFormModal } from "./components/SiteFormModal";
import {
  WebsiteRowActions,
  type WebsiteRowActionHandlers,
} from "./components/WebsiteRowActions";
import { SiteSettingsDialog } from "./components/SiteSettingsDialog";
import { absoluteSiteUrl } from "./webBuilder.utils";
import { websiteColumns } from "./websites.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "isPublished",
    label: "Status",
    type: "select",
    options: [
      { label: "Live", value: "true" },
      { label: "Draft", value: "false" },
    ],
  },
];

export default function WebsitesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/company/business-tools/web-builder");

  const { data, isLoading, isFetching } = useGetWebSitesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isPublished: filters.isPublished === undefined ? undefined : filters.isPublished === "true",
  });

  const { data: summary } = useGetWebSiteSummaryQuery();

  const [updateSite] = useUpdateWebSiteMutation();
  const [deleteSite, { isLoading: isDeleting }] = useDeleteWebSiteMutation();

  const [formOpen, setFormOpen] = React.useState(false);
  const [settingsFor, setSettingsFor] = React.useState<WebSiteListItem | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<WebSiteListItem | null>(null);

  const sites = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.totalSites ?? 0;
  const limit = summary?.siteLimit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const togglePublished = React.useCallback(
    async (site: WebSiteListItem) => {
      try {
        await updateSite({ id: site._id, body: { isPublished: !site.isPublished } }).unwrap();
        toast.success(site.isPublished ? "Website is offline" : "Website is live");
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || "Could not update the website");
      }
    },
    [updateSite]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteSite(pendingDelete._id).unwrap();
      toast.success("Website deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the website");
    }
  };

  const rowActions = React.useMemo<WebsiteRowActionHandlers>(
    () => ({
      onSettings: setSettingsFor,
      onTogglePublished: (site) => void togglePublished(site),
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete, togglePublished]
  );

  const columns = React.useMemo(() => websiteColumns(rowActions), [rowActions]);

  return (
    <>
      <PageHeader
        title="Web Builder"
        description="Every website you have built. Open one to manage its pages, or use the settings icon to change how it looks."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Websites</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Live</StatLabel>
          <StatValue>{summary?.publishedSites ?? 0}</StatValue>
          <StatDescription>Reachable by anyone with the link</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Pages</StatLabel>
          <StatValue>{summary?.totalPages ?? 0}</StatValue>
          <StatDescription>Across every website</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Waiting to publish</StatLabel>
          <StatValue>{summary?.pagesWithUnpublishedChanges ?? 0}</StatValue>
          <StatDescription>Edited since they last went live</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search websites..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New website"
              onClick={() => setFormOpen(true)}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} websites. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} websites your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={sites}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(site) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={`/company/business-tools/web-builder/${site._id}`}
                  className="block truncate text-sm font-semibold hover:underline"
                >
                  {site.name}
                </Link>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">
                  {absoluteSiteUrl(site.publicUrl, site.publicPath)}
                </span>
              </div>
              <StatusBadge
                color={site.isPublished ? "green" : "zinc"}
                label={site.isPublished ? "Live" : "Draft"}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="tabular-nums">
                {site.pageCount} pages
              </Badge>
              <Badge variant="outline" className="tabular-nums">
                {site.publishedPageCount} live
              </Badge>
              {site.pagesWithUnpublishedChanges > 0 && (
                <Badge variant="outline">{site.pagesWithUnpublishedChanges} pending</Badge>
              )}
            </div>

            <div className="mt-3 border-t pt-3">
              <WebsiteRowActions site={site} {...rowActions} />
            </div>
          </div>
        )}
      />

      <SiteFormModal open={formOpen} onOpenChange={setFormOpen} />

      <SiteSettingsDialog
        siteId={settingsFor?._id ?? null}
        onOpenChange={(open) => !open && setSettingsFor(null)}
        canEdit={access.canEdit}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="Every page on this website goes offline straight away. Links pointing at it will 404."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
