import { BreakdownBars, type BreakdownRow } from "@/app/dashboard/components/BreakdownBars";
import { BusinessToolsTrendChart } from "@/app/dashboard/components/BusinessToolsTrendChart";
import { KpiCard } from "@/app/dashboard/components/KpiCard";
import { RankedBarChart, type RankedBarRow } from "@/app/dashboard/components/RankedBarChart";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatGrid } from "@/components/ui/stat";
import {
  BUSINESS_TOOL_COLORS,
  BUSINESS_TOOL_LABELS,
  EMAIL_STATUS_COLORS,
  EMAIL_STATUS_LABELS,
  EMAIL_TEMPLATE_CATEGORY_COLORS,
  EMAIL_TEMPLATE_CATEGORY_LABELS,
  SUBMISSION_SOURCE_COLORS,
  SUBMISSION_SOURCE_LABELS,
} from "@/constant";
import { useModulePermission } from "@/hooks/use-permission";
import { formatNumber } from "@/lib/amount";
import { formatDateTime, safeDistanceToNow } from "@/lib/date";
import { useGetBusinessToolsDashboardQuery } from "@/redux/apis/businessToolsApis";
import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  FileStack,
  Globe,
  Inbox,
  Layers,
  Mail,
  MailWarning,
  Rocket,
  Send,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const LIST_SKELETON = Array.from({ length: 5 });

export default function BusinessToolsDashboardPage() {
  const { data, isLoading } = useGetBusinessToolsDashboardQuery();
  const settingsAccess = useModulePermission("/crm/business-tools/settings");

  const overview = data?.kpis.overview;
  const email = data?.kpis.email;
  const web = data?.kpis.web;
  const form = data?.kpis.form;

  const pendingChanges = overview?.pendingChanges ?? 0;
  const unread = form?.unread ?? 0;
  const failed = email?.failed ?? 0;
  const mailMissing = Boolean(data) && !email?.isMailConfigured;
  const hasAlerts = pendingChanges > 0 || unread > 0 || failed > 0 || mailMissing;

  const outputCards = [
    {
      label: "Live assets",
      value: formatNumber(overview?.publishedAssets),
      description: `${overview?.publishRate ?? 0}% of the ${formatNumber(
        overview?.totalAssets
      )} things you have built`,
      icon: Rocket,
      color: "success" as const,
    },
    {
      label: "Emails sent",
      value: formatNumber(email?.sent),
      description: `${formatNumber(email?.sentThisMonth)} this month · ${formatNumber(
        email?.recipients
      )} unique recipients`,
      icon: Send,
      color: "info" as const,
      changePercent: email?.sentChangePercent,
    },
    {
      label: "Pages live",
      value: formatNumber(web?.publishedPages),
      description: `Across ${formatNumber(web?.publishedSites)} published site(s)`,
      icon: Globe,
      color: "info" as const,
    },
    {
      label: "Form responses",
      value: formatNumber(form?.submissions),
      description: `${formatNumber(form?.submissionsThisMonth)} this month · ${formatNumber(
        form?.submissionsThisWeek
      )} in the last 7 days`,
      icon: Inbox,
      color: "success" as const,
      changePercent: form?.submissionsChangePercent,
    },
  ];

  const healthCards = [
    {
      label: "Delivery rate",
      value: `${email?.deliveryRate ?? 0}%`,
      description: `${formatNumber(email?.failed)} failed · ${formatNumber(
        email?.skipped
      )} skipped`,
      icon: MailWarning,
      color: failed > 0 ? ("warning" as const) : ("success" as const),
    },
    {
      label: "Unread responses",
      value: formatNumber(unread),
      description: `${formatNumber(form?.spam)} flagged as spam`,
      icon: Inbox,
      color: unread > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Waiting to publish",
      value: formatNumber(pendingChanges),
      description: `${formatNumber(overview?.draftAssets)} draft(s) never published`,
      icon: FileStack,
      color: pendingChanges > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Output this month",
      value: formatNumber(overview?.outputThisMonth),
      description: "Emails sent plus responses collected",
      icon: Sparkles,
      color: "info" as const,
      changePercent: overview?.outputChangePercent,
    },
  ];

  const toolRows: BreakdownRow[] = (data?.toolBreakdown ?? []).map((row) => ({
    key: row.tool,
    label: BUSINESS_TOOL_LABELS[row.tool],
    count: row.total,
    color: BUSINESS_TOOL_COLORS[row.tool],
    valueLabel: `${formatNumber(row.total)} built · ${formatNumber(row.published)} live`,
  }));

  const deliveryRows: BreakdownRow[] = (data?.deliveryStatuses ?? []).map((row) => ({
    key: row.status,
    label: EMAIL_STATUS_LABELS[row.status],
    count: row.count,
    color: EMAIL_STATUS_COLORS[row.status],
  }));

  const categoryRows: BreakdownRow[] = (data?.templateCategories ?? []).map((row) => ({
    key: row.category,
    label: EMAIL_TEMPLATE_CATEGORY_LABELS[row.category],
    count: row.count,
    color: EMAIL_TEMPLATE_CATEGORY_COLORS[row.category],
    valueLabel: `${formatNumber(row.count)} template(s) · ${formatNumber(row.sent)} sent`,
  }));

  const sourceRows: BreakdownRow[] = (data?.submissionSources ?? []).map((row) => ({
    key: row.source,
    label: SUBMISSION_SOURCE_LABELS[row.source],
    count: row.count,
    color: SUBMISSION_SOURCE_COLORS[row.source],
  }));

  const templateBars: RankedBarRow[] = (data?.topTemplates ?? [])
    .filter((template) => template.sentCount > 0)
    .map((template) => ({
      key: template._id,
      label: template.name,
      value: template.sentCount,
    }));

  const formBars: RankedBarRow[] = (data?.topForms ?? [])
    .filter((row) => row.submissionCount > 0)
    .map((row) => ({ key: row._id, label: row.name, value: row.submissionCount }));

  return (
    <>
      <PageHeader
        title="Business Tools"
        description={
          data
            ? `Emails, websites and forms in one place · updated ${formatDateTime(
                data.generatedAt
              )}`
            : "Everything you have built with the email, web and form builders."
        }
        actions={
          settingsAccess.canView && (
            <Button asChild variant="outline" className="cursor-pointer">
              <Link to="/crm/business-tools/settings">
                <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                Shared defaults
              </Link>
            </Button>
          )
        }
      />

      {!isLoading && hasAlerts && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Needs attention
          </span>
          {mailMissing && (
            <span className="text-muted-foreground">
              Sending is not configured yet, so nothing will actually leave your account.
            </span>
          )}
          {unread > 0 && (
            <Link
              to="/crm/business-tools/form-builder"
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="font-semibold text-foreground">{formatNumber(unread)}</span> form
              response(s) nobody has opened
            </Link>
          )}
          {pendingChanges > 0 && (
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatNumber(pendingChanges)}
              </span>{" "}
              live item(s) have edits waiting to be published
            </span>
          )}
          {failed > 0 && (
            <Link
              to="/crm/business-tools/email-builder/deliveries?status=FAILED"
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="font-semibold text-foreground">{formatNumber(failed)}</span> email(s)
              never reached the inbox
            </Link>
          )}
        </div>
      )}

      <StatGrid className="xl:grid-cols-4">
        {outputCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <StatGrid className="xl:grid-cols-4">
        {healthCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          icon={Sparkles}
          title="Twelve months of activity"
          description="Emails sent and form responses collected each month, with the number of items you published on top."
          className="xl:col-span-2"
        >
          <BusinessToolsTrendChart points={data?.trend ?? []} isLoading={isLoading} />
        </SectionCard>

        <SectionCard
          icon={Layers}
          title="What you have built"
          description="How much of each builder's output is actually live."
        >
          <BreakdownBars
            rows={toolRows}
            isLoading={isLoading}
            emptyMessage="Nothing built yet."
            rowCount={3}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={Send}
          title="Busiest email templates"
          description="Templates ranked by how many emails they have sent."
        >
          <RankedBarChart
            rows={templateBars}
            valueLabel="Emails sent"
            isLoading={isLoading}
            emptyMessage="No template has sent an email yet."
          />
        </SectionCard>

        <SectionCard
          icon={ClipboardList}
          title="Busiest forms"
          description="Forms ranked by the responses they have collected."
        >
          <RankedBarChart
            rows={formBars}
            valueLabel="Responses"
            color="var(--chart-2)"
            isLoading={isLoading}
            emptyMessage="No form has been answered yet."
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          icon={Mail}
          title="Where your emails ended up"
          description="Every send attempt made from the email builder."
        >
          <BreakdownBars
            rows={deliveryRows}
            isLoading={isLoading}
            emptyMessage="No emails sent yet."
            rowCount={3}
          />
        </SectionCard>

        <SectionCard
          icon={Tags}
          title="Templates by category"
          description="How your email library is organised."
        >
          <BreakdownBars
            rows={categoryRows}
            isLoading={isLoading}
            emptyMessage="No templates yet."
            rowCount={4}
          />
        </SectionCard>

        <SectionCard
          icon={Users}
          title="Where responses come from"
          description="Whether people answered from the link or from a form embedded on a page."
        >
          <BreakdownBars
            rows={sourceRows}
            isLoading={isLoading}
            emptyMessage="No responses yet."
            rowCount={3}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={Globe}
          title="Your websites"
          description={`${formatNumber(web?.pages)} page(s) built from ${formatNumber(
            web?.blocks
          )} block(s), ${formatNumber(web?.indexablePages)} of them open to search engines.`}
          contentClassName="p-0 md:p-0"
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/crm/business-tools/web-builder">
                All sites
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          {isLoading ? (
            <div className="space-y-2 p-5 md:p-6">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.sites ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No websites built yet.
            </p>
          ) : (
            <ul className="divide-y">
              {data?.sites.map((site) => (
                <li
                  key={site._id}
                  className="flex items-center justify-between gap-4 px-5 py-3 md:px-6"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/crm/business-tools/web-builder/${site._id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {site.name}
                    </Link>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {site.publicUrl}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge
                      color={site.isPublished ? "green" : "zinc"}
                      label={site.isPublished ? "Live" : "Draft"}
                    />
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {formatNumber(site.publishedPageCount)} of{" "}
                      {formatNumber(site.pageCount)} page(s) live
                      {site.pendingChanges > 0
                        ? ` · ${formatNumber(site.pendingChanges)} pending`
                        : ""}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={Inbox}
          title="Latest responses"
          description={`${formatNumber(form?.acceptingForms)} of ${formatNumber(
            form?.publishedForms
          )} live form(s) are still accepting answers.`}
          contentClassName="p-0 md:p-0"
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/crm/business-tools/form-builder">
                All forms
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          {isLoading ? (
            <div className="space-y-2 p-5 md:p-6">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.recentResponses ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nobody has filled in a form yet.
            </p>
          ) : (
            <ul className="divide-y">
              {data?.recentResponses.map((response) => (
                <li
                  key={response._id}
                  className="flex items-center justify-between gap-4 px-5 py-3 md:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {response.contactName || response.contactEmail || "Anonymous"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {response.summary || "No answer preview"}
                    </p>
                    <Link
                      to={`/crm/business-tools/form-builder/${response.formId}/responses`}
                      className="truncate text-[11px] text-muted-foreground hover:underline"
                    >
                      {response.formName}
                    </Link>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {!response.isRead && <Badge variant="secondary">Unread</Badge>}
                    <span className="text-xs text-muted-foreground">
                      {safeDistanceToNow(response.submittedAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard
        icon={Mail}
        title="Latest email deliveries"
        description={`${formatNumber(email?.templates)} template(s) built from ${formatNumber(
          email?.blocks
        )} block(s). Last send ${
          email?.lastSentAt ? safeDistanceToNow(email.lastSentAt) : "never happened"
        }.`}
        contentClassName="p-0 md:p-0"
        action={
          <Button asChild variant="ghost" size="sm" className="cursor-pointer">
            <Link to="/crm/business-tools/email-builder/deliveries">
              Full history
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      >
        {isLoading ? (
          <div className="space-y-2 p-5 md:p-6">
            {LIST_SKELETON.map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : (data?.recentDeliveries ?? []).length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            You have not sent an email from the builder yet.
          </p>
        ) : (
          <ul className="divide-y">
            {data?.recentDeliveries.map((delivery) => (
              <li
                key={delivery._id}
                className="flex items-center justify-between gap-4 px-5 py-3 md:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{delivery.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {delivery.recipientName ? `${delivery.recipientName} · ` : ""}
                    {delivery.to}
                  </p>
                  {delivery.errorMessage && (
                    <p className="truncate text-[11px] text-red-600 dark:text-red-400">
                      {delivery.errorMessage}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge
                    color={EMAIL_STATUS_COLORS[delivery.status]}
                    label={EMAIL_STATUS_LABELS[delivery.status]}
                  />
                  <span className="text-xs text-muted-foreground">
                    {safeDistanceToNow(delivery.sentAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </>
  );
}
