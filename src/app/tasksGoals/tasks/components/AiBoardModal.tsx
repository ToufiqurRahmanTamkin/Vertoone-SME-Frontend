import { StatusBadge } from "@/components/shared/status-badge";
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
import { useGenerateBoardDraftMutation } from "@/redux/apis/aiApis";
import { useCreateTaskBoardMutation, useCreateTaskMutation } from "@/redux/apis/taskApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import type { AiBoardDraft } from "@/types/domain/ai";
import { TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from "@/types/domain/task";
import { Loader2, RefreshCcw, Sparkles } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AiBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiBoardModal({ open, onOpenChange }: AiBoardModalProps) {
  const navigate = useNavigate();

  const [prompt, setPrompt] = React.useState("");
  const [listCount, setListCount] = React.useState(5);
  const [cardCount, setCardCount] = React.useState(8);
  const [includeCards, setIncludeCards] = React.useState(true);
  const [draft, setDraft] = React.useState<AiBoardDraft | null>(null);
  const [name, setName] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const [generate, { isLoading: isGenerating }] = useGenerateBoardDraftMutation();
  const [createBoard] = useCreateTaskBoardMutation();
  const [createTask] = useCreateTaskMutation();

  const [seededFor, setSeededFor] = React.useState(false);
  if (seededFor !== open) {
    setSeededFor(open);
    setDraft(null);
    setName("");
  }

  const onGenerate = async () => {
    try {
      const result = await generate({
        prompt: prompt.trim(),
        listCount,
        cardCount: includeCards ? cardCount : 0,
        includeCards,
      }).unwrap();
      setDraft(result);
      setName(result.name);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not reach the AI service");
    }
  };

  const onSave = async () => {
    if (!draft) return;
    setIsSaving(true);

    try {
      const board = await createBoard({
        name: name.trim() || draft.name,
        description: draft.description,
        color: draft.color,
        visibility: draft.visibility,
        lists: draft.lists.map((list) => ({
          name: list.name,
          color: list.color,
          isDoneList: list.isDoneList,
        })),
        labels: draft.labels.map((label) => ({ name: label.name, color: label.color })),
      }).unwrap();

      const listIdByName = new Map(
        board.lists.map((list) => [list.name.toLowerCase(), list._id])
      );

      let failedCards = 0;

      for (const card of draft.cards) {
        const listId = listIdByName.get(card.listName.toLowerCase()) ?? board.lists[0]?._id;
        if (!listId) continue;
        try {
          await createTask({
            boardId: board._id,
            listId,
            title: card.title,
            description: card.description,
            priority: card.priority,
          }).unwrap();
        } catch {
          failedCards += 1;
        }
      }

      toast.success(`"${board.name}" created`, {
        description:
          failedCards > 0
            ? `${draft.cards.length - failedCards} of ${draft.cards.length} cards added`
            : `${draft.lists.length} lists · ${draft.cards.length} cards`,
      });

      onOpenChange(false);
      navigate(`/company/tasks-and-goals/tasks/${board._id}`);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not create the board");
    } finally {
      setIsSaving(false);
    }
  };

  const cardsByList = React.useMemo(() => {
    const grouped = new Map<string, AiBoardDraft["cards"]>();
    (draft?.cards ?? []).forEach((card) => {
      const bucket = grouped.get(card.listName) ?? [];
      bucket.push(card);
      grouped.set(card.listName, bucket);
    });
    return grouped;
  }, [draft]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a board with AI</DialogTitle>
          <DialogDescription>
            Describe the work and the AI drafts the stages, labels and a set of starter cards.
            Nothing is saved until you review it below.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ai-board-prompt">What is this board for?</Label>
            <Textarea
              id="ai-board-prompt"
              value={prompt}
              maxLength={500}
              rows={3}
              placeholder="Launching our new mobile app in Q3 — design, build, QA and the store submission"
              onChange={(event) => setPrompt(event.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ai-board-lists">How many lists</Label>
              <Input
                id="ai-board-lists"
                type="number"
                min={3}
                max={8}
                value={listCount}
                onChange={(event) =>
                  setListCount(Math.min(8, Math.max(3, Number(event.target.value) || 3)))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-board-cards">How many starter cards</Label>
              <Input
                id="ai-board-cards"
                type="number"
                min={0}
                max={24}
                disabled={!includeCards}
                value={cardCount}
                onChange={(event) =>
                  setCardCount(Math.min(24, Math.max(0, Number(event.target.value) || 0)))
                }
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={includeCards}
              onCheckedChange={(checked) => setIncludeCards(checked === true)}
            />
            Draft starter cards as well as the lists
          </label>

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
            {isGenerating ? "Drafting..." : draft ? "Regenerate" : "Draft the board"}
          </Button>

          {draft && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ai-board-name">Board name</Label>
                <Input
                  id="ai-board-name"
                  value={name}
                  maxLength={80}
                  onChange={(event) => setName(event.target.value)}
                />
                {draft.description && (
                  <p className="text-xs text-muted-foreground">{draft.description}</p>
                )}
              </div>

              {draft.labels.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {draft.labels.map((label) => (
                    <span
                      key={label.name}
                      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="max-h-72 space-y-3 overflow-y-auto rounded-lg border p-3">
                {draft.lists.map((list) => {
                  const cards = cardsByList.get(list.name) ?? [];
                  return (
                    <div key={list.name}>
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: list.color }}
                        />
                        <span className="text-sm font-medium">{list.name}</span>
                        {list.isDoneList && <StatusBadge color="green" label="Done list" />}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {cards.length} card{cards.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      {cards.length > 0 && (
                        <ul className="mt-1.5 space-y-1.5 pl-4.5">
                          {cards.map((card, index) => (
                            <li
                              key={`${card.title}-${index}`}
                              className="rounded-md border bg-muted/30 px-2.5 py-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="min-w-0 text-xs font-medium">{card.title}</span>
                                <StatusBadge
                                  color={TASK_PRIORITY_COLORS[card.priority]}
                                  label={TASK_PRIORITY_LABELS[card.priority]}
                                />
                              </div>
                              {card.description && (
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                  {card.description}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
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
            Create board
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
