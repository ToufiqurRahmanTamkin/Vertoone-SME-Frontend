import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { formatDateTime, safeDistanceToNow } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useGetCrmActivityOverviewQuery } from "@/redux/apis/crmActivityApis";
import {
  CRM_ACTIVITY_CATEGORY_LABELS,
  CRM_ACTIVITY_RELATED_COLORS,
  CRM_ACTIVITY_RELATED_LABELS,
  CRM_ACTIVITY_TYPE_LABELS,
  type CrmActivity,
} from "@/types/domain/crmActivity";
import { AlarmClock, CalendarClock, History, Layers, Plus, Users } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { CATEGORY_ICONS, relatedNameOf } from "./activity.helpers";
import { ActivityFormModal } from "./components/ActivityFormModal";

const CATEGORY_LINKS: Record<string, string> = {
  TASK: "/crm/activities/tasks",
  CALL: "/crm/activities/calls",
  MEETING: "/crm/activities/meetings",
  NOTE: "/crm/activities/notes",
  MESSAGE: "/crm/activities/timeline",
};

function ActivityRow({ activity, tone }: { activity: CrmActivity; tone?: "overdue" }) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{activity.subject}</p>
        <p className="truncate text-xs text-muted-foreground">
          {CRM_ACTIVITY_TYPE_LABELS[activity.type]} · {relatedNameOf(activity)}
          {activity.performedBy ? ` · ${activity.performedBy.name}` : " · Unassigned"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <StatusBadge
          color={CRM_ACTIVITY_RELATED_COLORS[activity.relatedType]}
          label={CRM_ACTIVITY_RELATED_LABELS[activity.relatedType]}
        />
        <p
          className={cn(
            "mt-1 text-xs text-muted-foreground",
            tone === "overdue" && "font-medium text-red-600 dark:text-red-400"
          )}
        >
          {activity.dueAt
            ? `${formatDateTime(activity.dueAt)} · ${safeDistanceToNow(activity.dueAt)}`
            : formatDateTime(activity.occurredAt)}
        </p>
      </div>
    </li>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

export default function ActivitiesOverviewPage() {
  const access = useModulePermission("/crm/activities/overview");
  const { data, isLoading } = useGetCrmActivityOverviewQuery();

  const [formOpen, setFormOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <>
      <PageHeader
        title="Activities"
        description="Calls, meetings, tasks and notes logged across every lead, deal and contact."
        actions={
          access.canCreate && (
            <ActionButton icon={Plus} label="Log activity" onClick={() => setFormOpen(true)} />
          )
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Open</StatLabel>
          <StatValue>{summary?.openCount ?? 0}</StatValue>
          <StatDescription>{summary?.dueTodayCount ?? 0} due today</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Overdue</StatLabel>
          <StatValue>{summary?.overdueCount ?? 0}</StatValue>
          <StatDescription>Past their due date and still waiting</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Due this week</StatLabel>
          <StatValue>{summary?.dueThisWeekCount ?? 0}</StatValue>
          <StatDescription>{summary?.unassignedCount ?? 0} with nobody on them</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Logged this week</StatLabel>
          <StatValue>{summary?.loggedThisWeekCount ?? 0}</StatValue>
          <StatDescription>{summary?.total ?? 0} on record in total</StatDescription>
        </Stat>
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={Layers}
          title="By kind"
          description="Where your team's time is going, and what is slipping."
        >
          <ul className="grid gap-2">
            {(data?.byCategory ?? []).map((row) => {
              const Icon = CATEGORY_ICONS[row.category];

              return (
                <li key={row.category}>
                  <Link
                    to={CATEGORY_LINKS[row.category] ?? "/crm/activities/timeline"}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="truncate text-sm font-medium">
                        {CRM_ACTIVITY_CATEGORY_LABELS[row.category]}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {row.overdueCount > 0 && (
                        <Badge variant="destructive" className="text-[11px]">
                          {row.overdueCount} overdue
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[11px]">
                        {row.openCount} open
                      </Badge>
                      <span className="text-sm font-semibold tabular-nums">{row.total}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard
          icon={Users}
          title="By owner"
          description="Who is carrying the follow-ups, and who is behind."
        >
          {(data?.byOwner ?? []).length === 0 ? (
            <EmptyRow text="Nothing logged yet, so there is nobody to compare." />
          ) : (
            <ul className="grid gap-2">
              {(data?.byOwner ?? []).map((row) => (
                <li
                  key={row.performedById ?? "unassigned"}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <span className="truncate text-sm font-medium">{row.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {row.overdueCount > 0 && (
                      <Badge variant="destructive" className="text-[11px]">
                        {row.overdueCount} overdue
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[11px]">
                      {row.openCount} open
                    </Badge>
                    <span className="text-sm font-semibold tabular-nums">{row.total}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={AlarmClock}
          title="Overdue"
          description="These were promised and have not happened."
        >
          {(data?.overdue ?? []).length === 0 ? (
            <EmptyRow text="Nothing overdue. Keep it that way." />
          ) : (
            <ul className="grid gap-2">
              {(data?.overdue ?? []).map((activity) => (
                <ActivityRow key={activity._id} activity={activity} tone="overdue" />
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={CalendarClock}
          title="Coming up"
          description="The next follow-ups your team owes."
        >
          {(data?.upcoming ?? []).length === 0 ? (
            <EmptyRow text="Nothing scheduled. Log a follow-up with a due date." />
          ) : (
            <ul className="grid gap-2">
              {(data?.upcoming ?? []).map((activity) => (
                <ActivityRow key={activity._id} activity={activity} />
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={History}
          title="Recently logged"
          description="The last things your team recorded."
          className="lg:col-span-2"
        >
          {(data?.recent ?? []).length === 0 ? (
            <EmptyRow text="Nothing logged yet. Record the first call or meeting." />
          ) : (
            <ul className="grid gap-2">
              {(data?.recent ?? []).map((activity) => (
                <ActivityRow key={activity._id} activity={activity} />
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <ActivityFormModal open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
}
