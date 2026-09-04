import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Textarea } from "@/components/ui/textarea";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatDate, formatDateTime } from "@/lib/date";
import {
  useApproveAttendanceCorrectionMutation,
  useGetAttendanceCorrectionSummaryQuery,
  useGetAttendanceCorrectionsQuery,
  useRejectAttendanceCorrectionMutation,
} from "@/redux/apis/attendanceCorrectionApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { formatClock } from "@/types/domain/attendance";
import {
  CORRECTION_STATUSES,
  CORRECTION_STATUS_COLORS,
  CORRECTION_STATUS_LABELS,
  CORRECTION_TYPES,
  CORRECTION_TYPE_LABELS,
  type AttendanceCorrection,
  type CorrectionStatus,
  type CorrectionType,
} from "@/types/domain/attendanceCorrection";
import { Check, ClipboardList, Loader2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const FILTERS: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    defaultValue: "PENDING",
    options: CORRECTION_STATUSES.map((value) => ({
      label: CORRECTION_STATUS_LABELS[value],
      value,
    })),
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: CORRECTION_TYPES.map((value) => ({
      label: CORRECTION_TYPE_LABELS[value],
      value,
    })),
  },
  { name: "from", label: "From", type: "date" },
  { name: "to", label: "To", type: "date" },
];

interface Decision {
  request: AttendanceCorrection;
  action: "APPROVE" | "REJECT";
}

export default function AttendanceApprovalsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters(20);
  const access = useModulePermission("/hrms/approvals/attendance");

  const status = (filters.status as CorrectionStatus | undefined) ?? "PENDING";

  const query = {
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status,
    type: filters.type as CorrectionType | undefined,
    from: filters.from as string | undefined,
    to: filters.to as string | undefined,
  };

  const { data, isLoading, isFetching } = useGetAttendanceCorrectionsQuery(query);
  const { data: summary } = useGetAttendanceCorrectionSummaryQuery({
    from: query.from,
    to: query.to,
  });

  const [approve, { isLoading: isApproving }] = useApproveAttendanceCorrectionMutation();
  const [reject, { isLoading: isRejecting }] = useRejectAttendanceCorrectionMutation();

  const [decision, setDecision] = React.useState<Decision | null>(null);
  const [reviewNote, setReviewNote] = React.useState("");

  const isDeciding = isApproving || isRejecting;

  const submitDecision = async () => {
    if (!decision) return;
    try {
      const body = { reviewNote: reviewNote.trim() || undefined };
      if (decision.action === "APPROVE") {
        await approve({ id: decision.request._id, body }).unwrap();
        toast.success("Correction approved and applied");
      } else {
        await reject({ id: decision.request._id, body }).unwrap();
        toast.success("Correction rejected");
      }
      setDecision(null);
      setReviewNote("");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not record the decision");
    }
  };

  const requests = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Attendance approvals"
        description="Correction requests raised by your people. Approving one rewrites the punches on that day."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Waiting</StatLabel>
          <StatValue>{summary?.pending ?? 0}</StatValue>
          <StatDescription>Out of {summary?.total ?? 0} raised</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Approved</StatLabel>
          <StatValue>{summary?.approved ?? 0}</StatValue>
          <StatDescription>Punches were rewritten</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Rejected</StatLabel>
          <StatValue>{summary?.rejected ?? 0}</StatValue>
          <StatDescription>{summary?.cancelled ?? 0} withdrawn by the employee</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Allowance</StatLabel>
          <StatValue className="text-xl">
            {summary?.monthlyAllowance ? `${summary.monthlyAllowance}/month` : "Unlimited"}
          </StatValue>
          <StatDescription>
            {summary?.windowDays
              ? `Raised within ${summary.windowDays} days`
              : "No time limit set"}
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search people or reasons..."
        filters={FILTERS}
        currentFilters={{ ...filters, status }}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
      />

      <SectionCard
        icon={ClipboardList}
        title="Requests"
        description="Approving applies the requested punches and recalculates the day."
      >
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nothing here right now.
          </p>
        ) : (
          <div className="divide-y">
            {requests.map((request) => (
              <div key={request._id} className="flex flex-col gap-2 py-4">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <div className="min-w-0">
                    <p className="font-medium">{request.employee?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(request.date)} · {request.typeLabel} · raised{" "}
                      {formatDate(request.createdAt)}
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

                {request.isPending && access.canEdit && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => {
                        setReviewNote("");
                        setDecision({ request, action: "APPROVE" });
                      }}
                    >
                      <Check className="size-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        setReviewNote("");
                        setDecision({ request, action: "REJECT" });
                      }}
                    >
                      <X className="size-4" />
                      Reject
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
                disabled={meta.page <= 1 || isFetching}
                onClick={() => setFilter("page", meta.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={meta.page >= meta.totalPages || isFetching}
                onClick={() => setFilter("page", meta.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      <Dialog
        open={Boolean(decision)}
        onOpenChange={(open) => {
          if (!open) setDecision(null);
        }}
      >
        <DialogContent className="md:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {decision?.action === "APPROVE" ? "Approve this correction?" : "Reject this correction?"}
            </DialogTitle>
            <DialogDescription>
              {decision?.action === "APPROVE"
                ? "The punches are rewritten and the day is recalculated straight away."
                : "The day is left exactly as it is."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="flex flex-col gap-3 p-4 sm:p-6">
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              <p className="font-medium">{decision?.request.employee?.name ?? "—"}</p>
              <p className="text-muted-foreground">
                {decision ? formatDate(decision.request.date) : ""} ·{" "}
                {formatClock(decision?.request.requestedClockInAt ?? null)} →{" "}
                {formatClock(decision?.request.requestedClockOutAt ?? null)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Note back to the employee</Label>
              <Textarea
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder="Optional"
                rows={3}
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setDecision(null)}
              disabled={isDeciding}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="cursor-pointer"
              variant={decision?.action === "REJECT" ? "destructive" : "default"}
              onClick={submitDecision}
              disabled={isDeciding}
            >
              {isDeciding && <Loader2 className="mr-2 size-4 animate-spin" />}
              {decision?.action === "APPROVE" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
