import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateLeaveTypesMutation } from "@/redux/apis/aiApis";
import { useCreateLeaveTypeMutation } from "@/redux/apis/leaveTypeApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import type { AiLeaveTypeDraft } from "@/types/domain/ai";
import { LEAVE_ACCRUAL_LABELS, LEAVE_GENDER_LABELS } from "@/types/domain/leaveType";
import { Loader2, RefreshCcw, Sparkles } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface AiLeaveTypesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remaining: number | null;
}

const MAX_DRAFTS = 15;

export function AiLeaveTypesModal({ open, onOpenChange, remaining }: AiLeaveTypesModalProps) {
  const allowed = Math.max(1, Math.min(MAX_DRAFTS, remaining ?? MAX_DRAFTS));

  const [count, setCount] = React.useState(Math.min(6, allowed));
  const [context, setContext] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [paidOnly, setPaidOnly] = React.useState(false);
  const [drafts, setDrafts] = React.useState<AiLeaveTypeDraft[]>([]);
  const [picked, setPicked] = React.useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  const [generate, { isLoading: isGenerating }] = useGenerateLeaveTypesMutation();
  const [createLeaveType] = useCreateLeaveTypeMutation();

  const [seededFor, setSeededFor] = React.useState(false);
  if (seededFor !== open) {
    setSeededFor(open);
    setDrafts([]);
    setPicked({});
    setContext("");
    setCountry("");
    setPaidOnly(false);
    setCount(Math.min(6, allowed));
  }

  const selected = drafts.filter((_, index) => picked[index]);
  const overAllowance = remaining !== null && selected.length > remaining;

  const onGenerate = async () => {
    try {
      const result = await generate({
        count,
        context: context.trim() || undefined,
        country: country.trim() || undefined,
        paidOnly: paidOnly || undefined,
      }).unwrap();
      setDrafts(result);
      setPicked(Object.fromEntries(result.map((_, index) => [index, true])));
      if (result.length === 0) toast.info("The AI did not return any leave types, try again");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not reach the AI service");
    }
  };

  const onSave = async () => {
    setIsSaving(true);
    const failures: string[] = [];

    for (const draft of selected) {
      try {
        await createLeaveType({
          name: draft.name,
          code: draft.code,
          color: draft.color,
          description: draft.description,
          daysPerYear: draft.daysPerYear,
          isPaid: draft.isPaid,
          accrual: draft.accrual,
          carryForward: draft.carryForward,
          applicableGender: draft.applicableGender,
          requiresDocument: draft.requiresDocument,
          documentAfterDays: draft.documentAfterDays,
          noticeDays: draft.noticeDays,
          isActive: true,
        }).unwrap();
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        failures.push(`${draft.name}: ${err?.data?.message ?? "failed"}`);
      }
    }

    setIsSaving(false);
    const saved = selected.length - failures.length;
    if (saved > 0) toast.success(`${saved} leave type${saved === 1 ? "" : "s"} created`);
    if (failures.length > 0) {
      toast.error(`${failures.length} could not be created`, { description: failures[0] });
    }
    if (failures.length === 0) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate leave types with AI</DialogTitle>
          <DialogDescription>
            Say where you operate and what the company does, and the AI will draft the entitlements
            it should offer. Nothing is saved until you review the draft below.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="ai-leave-type-count">How many</Label>
              <Input
                id="ai-leave-type-count"
                type="number"
                min={1}
                max={allowed}
                value={count}
                onChange={(event) =>
                  setCount(Math.min(allowed, Math.max(1, Number(event.target.value) || 1)))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-leave-type-country">Follow the law of (optional)</Label>
              <Input
                id="ai-leave-type-country"
                value={country}
                maxLength={60}
                placeholder="Leave blank to use your registered country"
                onChange={(event) => setCountry(event.target.value)}
              />
            </div>
          </div>

          {remaining !== null && (
            <p className="text-xs text-muted-foreground">Your plan has room for {remaining} more.</p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="ai-leave-type-context">What does the company do? (optional)</Label>
            <Textarea
              id="ai-leave-type-context"
              value={context}
              maxLength={300}
              rows={2}
              placeholder="A garment manufacturer exporting to Europe, about 200 staff"
              onChange={(event) => setContext(event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <div className="min-w-0 pr-3">
              <p className="text-sm font-medium">Paid leave only</p>
              <p className="text-xs text-muted-foreground">
                Leave unpaid absence out of the suggestions.
              </p>
            </div>
            <Switch
              checked={paidOnly}
              onCheckedChange={setPaidOnly}
              className="cursor-pointer"
              aria-label="Paid leave only"
            />
          </div>

          <Button
            type="button"
            variant={drafts.length > 0 ? "outline" : "default"}
            className="w-full cursor-pointer"
            disabled={isGenerating || isSaving}
            onClick={onGenerate}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : drafts.length > 0 ? (
              <RefreshCcw className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {isGenerating ? "Generating..." : drafts.length > 0 ? "Regenerate" : "Generate"}
          </Button>

          {drafts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{selected.length}</span> of{" "}
                  {drafts.length} selected
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 cursor-pointer text-xs"
                  onClick={() =>
                    setPicked(
                      selected.length === drafts.length
                        ? {}
                        : Object.fromEntries(drafts.map((_, index) => [index, true]))
                    )
                  }
                >
                  {selected.length === drafts.length ? "Clear all" : "Select all"}
                </Button>
              </div>

              <div className="max-h-64 divide-y overflow-y-auto rounded-lg border">
                {drafts.map((draft, index) => (
                  <label
                    key={`${draft.name}-${index}`}
                    className="flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={picked[index] ?? false}
                      onCheckedChange={(checked) =>
                        setPicked((previous) => ({ ...previous, [index]: checked === true }))
                      }
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: draft.color }}
                        />
                        <span className="text-sm font-medium">{draft.name}</span>
                        <span className="font-mono text-[10px] uppercase text-muted-foreground">
                          {draft.code}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {draft.daysPerYear} day{draft.daysPerYear === 1 ? "" : "s"} a year
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {draft.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {draft.description}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {LEAVE_ACCRUAL_LABELS[draft.accrual]} ·{" "}
                        {LEAVE_GENDER_LABELS[draft.applicableGender]}
                        {draft.carryForward ? " · Carries forward" : ""}
                        {draft.requiresDocument ? " · Proof required" : ""}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              {overAllowance && (
                <p className="text-xs text-amber-600">
                  Your plan has room for {remaining} more. Unselect a few or the rest will fail.
                </p>
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
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={selected.length === 0 || isSaving || isGenerating}
            onClick={onSave}
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            Create {selected.length > 0 ? selected.length : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
