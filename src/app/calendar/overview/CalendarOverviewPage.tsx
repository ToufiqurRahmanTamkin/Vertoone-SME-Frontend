import { BreakdownBars, type BreakdownRow } from "@/app/dashboard/components/BreakdownBars";
import { KpiCard } from "@/app/dashboard/components/KpiCard";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatGrid } from "@/components/ui/stat";
import {
  CALENDAR_LOCATION_MODE_LABELS,
  CALENDAR_STATUS_COLORS,
  CALENDAR_STATUS_LABELS,
  REGISTRATION_PAYMENT_STATUS_COLORS,
  REGISTRATION_PAYMENT_STATUS_LABELS,
  REGISTRATION_STATUS_COLORS,
  REGISTRATION_STATUS_LABELS,
} from "@/constant";
import { useModulePermission } from "@/hooks/use-permission";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDateTime, safeDistanceToNow } from "@/lib/date";
import { useGetCalendarOverviewQuery } from "@/redux/apis/calendarOverviewApis";
import type { CalendarResourceKpis } from "@/types/domain/calendarOverview";
import {
  RESOURCE_LIST_PATH,
  RESOURCE_TYPE_LABELS,
  RESOURCE_TYPE_PLURAL,
  registrationsPathFor,
} from "@/types/domain/calendarSchedule";
import {
  BadgeDollarSign,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  DoorOpen,
  Hourglass,
  Layers,
  TicketCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CalendarTrendChart } from "./components/CalendarTrendChart";

const LIST_SKELETON = Array.from({ length: 5 });

const usageLabel = (kpis: CalendarResourceKpis): string =>
  kpis.limit === null
    ? `${formatNumber(kpis.total)} in total`
    : `${formatNumber(kpis.total)} of ${formatNumber(kpis.limit)} your plan allows`;

export default function CalendarOverviewPage() {
  const { data, isLoading } = useGetCalendarOverviewQuery();

  const scheduleAccess = useModulePermission("/company/calendar/schedule");
  const eventAccess = useModulePermission(RESOURCE_LIST_PATH.EVENT);
  const meetingAccess = useModulePermission(RESOURCE_LIST_PATH.MEETING);
  const bookingAccess = useModulePermission(RESOURCE_LIST_PATH.BOOKING);

  const events = data?.kpis.events;
  const meetings = data?.kpis.meetings;
  const bookings = data?.kpis.bookings;
  const registrations = data?.kpis.registrations;
  const money = data?.kpis.money;
  const rooms = data?.kpis.rooms;

  const canView = {
    EVENT: eventAccess.canView,
    MEETING: meetingAccess.canView,
    BOOKING: bookingAccess.canView,
  };

  const kpiCards = [
    {
      label: "Events",
      value: formatNumber(events?.total),
      description: `${formatNumber(events?.published)} live · ${formatNumber(
        events?.upcoming
      )} still to come`,
      icon: CalendarDays,
      color: "info" as const,
      changePercent: events?.addedChangePercent,
    },
    {
      label: "Meetings",
      value: formatNumber(meetings?.total),
      description: `${formatNumber(meetings?.published)} live · ${formatNumber(
        meetings?.upcoming
      )} still to come`,
      icon: CalendarClock,
      color: "info" as const,
      changePercent: meetings?.addedChangePercent,
    },
    {
      label: "Booking types",
      value: formatNumber(bookings?.total),
      description: `${formatNumber(bookings?.published)} live · ${formatNumber(
        bookings?.upcoming
      )} slot(s) booked ahead`,
      icon: CalendarCheck,
      color: "info" as const,
      changePercent: bookings?.addedChangePercent,
    },
    {
      label: "Registrations",
      value: formatNumber(registrations?.total),
      description: `${formatNumber(registrations?.seatsTaken)} seat(s) held across everything`,
      icon: Users,
      color: "success" as const,
      changePercent: registrations?.changePercent,
    },
  ];

  const healthCards = [
    {
      label: "Awaiting a payment check",
      value: formatNumber(registrations?.awaitingVerification),
      description: `${formatAmountValue(money?.awaitingAmount)} sitting unverified`,
      icon: Hourglass,
      color:
        (registrations?.awaitingVerification ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Verified payments",
      value: formatAmountValue(money?.collected),
      description: `${formatAmountValue(money?.refunded)} refunded so far`,
      icon: BadgeDollarSign,
      color: "success" as const,
    },
    {
      label: "Attendance rate",
      value: `${registrations?.attendanceRate ?? 0}%`,
      description: `${formatNumber(registrations?.attended)} attended · ${formatNumber(
        registrations?.noShow
      )} no shows`,
      icon: TicketCheck,
      color: "info" as const,
    },
    {
      label: "Meeting rooms",
      value: formatNumber(rooms?.total),
      description: `${formatNumber(rooms?.active)} active · seats ${formatNumber(
        rooms?.totalCapacity
      )}`,
      icon: DoorOpen,
      color: "default" as const,
    },
  ];

  const statusRows: BreakdownRow[] = (data?.registrationStatuses ?? [])
    .filter((point) => point.count > 0)
    .map((point) => ({
      key: point.status,
      label: REGISTRATION_STATUS_LABELS[point.status],
      count: point.count,
      color: REGISTRATION_STATUS_COLORS[point.status],
    }));

  const paymentRows: BreakdownRow[] = (data?.paymentStatuses ?? [])
    .filter((point) => point.count > 0)
    .map((point) => ({
      key: point.paymentStatus,
      label: REGISTRATION_PAYMENT_STATUS_LABELS[point.paymentStatus],
      count: point.count,
      color: REGISTRATION_PAYMENT_STATUS_COLORS[point.paymentStatus],
      valueLabel: `${formatNumber(point.count)} · ${formatAmountValue(point.amount)}`,
    }));

  return (
    <>
      <PageHeader
        title="Calendar overview"
        description="Everything your company has on the calendar: what is coming up, who signed up, and what is still owed."
        actions={<CurrencyNote currency={data?.currency ?? "BDT"} />}
      />

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {healthCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <SectionCard
        icon={TrendingUp}
        title="Sign-ups over the year"
        description="Twelve months of registrations and booking requests, stacked by where they came from."
      >
        <CalendarTrendChart points={data?.trend ?? []} isLoading={isLoading} />
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={CalendarClock}
          title="Coming up next"
          description="The events and meetings with the nearest start times."
          action={
            scheduleAccess.canView && (
              <Link
                to="/company/calendar/schedule"
                className="text-sm font-medium text-primary hover:underline"
              >
                Open schedule
              </Link>
            )
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : (data?.upcoming ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing is scheduled ahead of today.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.upcoming ?? []).map((row) => (
                <li key={`${row.type}-${row._id}`} className="flex items-start gap-3 py-2.5">
                  <span
                    className="mt-0.5 size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.accentColor }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    {canView[row.type] ? (
                      <Link
                        to={registrationsPathFor(row.type, row._id)}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {row.title}
                      </Link>
                    ) : (
                      <p className="truncate text-sm font-medium">{row.title}</p>
                    )}
                    <p className="truncate text-xs text-muted-foreground">
                      {RESOURCE_TYPE_LABELS[row.type]}
                      {" · "}
                      {CALENDAR_LOCATION_MODE_LABELS[row.locationMode]}
                      {row.venue && ` · ${row.venue}`}
                      {row.subtitle && ` · ${row.subtitle}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs font-medium">{formatDateTime(row.startAt)}</span>
                    <span className="text-xs text-muted-foreground">
                      {row.capacity === null
                        ? `${formatNumber(row.seatsTaken)} taken`
                        : `${formatNumber(row.seatsTaken)}/${formatNumber(row.capacity)} taken`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={Hourglass}
          title="Payments waiting on you"
          description="Registrations whose transaction ID nobody has confirmed yet."
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : (data?.awaitingPayments ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing is waiting on a payment check.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.awaitingPayments ?? []).map((row) => (
                <li key={row._id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      <span className="font-mono uppercase">{row.reference}</span>
                      {" · "}
                      {row.resourceTitle}
                      {row.transactionId && ` · ${row.transactionId}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatAmountValue(row.amount)}
                    </span>
                    {canView[row.type] ? (
                      <Link
                        to={registrationsPathFor(row.type, row.resourceId)}
                        className="text-xs text-primary hover:underline"
                      >
                        Review
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {safeDistanceToNow(row.createdAt)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={Layers}
          title="How each part is doing"
          description="Live records, sign-ups and money verified, per part of the calendar."
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.slice(0, 3).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (data?.types ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              You cannot see any part of the calendar yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {(data?.types ?? []).map((row) => (
                <li key={row.type} className="rounded-lg border p-3">
                  <div className="flex items-baseline justify-between gap-3">
                    {canView[row.type] ? (
                      <Link
                        to={RESOURCE_LIST_PATH[row.type]}
                        className="text-sm font-medium hover:underline"
                      >
                        {RESOURCE_TYPE_PLURAL[row.type]}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium">
                        {RESOURCE_TYPE_PLURAL[row.type]}
                      </span>
                    )}
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatNumber(row.published)}/{formatNumber(row.total)} live
                    </span>
                  </div>
                  <Progress
                    value={row.total > 0 ? (row.published / row.total) * 100 : 0}
                    className="mt-2 h-1.5"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {formatNumber(row.registrations)} sign-ups
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {formatAmountValue(row.collected)} verified
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <div className="grid gap-4">
          <SectionCard
            icon={Users}
            title="Registrations by status"
            description="Where every sign-up stands right now."
          >
            <BreakdownBars
              rows={statusRows}
              isLoading={isLoading}
              emptyMessage="Nobody has signed up yet."
              rowCount={5}
            />
          </SectionCard>

          <SectionCard
            icon={BadgeDollarSign}
            title="Registrations by payment"
            description="What has been paid, what is unverified, and what came back."
          >
            <BreakdownBars
              rows={paymentRows}
              isLoading={isLoading}
              emptyMessage="No payments have been recorded."
              rowCount={5}
            />
          </SectionCard>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={TicketCheck}
          title="Busiest records"
          description="What is pulling in the most sign-ups, and how full it is."
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : (data?.topResources ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing has been signed up for yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {(data?.topResources ?? []).map((row) => (
                <li key={`${row.type}-${row._id}`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: row.accentColor }}
                        aria-hidden
                      />
                      {canView[row.type] ? (
                        <Link
                          to={registrationsPathFor(row.type, row._id)}
                          className="truncate text-sm font-medium hover:underline"
                        >
                          {row.title}
                        </Link>
                      ) : (
                        <span className="truncate text-sm font-medium">{row.title}</span>
                      )}
                      <StatusBadge
                        color={CALENDAR_STATUS_COLORS[row.status]}
                        label={CALENDAR_STATUS_LABELS[row.status]}
                      />
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatNumber(row.registrationCount)} sign-ups
                    </span>
                  </div>
                  <Progress value={row.fillRate ?? 0} className="mt-1.5 h-1.5" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {RESOURCE_TYPE_LABELS[row.type]}
                    {" · "}
                    {row.fillRate === null
                      ? `${formatNumber(row.seatsTaken)} seat(s) held, no cap`
                      : `${row.fillRate}% full`}
                    {row.startAt && ` · ${formatDateTime(row.startAt)}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={DoorOpen}
          title="Meeting rooms"
          description="Which rooms your meetings are actually being held in."
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.rooms ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No meeting rooms have been set up yet.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.rooms ?? []).map((room) => (
                <li key={room._id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: room.color }}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{room.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        <span className="font-mono uppercase">{room.code}</span>
                        {` · seats ${formatNumber(room.capacity)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {!room.isActive && <StatusBadge color="zinc" label="Inactive" />}
                    {room.upcomingCount > 0 && (
                      <StatusBadge color="blue" label={`${room.upcomingCount} ahead`} />
                    )}
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {formatNumber(room.meetingCount)} used
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            { key: "EVENT", kpis: events, icon: CalendarDays },
            { key: "MEETING", kpis: meetings, icon: CalendarClock },
            { key: "BOOKING", kpis: bookings, icon: CalendarCheck },
          ] as const
        ).map(({ key, kpis, icon: Icon }) => (
          <SectionCard
            key={key}
            icon={Icon}
            title={`${RESOURCE_TYPE_PLURAL[key]} at a glance`}
            description={kpis ? usageLabel(kpis) : "Loading..."}
            action={
              canView[key] && (
                <Link
                  to={RESOURCE_LIST_PATH[key]}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Open
                </Link>
              )
            }
          >
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Live</dt>
                <dd className="text-right font-medium tabular-nums">
                  {formatNumber(kpis?.published)}
                </dd>
                <dt className="text-muted-foreground">Draft</dt>
                <dd className="text-right font-medium tabular-nums">
                  {formatNumber(kpis?.draft)}
                </dd>
                <dt className="text-muted-foreground">Cancelled</dt>
                <dd className="text-right font-medium tabular-nums">
                  {formatNumber(kpis?.cancelled)}
                </dd>
                <dt className="text-muted-foreground">Charging a fee</dt>
                <dd className="text-right font-medium tabular-nums">
                  {formatNumber(kpis?.paid)}
                </dd>
                <dt className="text-muted-foreground">Sign-ups</dt>
                <dd className="text-right font-medium tabular-nums">
                  {formatNumber(kpis?.registrations)}
                </dd>
                <dt className="text-muted-foreground">Seats held</dt>
                <dd className="text-right font-medium tabular-nums">
                  {formatNumber(kpis?.seatsTaken)}
                </dd>
              </dl>
            )}
          </SectionCard>
        ))}
      </div>
    </>
  );
}
