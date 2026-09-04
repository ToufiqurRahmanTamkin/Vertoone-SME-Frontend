import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { formatDate, formatDateTime } from "@/lib/date";
import {
  useCancelAttendanceCorrectionMutation,
  useGetMyAttendanceCorrectionSummaryQuery,
  useGetMyAttendanceCorrectionsQuery,
} from "@/redux/apis/attendanceCorrectionApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { formatClock } from "@/types/domain/attendance";
import {
  CORRECTION_STATUS_COLORS,
  type AttendanceCorrection,
} from "@/types/domain/attendanceCorrection";
import { CalendarCheck, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CorrectionRequestModal } from "./components/CorrectionRequestModal";

export default function AttendanceCorrectionPage() {
  const [page, setPage] = React.useState(1);
  const [formOpen, setFormOpen] = React.useState(false);
  const [pendingCancel, setPendingCancel] = React.useState<AttendanceCorrection | null>(null);

  const { data, isLoading, isFetching } = useGetMyAttendanceCorrectionsQuery({
    page,
    limit: 20,
  });
  const { data: summary } = useGetMyAttendanceCorrectionSummaryQuery();
  const [cancelCorrection, { isLoading: isCancelling }] = useCancelAttendanceCorrectionMutation();

  const requests = data?.data ?? [];
  const meta = data?.meta;

  const allowance = summary?.monthlyAllowance ?? 0;
  const used = summary?.usedThisMonth ?? 0;
  const isBlocked =
    summary?.regularizationEnabled === false || (allowance > 0 && used >= allowance);

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    try {
      await cancelCorrection(pendingCancel._id).unwrap();
      toast.success("Request withdrawn");
      setPendingCancel(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not withdraw the request");
    }
  };

  return (
    <>
      <PageHeader
        title="Attendance correction"
        description="Ask for a missed or wrong punch to be fixed."
        actions={
          <ActionButton
            icon={Plus}
            label="New request"
            onClick={() => setFormOpen(true)}
            disabled={isBlocked}
            title={
              summary?.regularizationEnabled === false
                ? "Corrections are switched off for your company"
                : isBlocked
                  ? `You have used all ${allowance} corrections allowed this month`
                  : undefined
            }
          />
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Waiting on a decision</StatLabel>
          <StatValue>{summary?.pending ?? 0}</StatValue>
          <StatDescription>Out of {summary?.total ?? 0} you have raised</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Approved</StatLabel>
          <StatValue>{summary?.approved ?? 0}</StatValue>
          <StatDescription>{summary?.rejected ?? 0} turned down</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Used this month</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {allowance > 0 ? `${allowance} allowed each month` : "No monthly limit"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Time to raise one</StatLabel>
          <StatValue className="text-xl">
            {summary?.windowDays ? `${summary.windowDays} days` : "Any time"}
          </StatValue>
          <StatDescription>Counted from the day itself</StatDescription>
        </Stat>
      </StatGrid>

      {summary?.regularizationEnabled === false && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          Your company has switched attendance corrections off. Speak to HR if a punch needs fixing.
        </p>
      )}

      <SectionCard
        icon={CalendarCheck}
        title="Your requests"
        description="Newest first. You can withdraw anything still waiting for a decision."
      >
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            You have not asked for any corrections yet.
          </p>
        ) : (
          <div className="divide-y">
            {requests.map((request) => (
              <div key={request._id} className="flex flex-col gap-2 py-4">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <div className="min-w-0">
                    <p className="font-medium">{formatDate(request.date)}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.typeLabel} · raised {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <StatusBadge
                    color={CORRECTION_STATUS_COLORS[request.status] ?? "muted"}
                    label={request.statusLabel}
                  />
                </div>

                <p className="text-sm tabular-nums">
                  Asked for {formatClock(request.requestedClockInAt)} →{" "}
                  {formatClock(request.requestedClockOutAt)}
                </p>
                <p className="text-sm text-muted-foreground">{request.reason}</p>

                {request.reviewedAt && (
                  <p className="text-xs text-muted-foreground">
                    Decided {formatDateTime(request.reviewedAt)}
                    {request.reviewedByName && ` by ${request.reviewedByName}`}
                    {request.reviewNote && ` — ${request.reviewNote}`}
                  </p>
                )}

                {request.isPending && (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => setPendingCancel(request)}
                    >
                      Withdraw
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={page >= meta.totalPages || isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      <CorrectionRequestModal open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        onOpenChange={(open) => !open && setPendingCancel(null)}
        title="Withdraw this request?"
        description="It stops waiting for a decision. You can raise a new one if you still need the fix."
        confirmText="Withdraw"
        variant="destructive"
        isLoading={isCancelling}
        onConfirm={confirmCancel}
      />
    </>
  );
}
