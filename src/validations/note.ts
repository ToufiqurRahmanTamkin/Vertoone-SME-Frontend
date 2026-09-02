import { MAX_NOTE_CONTENT, MAX_NOTE_SHARES, MAX_NOTE_TAGS, NOTE_VISIBILITIES } from "@/types/domain/note";
import { z } from "zod";
import { hexColorValidation } from "./color";

export const NoteSchema = z.object({
  title: z.string().trim().min(1, "A note needs a title").max(160),
  content: z.string().max(MAX_NOTE_CONTENT, "This note is too long to save"),
  color: hexColorValidation,
  visibility: z.enum(NOTE_VISIBILITIES),
  ownerId: z.string(),
  sharedWithIds: z.array(z.string()).max(MAX_NOTE_SHARES, `At most ${MAX_NOTE_SHARES} people`),
  tagIds: z.array(z.string()).max(MAX_NOTE_TAGS, `At most ${MAX_NOTE_TAGS} tags`),
  boardId: z.string(),
  reminderAt: z.string().trim(),
  isPinned: z.boolean(),
  isArchived: z.boolean(),
});

export type NoteFormValues = z.infer<typeof NoteSchema>;
