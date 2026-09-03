import { KpiCard } from "@/app/dashboard/components/KpiCard";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatGrid } from "@/components/ui/stat";
import { formatNumber } from "@/lib/amount";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useGetSystemOverviewQuery } from "@/redux/apis/systemOverviewApis";
import {
  Activity,
  AlertTriangle,
  Building2,
  CalendarClock,
  Database,
  HardDrive,
  Mail,
  Plug,
  RefreshCw,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Radio,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { InfoRows, type InfoRow } from "./components/InfoRows";
import {
  activityColor,
  DB_STATE_COLORS,
  DB_STATE_LABELS,
  formatBytes,
  formatDuration,
  formatMillis,
  INTEGRATION_COLORS,
  INTEGRATION_LABELS,
} from "./system-overview-format";

export default function SystemOverviewPage() {
  const { data, isLoading, isFetching, refetch } = useGetSystemOverviewQuery();

  const runtime = data?.runtime;
  const database = data?.database;
  const realtime = data?.realtime;
  const records = data?.records;
  const email = data?.email;
  const security = data?.security;
  const storage = data?.storage;
  const configuration = data?.configuration;

  const dbState = database?.state ?? "UNINITIALISED";
  const notConfigured = (data?.integrations ?? []).filter(
    (integration) => integration.status === "NOT_CONFIGURED"
  );
  const failedJobs = (data?.jobs ?? []).filter((job) => job.lastError);

  const headlineCards = [
    {
      label: "API",
      value: runtime ? formatDuration(runtime.uptimeSeconds) : "—",
      description: `${runtime?.environment ?? "—"} · Node ${runtime?.nodeVersion ?? "—"}`,
      icon: Server,
      color: "success" as const,
    },
    {
      label: "Database",
      value: DB_STATE_LABELS[dbState],
      description: database?.statsAvailable
        ? `${formatNumber(database.documents)} documents · ${formatBytes(database.dataSizeBytes)}`
        : (database?.name ?? "Not connected"),
      icon: Database,
      color: dbState === "CONNECTED" ? ("success" as const) : ("error" as const),
    },
    {
      label: "Realtime",
      value: realtime?.enabled ? (realtime.ready ? "Live" : "Starting") : "Off",
      description: realtime?.enabled
        ? `${formatNumber(realtime.connections)} open connection(s)`
        : "Polling fallback in use",
      icon: Radio,
      color: realtime?.ready ? ("success" as const) : ("warning" as const),
    },
    {
      label: "Memory in use",
      value: formatBytes(runtime?.memoryUsedBytes),
      description: `${formatBytes(runtime?.memoryTotalBytes)} resident`,
      icon: HardDrive,
      color: "info" as const,
    },
  ];

  const recordCards = [
    {
      label: "Companies",
      value: formatNumber(records?.companies),
      description: `${formatNumber(records?.concerns)} concern(s) under them`,
      icon: Building2,
      color: "info" as const,
    },
    {
      label: "User accounts",
      value: formatNumber(records?.users),
      description: `${formatNumber(records?.maintainers)} maintainer(s) · ${formatNumber(
        security?.activeSessions
      )} active`,
      icon: Users,
      color: "default" as const,
    },
    {
      label: "Subscriptions",
      value: formatNumber(records?.subscriptions),
      description: `across ${formatNumber(records?.plans)} plan(s)`,
      icon: CalendarClock,
      color: "success" as const,
    },
    {
      label: "Ledger records",
      value: formatNumber(
        (records?.incomes ?? 0) + (records?.expenses ?? 0) + (records?.invoices ?? 0)
      ),
      description: `${formatNumber(records?.incomes)} income · ${formatNumber(
        records?.expenses
      )} expense · ${formatNumber(records?.invoices)} invoice`,
      icon: Activity,
      color: "info" as const,
    },
  ];

  const runtimeRows: InfoRow[] = [
    { label: "Application", value: runtime?.appName },
    { label: "Environment", value: runtime?.environment },
    { label: "Runtime", value: `Node ${runtime?.nodeVersion ?? "—"} on ${runtime?.platform ?? "—"}` },
    { label: "Hosting", value: runtime?.serverless ? "Serverless function" : "Long-running server" },
    { label: "API base path", value: <span className="font-mono text-xs">{runtime?.apiPrefix}</span> },
    { label: "Uptime", value: formatDuration(runtime?.uptimeSeconds) },
  ];

  const databaseRows: InfoRow[] = [
    {
      label: "Status",
      value: <StatusBadge color={DB_STATE_COLORS[dbState]} label={DB_STATE_LABELS[dbState]} />,
    },
    { label: "Database", value: database?.name },
    { label: "Host", value: <span className="font-mono text-xs">{database?.host}</span> },
    ...(database?.statsAvailable
      ? [
          { label: "Collections", value: formatNumber(database.collections) },
          { label: "Documents", value: formatNumber(database.documents) },
          { label: "Data size", value: formatBytes(database.dataSizeBytes) },
          { label: "Storage allocated", value: formatBytes(database.storageSizeBytes) },
          { label: "Indexes", value: formatBytes(database.indexSizeBytes) },
        ]
      : [
          {
            label: "Storage stats",
            value: "Unavailable",
            hint: "This cluster tier does not expose dbStats",
          },
        ]),
  ];

  const securityRows: InfoRow[] = [
    { label: "Access token life", value: security?.accessTokenExpiresIn },
    { label: "Refresh token life", value: security?.refreshTokenExpiresIn },
    { label: "Password hashing", value: `bcrypt, ${security?.passwordHashRounds ?? 0} rounds` },
    {
      label: "Rate limiting",
      value: security?.rateLimitEnabled
        ? `${formatNumber(security.apiRequestsPerWindow)} req / ${security.apiWindowMinutes}m`
        : "Disabled",
    },
    { label: "Sign-in attempts allowed", value: formatNumber(security?.loginAttemptsPerWindow) },
    { label: "Active accounts", value: formatNumber(security?.activeSessions) },
    {
      label: "Sign-ins (24h)",
      value: `${formatNumber(security?.signInsLast24h)} ok · ${formatNumber(
        security?.failedSignInsLast24h
      )} failed`,
    },
  ];

  const configurationRows: InfoRow[] = [
    { label: "Default currency", value: configuration?.defaultCurrency },
    { label: "Default timezone", value: configuration?.defaultTimezone },
    { label: "Default trial", value: `${configuration?.trialDays ?? 0} days` },
    {
      label: "Public signups",
      value: (
        <StatusBadge
          color={configuration?.allowSignups ? "green" : "zinc"}
          label={configuration?.allowSignups ? "Open" : "Closed"}
        />
      ),
    },
    {
      label: "Maintenance mode",
      value: (
        <StatusBadge
          color={configuration?.maintenanceMode ? "red" : "green"}
          label={configuration?.maintenanceMode ? "Offline" : "Online"}
        />
      ),
    },
    { label: "Default payment method", value: configuration?.defaultPaymentMethod },
    {
      label: "Payment methods on",
      value:
        configuration?.enabledPaymentMethods.length === 0
          ? "None"
          : configuration?.enabledPaymentMethods.join(", "),
    },
  ];

  const deliveryRows: InfoRow[] = [
    {
      label: "Transport",
      value: (
        <StatusBadge
          color={email?.configured ? "green" : "amber"}
          label={email?.configured ? "Configured" : "Not configured"}
        />
      ),
    },
    { label: "Sends from", value: <span className="font-mono text-xs">{email?.fromAddress}</span> },
    { label: "Delivered", value: formatNumber(email?.sent) },
    { label: "Failed", value: formatNumber(email?.failed) },
    { label: "Skipped", value: formatNumber(email?.skipped) },
    { label: "Last delivery", value: email?.lastSentAt ? formatDateTime(email.lastSentAt) : "Never" },
  ];

  const storageRows: InfoRow[] = [
    {
      label: "Provider",
      value: (
        <StatusBadge
          color={storage?.configured ? "green" : "amber"}
          label={`${storage?.provider ?? "—"} · ${storage?.configured ? "Ready" : "Not configured"}`}
        />
      ),
    },
    { label: "Asset folder", value: <span className="font-mono text-xs">{storage?.folder}</span> },
    { label: "Max upload size", value: formatBytes(storage?.maxFileSizeBytes) },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="System Overview" description="Platform health at a glance." />
        <StatGrid className="xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </StatGrid>
        <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="System Overview"
        description={
          data
            ? `Platform health, integrations and background work · read ${formatDateTime(
                data.generatedAt
              )}`
            : "Platform health, integrations and background work."
        }
        actions={
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("mr-1.5 h-4 w-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      {(configuration?.maintenanceMode || notConfigured.length > 0 || failedJobs.length > 0) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Needs attention
          </span>
          {configuration?.maintenanceMode && (
            <Link
              to="/platform/system/configuration"
              className="text-muted-foreground hover:text-foreground"
            >
              Maintenance mode is <span className="font-semibold text-foreground">on</span> — the
              app is offline to customers
            </Link>
          )}
          {notConfigured.length > 0 && (
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{notConfigured.length}</span>{" "}
              integration(s) not configured: {notConfigured.map((one) => one.label).join(", ")}
            </span>
          )}
          {failedJobs.length > 0 && (
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{failedJobs.length}</span> background
              job(s) reported an error on their last run
            </span>
          )}
        </div>
      )}

      <StatGrid className="xl:grid-cols-4">
        {headlineCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </StatGrid>

      <StatGrid className="xl:grid-cols-4">
        {recordCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
        <SectionCard
          icon={Plug}
          title="Integrations"
          description="Every external service this platform talks to, and whether it is ready."
          contentClassName="p-0 md:p-0"
        >
          <ul className="divide-y">
            {(data?.integrations ?? []).map((integration) => (
              <li
                key={integration.key}
                className="flex items-start justify-between gap-4 px-5 py-3 md:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{integration.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{integration.detail}</p>
                </div>
                <StatusBadge
                  color={INTEGRATION_COLORS[integration.status]}
                  label={INTEGRATION_LABELS[integration.status]}
                />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          icon={Server}
          title="Runtime"
          description="What this API process is and how long it has been up."
        >
          <InfoRows rows={runtimeRows} />
        </SectionCard>

        <SectionCard
          icon={Database}
          title="Database"
          description="Connection state and how much space the data occupies."
        >
          <InfoRows rows={databaseRows} />
        </SectionCard>

        <SectionCard
          icon={CalendarClock}
          title="Background jobs"
          description="Scheduled work that runs without anyone pressing a button."
          contentClassName="p-0 md:p-0"
        >
          <ul className="divide-y">
            {(data?.jobs ?? []).map((job) => (
              <li key={job.key} className="space-y-2 px-5 py-4 md:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{job.label}</p>
                    <p className="text-xs text-muted-foreground">{job.description}</p>
                  </div>
                  <StatusBadge
                    color={job.lastError ? "red" : job.scheduled ? "green" : "zinc"}
                    label={job.lastError ? "Erroring" : job.scheduled ? "Scheduled" : "Not running"}
                  />
                </div>
                <InfoRows
                  rows={[
                    { label: "Runs every", value: `${job.intervalMinutes} minutes` },
                    { label: "Runs so far", value: formatNumber(job.runCount) },
                    {
                      label: "Last run",
                      value: job.lastRunAt ? formatDateTime(job.lastRunAt) : "Not yet",
                    },
                    {
                      label: "Next run",
                      value: job.nextRunAt ? formatDateTime(job.nextRunAt) : "—",
                    },
                    { label: "Last duration", value: formatMillis(job.lastDurationMs) },
                    { label: "Last cycle", value: job.lastSummary },
                  ]}
                />
                {job.lastError && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {job.lastError}
                  </p>
                )}
                {!job.scheduled && !job.lastError && (
                  <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
                    Not scheduled in this process. Serverless deployments run the API per request,
                    so this job needs an external scheduler.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          icon={ShieldCheck}
          title="Security & limits"
          description="Session lifetimes, throttles and recent sign-in traffic."
        >
          <InfoRows rows={securityRows} />
        </SectionCard>

        <SectionCard
          icon={SlidersHorizontal}
          title="Configuration"
          description="The live values behind System · Configuration."
          action={
            <Button asChild variant="outline" size="sm" className="cursor-pointer">
              <Link to="/platform/system/configuration">Edit</Link>
            </Button>
          }
        >
          <InfoRows rows={configurationRows} />
        </SectionCard>

        <SectionCard
          icon={Mail}
          title="Email delivery"
          description="How outbound mail is doing since the log began."
        >
          <InfoRows rows={deliveryRows} />
        </SectionCard>

        <SectionCard
          icon={HardDrive}
          title="File storage"
          description="Where uploaded logos, banners and product images land."
        >
          <InfoRows rows={storageRows} />
        </SectionCard>
      </div>

      <SectionCard
        icon={Activity}
        title="Recent system activity"
        description="The latest system and security events from the audit trail."
        contentClassName="p-0 md:p-0"
        action={
          <Button asChild variant="outline" size="sm" className="cursor-pointer">
            <Link to="/platform/system/activity-log">View all</Link>
          </Button>
        }
      >
        {(data?.recentActivity ?? []).length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nothing recorded yet.
          </p>
        ) : (
          <ul className="divide-y">
            {data?.recentActivity.map((row) => (
              <li
                key={row._id}
                className="flex items-start justify-between gap-4 px-5 py-3 md:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{row.message}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.actorName} · {formatDateTime(row.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {row.category}
                  </Badge>
                  <StatusBadge color={activityColor(row)} label={row.severity} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </>
  );
}
