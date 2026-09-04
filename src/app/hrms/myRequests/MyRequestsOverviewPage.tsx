import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { formatAmountValue } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetMyRequestsOverviewQuery } from "@/redux/apis/myRequestsApis";
import { REQUEST_STATUS_COLORS } from "@/types/domain/myRequests";
import { Activity, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";

export default function MyRequestsOverviewPage() {
  const { data, isLoading } = useGetMyRequestsOverviewQuery();

  const channels = data?.channels ?? [];
  const recent = data?.recent ?? [];

  return (
    <>
      <PageHeader
        title="My requests"
        description="Your open requests and the decisions taken on them."
        actions={<CurrencyNote currency={data?.currency ?? "BDT"} />}
      />

      <StatGrid className="sm:grid-cols-2 lg:grid-cols-4">
        <Stat>
          <StatLabel>Waiting on a decision</StatLabel>
          <StatValue>{data?.open ?? 0}</StatValue>
          <StatDescription>Out of {data?.total ?? 0} you have raised</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Approved</StatLabel>
          <StatValue>{data?.approved ?? 0}</StatValue>
          <StatDescription>{data?.rejected ?? 0} turned down</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Leave days left</StatLabel>
          <StatValue>{data?.leaveDaysRemaining ?? 0}</StatValue>
          <StatDescription>{data?.leaveDaysTaken ?? 0} taken this leave year</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Money waiting</StatLabel>
          <StatValue>{formatAmountValue(data?.pendingAmount ?? 0)}</StatValue>
          <StatDescription>
            {formatAmountValue(data?.claimedAmount ?? 0)} approved so far
          </StatDescription>
        </Stat>
      </StatGrid>

      <SectionCard
        icon={LayoutGrid}
        title="Everything you can ask for"
        description="Jump straight to the kind of request you need."
      >
        {isLoading ? (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {channels.map((channel) => (
              <Link
                key={channel.key}
                to={channel.path}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{channel.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {channel.total === 0
                      ? "Nothing raised yet"
                      : `${channel.total} raised · ${channel.approved} approved`}
                  </p>
                </div>
                {channel.open > 0 && <StatusBadge color="amber" label={`${channel.open} open`} />}
              </Link>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        icon={Activity}
        title="Latest activity"
        description="The most recent requests you have raised, across every kind."
      >
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            You have not raised anything yet. Pick a card above to get started.
          </p>
        ) : (
          <div className="divide-y rounded-lg border">
            {recent.map((entry) => (
              <div
                key={`${entry.channel}-${entry._id}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{entry.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {entry.channelLabel} · raised {formatDate(entry.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge
                    color={REQUEST_STATUS_COLORS[entry.status] ?? "muted"}
                    label={entry.statusLabel}
                  />
                  <Button asChild variant="ghost" size="sm" className="cursor-pointer">
                    <Link to={entry.path}>Open</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}
