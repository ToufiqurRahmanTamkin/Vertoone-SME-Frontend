import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  useDeleteEmailTemplateMutation,
  useDuplicateEmailTemplateMutation,
  useGetEmailTemplateSummaryQuery,
  useGetEmailTemplatesQuery,
  usePublishEmailTemplateMutation,
  useUnpublishEmailTemplateMutation,
} from "@/redux/apis/emailBuilderApis";
import type {
  EmailTemplateCategory,
  EmailTemplateListItem,
  EmailTemplateStatus,
} from "@/types/domain/emailBuilder";
import { EMAIL_TEMPLATE_CATEGORIES } from "@/types/domain/emailBuilder";
import { History, Plus } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { EmailTemplateFormModal } from "./components/EmailTemplateFormModal";
import {
  EmailTemplateRowActions,
  type EmailTemplateRowActionHandlers,
} from "./components/EmailTemplateRowActions";
import { SendEmailDialog } from "./components/SendEmailDialog";
import { emailTemplateColumns } from "./emailTemplates.columns";
import { titleCase } from "./emailBuilder.utils";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Published", value: "PUBLISHED" },
      { label: "Draft", value: "DRAFT" },
    ],
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: EMAIL_TEMPLATE_CATEGORIES.map((category) => ({
      label: titleCase(category),
      value: category,
    })),
  },
];

export default function EmailTemplatesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/crm/business-tools/email-builder");

  const { data, isLoading, isFetching } = useGetEmailTemplatesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as EmailTemplateStatus | undefined,
    category: filters.category as EmailTemplateCategory | undefined,
  });

  const { data: summary } = useGetEmailTemplateSummaryQuery();

  const [publishTemplate] = usePublishEmailTemplateMutation();
  const [unpublishTemplate] = useUnpublishEmailTemplateMutation();
  const [duplicateTemplate] = useDuplicateEmailTemplateMutation();
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteEmailTemplateMutation();

  const [formOpen, setFormOpen] = React.useState(false);
  const [sendTarget, setSendTarget] = React.useState<EmailTemplateListItem | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<EmailTemplateListItem | null>(null);

  const templates = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.totalTemplates ?? 0;
  const limit = summary?.templateLimit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const run = React.useCallback(
    async (action: Promise<unknown>, success: string, fallback: string) => {
      try {
        await action;
        toast.success(success);
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || fallback);
      }
    },
    []
  );

  const togglePublished = React.useCallback(
    (template: EmailTemplateListItem) =>
      template.status === "PUBLISHED"
        ? run(
            unpublishTemplate(template._id).unwrap(),
            "Email moved back to draft",
            "Could not move the email back to draft"
          )
        : run(
            publishTemplate(template._id).unwrap(),
            "Email published",
            "Could not publish the email"
          ),
    [publishTemplate, unpublishTemplate, run]
  );

  const duplicate = React.useCallback(
    (template: EmailTemplateListItem) =>
      run(
        duplicateTemplate(template._id).unwrap(),
        "Email duplicated",
        "Could not duplicate the email"
      ),
    [duplicateTemplate, run]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    await run(
      deleteTemplate(pendingDelete._id).unwrap(),
      "Email deleted",
      "Could not delete the email"
    );
    setPendingDelete(null);
  };

  const rowActions = React.useMemo<EmailTemplateRowActionHandlers>(
    () => ({
      onSend: setSendTarget,
      onTogglePublished: (template) => void togglePublished(template),
      onDuplicate: (template) => void duplicate(template),
      onDelete: setPendingDelete,
      canCreate: access.canCreate,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canCreate, access.canEdit, access.canDelete, togglePublished, duplicate]
  );

  const columns = React.useMemo(() => emailTemplateColumns(rowActions), [rowActions]);

  return (
    <>
      <PageHeader
        title="Email Builder"
        description="Build an email by dragging blocks into place, publish it, then send it to anyone in your records or any address you type in."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Emails</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Published</StatLabel>
          <StatValue>{summary?.publishedTemplates ?? 0}</StatValue>
          <StatDescription>Ready to send right now</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Delivered</StatLabel>
          <StatValue>{summary?.emailsSent ?? 0}</StatValue>
          <StatDescription>{summary?.emailsSentThisMonth ?? 0} since the 1st</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Failed</StatLabel>
          <StatValue>{summary?.emailsFailed ?? 0}</StatValue>
          <StatDescription>Bounced or rejected on send</StatDescription>
        </Stat>
      </StatGrid>

      {summary && !summary.isMailConfigured && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          No SMTP server is configured on this deployment. You can still build and preview emails —
          sends are recorded in your history but will not reach anyone until mail is set up.
        </p>
      )}

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search emails..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/crm/business-tools/email-builder/deliveries">
                <History className="size-4" />
                Sent history
              </Link>
            </Button>
            {access.canCreate && (
              <ActionButton
                icon={Plus}
                label="New email"
                onClick={() => setFormOpen(true)}
                disabled={isLimitReached}
                title={
                  isLimitReached
                    ? `Your plan allows ${limit} emails. Delete one or upgrade to add more.`
                    : undefined
                }
              />
            )}
          </>
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} emails your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={templates}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(template) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={`/crm/business-tools/email-builder/${template._id}`}
                  className="block truncate text-sm font-semibold hover:underline"
                >
                  {template.name}
                </Link>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {template.subject || "No subject line yet"}
                </span>
              </div>
              <StatusBadge
                color={template.status === "PUBLISHED" ? "green" : "zinc"}
                label={template.status === "PUBLISHED" ? "Published" : "Draft"}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary">{titleCase(template.category)}</Badge>
              <Badge variant="outline" className="tabular-nums">
                {template.blockCount} blocks
              </Badge>
              <Badge variant="outline" className="tabular-nums">
                {template.sentCount} sent
              </Badge>
            </div>

            <div className="mt-3 border-t pt-3">
              <EmailTemplateRowActions template={template} {...rowActions} />
            </div>
          </div>
        )}
      />

      <EmailTemplateFormModal open={formOpen} onOpenChange={setFormOpen} />

      <SendEmailDialog
        template={sendTarget}
        onOpenChange={(open) => !open && setSendTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The template is removed from your builder. Emails already sent from it stay in your history."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
