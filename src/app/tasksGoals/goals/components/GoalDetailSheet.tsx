import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDate, formatDateTime } from "@/lib/date";
import { useDeleteGoalMutation, useGetGoalQuery } from "@/redux/apis/goalApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  GOAL_CATEGORY_LABELS,
  GOAL_PRIORITY_COLORS,
  GOAL_PRIORITY_LABELS,
  GOAL_PROGRESS_MODE_LABELS,
  GOAL_STATUS_COLORS,
  GOAL_STATUS_LABELS,
  type Goal,
} from "@/types/domain/goal";
import { Pencil, Target, Trash2, TrendingUp } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { describeMetric } from "../goal.helpers";

interface GoalDetailSheetProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditGoal: (goal: Goal) => void;
  onCheckIn: (goal: Goal) => void;
  canEdit: boolean;
  canDelete: boolean;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

export function GoalDetailSheet({
  goal,
  open,
  onOpenChange,
  onEditGoal,
  onCheckIn,
  canEdit,
  canDelete,
}: GoalDetailSheetProps) {
  const { data: fresh } = useGetGoalQuery(goal?._id ?? "", { skip: !goal || !open });
  const [deleteGoal, { isLoading: isDeleting }] = useDeleteGoalMutation();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const current = fresh ?? goal;

  const confirmDelete = async () => {
    if (!current) return;
    try {
      await deleteGoal(current._id).unwrap();
      toast.success("Goal deleted");
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the goal");
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
          aria-describedby={undefined}
        >
          {current && (
            <>
              <SheetHeader className="space-y-2 border-b px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <SheetTitle className="truncate text-base">{current.title}</SheetTitle>
                    <SheetDescription className="truncate">
                      <span className="font-mono uppercase">{current.code}</span>
                      {` · ${GOAL_CATEGORY_LABELS[current.category]}`}
                      {current.parentGoal ? ` · under ${current.parentGoal.code}` : ""}
                    </SheetDescription>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {canEdit && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Check in"
                          className="size-8 cursor-pointer"
                          onClick={() => onCheckIn(current)}
                        >
                          <TrendingUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Edit goal"
                          className="size-8 cursor-pointer"
                          onClick={() => onEditGoal(current)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </>
                    )}
                    {canDelete && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Delete goal"
                        className="size-8 cursor-pointer text-destructive hover:text-destructive"
                        onClick={() => setConfirmOpen(true)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge
                    color={GOAL_STATUS_COLORS[current.status]}
                    label={GOAL_STATUS_LABELS[current.status]}
                  />
                  <StatusBadge
                    color={GOAL_PRIORITY_COLORS[current.priority]}
                    label={GOAL_PRIORITY_LABELS[current.priority]}
                  />
                  {current.isOverdue && <StatusBadge color="red" label="Overdue" />}
                  {current.isDueSoon && <StatusBadge color="amber" label="Due soon" />}
                  {current.isArchived && <StatusBadge color="zinc" label="Archived" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">
                      {GOAL_PROGRESS_MODE_LABELS[current.progressMode]}
                    </span>
                    <span className="font-medium tabular-nums">{current.progress}%</span>
                  </div>
                  <Progress value={current.progress} className="h-2" />
                </div>
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {current.description && (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {current.description}
                  </p>
                )}

                {current.progressMode === "AUTO" ? (
                  <div className="mt-4 space-y-2">
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      <Target className="size-4 text-muted-foreground" aria-hidden />
                      Key results
                    </p>
                    {current.keyResults.length === 0 && (
                      <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                        No key results yet.
                      </p>
                    )}
                    {current.keyResults.map((keyResult) => (
                      <div key={keyResult._id} className="space-y-1.5 rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 text-sm font-medium">{keyResult.title}</p>
                          <span className="shrink-0 text-xs font-medium tabular-nums">
                            {keyResult.progress}%
                          </span>
                        </div>
                        <Progress value={keyResult.progress} className="h-1.5" />
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>
                            {describeMetric(
                              keyResult.currentValue,
                              keyResult.targetValue,
                              keyResult.metricType,
                              keyResult.unit
                            )}
                          </span>
                          <span>
                            {keyResult.owner?.name ?? "Unassigned"}
                            {keyResult.dueDate ? ` · ${formatDate(keyResult.dueDate)}` : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border p-3">
                    <p className="text-sm font-medium">
                      {describeMetric(
                        current.metric.currentValue,
                        current.metric.targetValue,
                        current.metric.metricType,
                        current.metric.unit
                      )}
                    </p>
                    <Progress value={current.metric.progress} className="mt-2 h-1.5" />
                  </div>
                )}

                <Separator className="my-4" />

                <dl className="divide-y">
                  <DetailRow label="Accountable">{current.owner?.name ?? "Unassigned"}</DetailRow>
                  <DetailRow label="Working on it">
                    {current.members.length > 0
                      ? current.members.map((member) => member.name).join(", ")
                      : "Nobody yet"}
                  </DetailRow>
                  <DetailRow label="Department">{current.department?.name ?? "—"}</DetailRow>
                  <DetailRow label="Rolls up into">
                    {current.parentGoal ? `${current.parentGoal.code} · ${current.parentGoal.title}` : "—"}
                  </DetailRow>
                  <DetailRow label="Work happens on">
                    {current.board ? (
                      <ColorChip color={current.board.color} label={current.board.name} />
                    ) : (
                      "—"
                    )}
                  </DetailRow>
                  <DetailRow label="Tags">
                    <TagList tags={current.tags} className="justify-end" />
                  </DetailRow>
                  <DetailRow label="Runs">
                    {formatDate(current.startDate)} → {formatDate(current.dueDate)}
                  </DetailRow>
                  <DetailRow label="Last check-in">
                    {current.lastCheckInAt ? formatDateTime(current.lastCheckInAt) : "None yet"}
                  </DetailRow>
                </dl>

                {current.checkIns.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <p className="mb-2 text-sm font-medium">Check-ins</p>
                    <ul className="space-y-2">
                      {current.checkIns.map((checkIn) => (
                        <li key={checkIn._id} className="rounded-lg border p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <StatusBadge
                              color={GOAL_STATUS_COLORS[checkIn.status]}
                              label={GOAL_STATUS_LABELS[checkIn.status]}
                            />
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {checkIn.progress}% · {formatDateTime(checkIn.recordedAt)}
                            </span>
                          </div>
                          {checkIn.note && (
                            <p className="mt-2 whitespace-pre-wrap text-sm">{checkIn.note}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete "${current?.title ?? ""}"?`}
        description="Its key results and check-ins go with it, and any goal rolling up into it stands on its own. Archive it instead if you may want it back."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
