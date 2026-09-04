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
import { Textarea } from "@/components/ui/textarea";
import { useGenerateAssetCategoriesMutation } from "@/redux/apis/aiApis";
import { useCreateAssetCategoryMutation } from "@/redux/apis/assetApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import type { AiAssetCategoryDraft } from "@/types/domain/ai";
import { Loader2, RefreshCcw, Sparkles } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface AiAssetCategoriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remaining: number | null;
}

const MAX_DRAFTS = 20;

export function AiAssetCategoriesModal({
  open,
  onOpenChange,
  remaining,
}: AiAssetCategoriesModalProps) {
  const allowed = Math.max(1, Math.min(MAX_DRAFTS, remaining ?? MAX_DRAFTS));

  const [count, setCount] = React.useState(Math.min(6, allowed));
  const [context, setContext] = React.useState("");
  const [drafts, setDrafts] = React.useState<AiAssetCategoryDraft[]>([]);
  const [picked, setPicked] = React.useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  const [generate, { isLoading: isGenerating }] = useGenerateAssetCategoriesMutation();
  const [createCategory] = useCreateAssetCategoryMutation();

  const [seededFor, setSeededFor] = React.useState(false);
  if (seededFor !== open) {
    setSeededFor(open);
    setDrafts([]);
    setPicked({});
    setCount(Math.min(6, allowed));
  }

  const selected = drafts.filter((_, index) => picked[index]);
  const overAllowance = remaining !== null && selected.length > remaining;

  const onGenerate = async () => {
    try {
      const result = await generate({
        count,
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
          code: draft.code,
          description: draft.description,
          color: draft.color,
          usefulLifeMonths: draft.usefulLifeMonths,
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
          <DialogTitle>Generate asset categories with AI</DialogTitle>
          <DialogDescription>
            Describe what the company does and the AI will suggest the kinds of equipment worth
            tracking, with a useful life for each. Nothing is saved until you review the draft
            below.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ai-asset-category-count">How many</Label>
            <Input
              id="ai-asset-category-count"
              type="number"
              min={1}
              max={allowed}
              className="w-28"
              value={count}
              onChange={(event) =>
                setCount(Math.min(allowed, Math.max(1, Number(event.target.value) || 1)))
              }
            />
            {remaining !== null && (
              <p className="text-xs text-muted-foreground">
                Your plan has room for {remaining} more.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ai-asset-category-context">
              What does the company do? (optional)
            </Label>
            <Textarea
              id="ai-asset-category-context"
              value={context}
              maxLength={300}
              rows={2}
              placeholder="A software house of about 60 people, everyone on laptops, one meeting room"
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
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: draft.color }}
                        />
                        <span className="text-sm font-medium">{draft.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {draft.code}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {draft.usefulLifeMonths} months
                        </Badge>
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {draft.description}
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
