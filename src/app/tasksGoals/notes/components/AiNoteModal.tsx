import { ColorChip } from "@/components/shared/color-chip";
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
import { useGenerateNoteDraftMutation } from "@/redux/apis/aiApis";
import { useCreateNoteMutation } from "@/redux/apis/noteApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import type { AiNoteDraft } from "@/types/domain/ai";
import { NOTE_VISIBILITY_LABELS } from "@/types/domain/note";
import { Loader2, RefreshCcw, Sparkles } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface AiNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FORMATS = [
  "a short brief",
  "meeting minutes",
  "a checklist",
  "a how-to guide",
  "a decision record",
];

const TONES = ["neutral", "concise", "detailed", "friendly"];

export function AiNoteModal({ open, onOpenChange }: AiNoteModalProps) {
  const [prompt, setPrompt] = React.useState("");
  const [format, setFormat] = React.useState(FORMATS[0]);
  const [tone, setTone] = React.useState(TONES[0]);
  const [draft, setDraft] = React.useState<AiNoteDraft | null>(null);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  const [generate, { isLoading: isGenerating }] = useGenerateNoteDraftMutation();
  const [createNote, { isLoading: isSaving }] = useCreateNoteMutation();

  const [seededFor, setSeededFor] = React.useState(false);
  if (seededFor !== open) {
    setSeededFor(open);
    setDraft(null);
    setTitle("");
    setContent("");
  }

  const onGenerate = async () => {
    try {
      const result = await generate({ prompt: prompt.trim(), format, tone }).unwrap();
      setDraft(result);
      setTitle(result.title);
      setContent(result.content);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not reach the AI service");
    }
  };

  const onSave = async () => {
    if (!draft) return;
    try {
      const note = await createNote({
        title: title.trim() || draft.title,
        content: content.trim(),
        color: draft.color,
        visibility: draft.visibility,
      }).unwrap();

      toast.success(`"${note.title}" created`);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not create the note");
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Write a note with AI</DialogTitle>
          <DialogDescription>
            Say what the note is about and the AI drafts it. Edit the text before you save —
            nothing is stored until you do.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ai-note-prompt">What is the note about?</Label>
            <Textarea
              id="ai-note-prompt"
              value={prompt}
              maxLength={500}
              rows={3}
              placeholder="How we handle a customer refund request, from first message to the money leaving"
              onChange={(event) => setPrompt(event.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ai-note-format">Shape it as</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="ai-note-format" className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((option) => (
                    <SelectItem key={option} value={option} className="cursor-pointer">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-note-tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="ai-note-tone" className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((option) => (
                    <SelectItem key={option} value={option} className="cursor-pointer">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            {isGenerating ? "Writing..." : draft ? "Rewrite" : "Write the note"}
          </Button>

          {draft && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ai-note-title">Title</Label>
                <Input
                  id="ai-note-title"
                  value={title}
                  maxLength={160}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-note-content">Body</Label>
                  <span className="text-xs text-muted-foreground">{wordCount} words</span>
                </div>
                <Textarea
                  id="ai-note-content"
                  value={content}
                  rows={12}
                  onChange={(event) => setContent(event.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <ColorChip
                  color={draft.color}
                  label={NOTE_VISIBILITY_LABELS[draft.visibility]}
                />
                {draft.tagSuggestions.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
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
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={!draft || isSaving || isGenerating || !content.trim()}
            onClick={onSave}
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            Create note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
