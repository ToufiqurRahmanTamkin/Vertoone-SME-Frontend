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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FINANCE_CATEGORY_TYPE_COLORS } from "@/constant";
import { StatusBadge } from "@/components/shared/status-badge";
import { useGenerateFinanceCategoriesMutation } from "@/redux/apis/aiApis";
import { useCreateFinanceCategoryMutation } from "@/redux/apis/financeApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import type { AiGeneratedCategory } from "@/types/domain/ai";
import type { FinanceCategoryType } from "@/types/domain/finance";
import { Loader2, RefreshCcw, Sparkles } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface AiCategoriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_OPTIONS = [
  { label: "Both income and expense", value: "BOTH" },
  { label: "Income only", value: "INCOME" },
  { label: "Expense only", value: "EXPENSE" },
];

export function AiCategoriesModal({ open, onOpenChange }: AiCategoriesModalProps) {
  const [count, setCount] = React.useState(6);
  const [type, setType] = React.useState<FinanceCategoryType | "BOTH">("BOTH");
  const [context, setContext] = React.useState("");
  const [drafts, setDrafts] = React.useState<AiGeneratedCategory[]>([]);
  const [picked, setPicked] = React.useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  const [generate, { isLoading: isGenerating }] = useGenerateFinanceCategoriesMutation();
  const [createCategory] = useCreateFinanceCategoryMutation();

  const [seededFor, setSeededFor] = React.useState(false);
  if (seededFor !== open) {
    setSeededFor(open);
    setDrafts([]);
    setPicked({});
  }

  const selected = drafts.filter((_, index) => picked[index]);

  const onGenerate = async () => {
    try {
      const result = await generate({
        count,
        type,
        context: context.trim() || undefined,
      }).unwrap();
      setDrafts(result);
      setPicked(Object.fromEntries(result.map((_, index) => [index, true])));
      if (result.length === 0) toast.info("The AI did not return any categories, try again");
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
        await createCategory({
          name: draft.name,
          type: draft.type,
          description: draft.description,
          isActive: true,
        }).unwrap();
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        failures.push(`${draft.name}: ${err?.data?.message ?? "failed"}`);
      }
    }

    setIsSaving(false);
    const saved = selected.length - failures.length;
    if (saved > 0) toast.success(`${saved} categor${saved === 1 ? "y" : "ies"} created`);
    if (failures.length > 0) {
      toast.error(`${failures.length} could not be created`, { description: failures[0] });
    }
    if (failures.length === 0) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Generate categories with AI
          </DialogTitle>
          <DialogDescription>
            Describe what the ledger is for and pick how many heads you want. Nothing is saved
            until you review the draft below.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="ai-count">How many</Label>
              <Input
                id="ai-count"
                type="number"
                min={1}
                max={25}
                value={count}
                onChange={(event) =>
                  setCount(Math.min(25, Math.max(1, Number(event.target.value) || 1)))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
                <SelectTrigger id="ai-type" className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ai-context">What is this ledger for? (optional)</Label>
            <Input
              id="ai-context"
              value={context}
              maxLength={300}
              placeholder="A B2B SaaS platform selling subscription software"
              onChange={(event) => setContext(event.target.value)}
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
                        <span className="text-sm font-medium">{draft.name}</span>
                        <StatusBadge
                          color={FINANCE_CATEGORY_TYPE_COLORS[draft.type]}
                          label={draft.type}
                        />
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {draft.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
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
