import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateGoalDraftMutation } from "@/redux/apis/aiApis";
import { useCreateGoalMutation } from "@/redux/apis/goalApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import type { AiGoalDraft } from "@/types/domain/ai";
import {
  GOAL_CATEGORIES,
  GOAL_CATEGORY_LABELS,
  GOAL_PRIORITY_COLORS,
  GOAL_PRIORITY_LABELS,
  type GoalCategory,
} from "@/types/domain/goal";
import { Loader2, RefreshCcw, Sparkles, Target } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface AiGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HORIZONS = ["This quarter", "This half", "This year", "Next 30 days"];

const metricLabel = (draft: { unit: string; startValue: number; targetValue: number }): string =>
  `${draft.startValue} → ${draft.targetValue}${draft.unit ? ` ${draft.unit}` : ""}`;

export function AiGoalModal({ open, onOpenChange }: AiGoalModalProps) {
  const [prompt, setPrompt] = React.useState("");
  const [category, setCategory] = React.useState<GoalCategory>("COMPANY");
  const [keyResultCount, setKeyResultCount] = React.useState(3);
  const [horizon, setHorizon] = React.useState(HORIZONS[0]);
  const [draft, setDraft] = React.useState<AiGoalDraft | null>(null);
  const [title, setTitle] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");

  const [generate, { isLoading: isGenerating }] = useGenerateGoalDraftMutation();
  const [createGoal, { isLoading: isSaving }] = useCreateGoalMutation();

  const [seededFor, setSeededFor] = React.useState(false);
  if (seededFor !== open) {
    setSeededFor(open);
    setDraft(null);
    setTitle("");
    setDueDate("");
  }

  const onGenerate = async () => {
    try {
      const result = await generate({
        prompt: prompt.trim(),
        category,
        keyResultCount,
        horizon,
      }).unwrap();
      setDraft(result);
      setTitle(result.title);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not reach the AI service");
    }
  };

  const onSave = async () => {
    if (!draft) return;
    try {
      const goal = await createGoal({
        title: title.trim() || draft.title,
        description: draft.description,
        color: draft.color,
        category: draft.category,
        priority: draft.priority,
        metricType: draft.metricType,
        unit: draft.unit,
        startValue: draft.startValue,
        targetValue: draft.targetValue,
        currentValue: draft.startValue,
        dueDate: dueDate || null,
        keyResults: draft.keyResults.map((keyResult) => ({
          title: keyResult.title,
          metricType: keyResult.metricType,
          unit: keyResult.unit,
          startValue: keyResult.startValue,
          targetValue: keyResult.targetValue,
          currentValue: keyResult.startValue,
        })),
      }).unwrap();

      toast.success(`"${goal.title}" created`, {
        description:
          draft.keyResults.length > 0
            ? `${draft.keyResults.length} key results added`
            : undefined,
      });
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not create the goal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a goal with AI</DialogTitle>
          <DialogDescription>
            Say what you are trying to move and the AI turns it into a measurable goal with key
            results. Nothing is saved until you review it below.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ai-goal-prompt">What are you trying to achieve?</Label>
            <Textarea
              id="ai-goal-prompt"
              value={prompt}
              maxLength={500}
              rows={3}
              placeholder="Cut the time it takes support to first-respond, and lift our CSAT with it"
              onChange={(event) => setPrompt(event.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="ai-goal-category">Level</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as GoalCategory)}
              >
                <SelectTrigger id="ai-goal-category" className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map((option) => (
                    <SelectItem key={option} value={option} className="cursor-pointer">
                      {GOAL_CATEGORY_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-goal-horizon">Horizon</Label>
              <Select value={horizon} onValueChange={setHorizon}>
                <SelectTrigger id="ai-goal-horizon" className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HORIZONS.map((option) => (
                    <SelectItem key={option} value={option} className="cursor-pointer">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-goal-krs">Key results</Label>
              <Input
                id="ai-goal-krs"
                type="number"
                min={0}
                max={8}
                value={keyResultCount}
                onChange={(event) =>
                  setKeyResultCount(Math.min(8, Math.max(0, Number(event.target.value) || 0)))
                }
              />
            </div>
          </div>

          <Button
            type="button"
            variant={draft ? "outline" : "default"}
            className="w-full cursor-pointer"
            disabled={isGenerating || isSaving || prompt.trim().length < 3}
            onClick={onGenerate}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : draft ? (
              <RefreshCcw className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {isGenerating ? "Drafting..." : draft ? "Regenerate" : "Draft the goal"}
          </Button>

          {draft && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
                <div className="space-y-1.5">
                  <Label htmlFor="ai-goal-title">Goal</Label>
                  <Input
                    id="ai-goal-title"
                    value={title}
                    maxLength={160}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ai-goal-due">Due date (optional)</Label>
                  <Input
                    id="ai-goal-due"
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                  />
                </div>
              </div>

              {draft.description && (
                <p className="text-xs text-muted-foreground">{draft.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-1.5">
                <ColorChip color={draft.color} label={GOAL_CATEGORY_LABELS[draft.category]} />
                <StatusBadge
                  color={GOAL_PRIORITY_COLORS[draft.priority]}
                  label={GOAL_PRIORITY_LABELS[draft.priority]}
                />
                <Badge variant="secondary" className="text-[10px]">
                  {draft.metricType} · {metricLabel(draft)}
                </Badge>
              </div>

              {draft.keyResults.length > 0 && (
                <div className="max-h-56 divide-y overflow-y-auto rounded-lg border">
                  {draft.keyResults.map((keyResult, index) => (
                    <div
                      key={`${keyResult.title}-${index}`}
                      className="flex items-start gap-2.5 px-3 py-2.5"
                    >
                      <Target className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{keyResult.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {keyResult.metricType} · {metricLabel(keyResult)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Badge variant="secondary" className="text-[10px]">
                Review before saving — AI drafts can be wrong
              </Badge>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={!draft || isSaving || isGenerating}
            onClick={onSave}
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            Create goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
