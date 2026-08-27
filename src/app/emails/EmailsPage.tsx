import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatGrid, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";
import {
  EMAIL_STATUS_COLORS,
  EMAIL_STATUS_LABELS,
  EMAIL_TEMPLATE_LABELS,
  toOptions,
} from "@/constant";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatNumber } from "@/lib/amount";
import { formatDateTime, safeDistanceToNow } from "@/lib/date";
import { useGetEmailSummaryQuery, useGetEmailsQuery } from "@/redux/apis/emailApis";
import type { EmailStatus, EmailTemplateKey } from "@/types/domain/email";
import { CircleCheck, CircleSlash, Mail, TriangleAlert } from "lucide-react";
import * as React from "react";
import { EmailPreviewModal } from "./components/EmailPreviewModal";
import { emailColumns } from "./emails.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "template",
    label: "Template",
    type: "select",
    options: toOptions(EMAIL_TEMPLATE_LABELS),
    triggerClassName: "sm:w-52",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: toOptions(EMAIL_STATUS_LABELS),
  },
  { name: "from", label: "Sent from", type: "date" },
  { name: "to", label: "Sent to", type: "date" },
];

export default function EmailsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const [previewId, setPreviewId] = React.useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetEmailsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    template: filters.template as EmailTemplateKey | undefined,
    status: filters.status as EmailStatus | undefined,
    from: filters.from as string | undefined,
    to: filters.to as string | undefined,
  });
  const { data: summary, isLoading: isSummaryLoading } = useGetEmailSummaryQuery();

  const columns = React.useMemo(
    () => emailColumns({ onPreview: (email) => setPreviewId(email._id) }),
    []
  );

  const emails = data?.data ?? [];
  const meta = data?.meta;

  const stats = [
    {
      label: "Total emails",
      value: formatNumber(summary?.total),
      icon: Mail,
      color: "default" as const,
    },
    {
      label: "Delivered",
      value: formatNumber(summary?.sent),
      icon: CircleCheck,
      color: "success" as const,
    },
    {
      label: "Failed",
      value: formatNumber(summary?.failed),
      icon: TriangleAlert,
      color: "error" as const,
    },
    {
      label: "Skipped",
      value: formatNumber(summary?.skipped),
      icon: CircleSlash,
      color: "warning" as const,
    },
  ];

  return (
    <>
      <PageHeader
        title="Emails"
        description="Every email the system has sent, with the exact content each recipient received."
      />

      {!isSummaryLoading && summary && !summary.isMailConfigured && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-muted-foreground">
            No SMTP server is configured, so emails are rendered and recorded here but not
            delivered. Set the <span className="font-mono text-xs">SMTP_*</span> environment
            variables on the API to start sending.
          </p>
        </div>
      )}

      <StatGrid className="xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Stat key={label}>
            <StatLabel>{label}</StatLabel>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <StatValue className="truncate">{value}</StatValue>
            )}
            <StatIndicator variant="icon" color={color}>
              <Icon />
            </StatIndicator>
          </Stat>
        ))}
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search recipient, subject or reference..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
      />

      <DataTable
        columns={columns}
        data={emails}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(email) => (
          <button
            type="button"
            onClick={() => setPreviewId(email._id)}
            className="w-full cursor-pointer rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{email.subject}</p>
                <p className="truncate text-[11px] text-muted-foreground">{email.to}</p>
              </div>
              <StatusBadge
                color={EMAIL_STATUS_COLORS[email.status]}
                label={EMAIL_STATUS_LABELS[email.status]}
              />
            </div>
            <dl className="mt-3 space-y-1.5 border-t pt-3 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Template</dt>
                <dd className="truncate font-medium">
                  {EMAIL_TEMPLATE_LABELS[email.template] ?? email.template}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Sent</dt>
                <dd className="truncate font-medium">{formatDateTime(email.sentAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">When</dt>
                <dd className="truncate">{safeDistanceToNow(email.sentAt)}</dd>
              </div>
              {email.relatedReference && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Reference</dt>
                  <dd className="truncate font-mono">{email.relatedReference}</dd>
                </div>
              )}
            </dl>
          </button>
        )}
      />

      <EmailPreviewModal emailId={previewId} onOpenChange={(open) => !open && setPreviewId(null)} />
    </>
  );
}
