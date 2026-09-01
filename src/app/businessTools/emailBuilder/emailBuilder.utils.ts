import type {
  EmailBlock,
  EmailBlockDefinition,
  EmailBlockField,
} from "@/types/domain/emailBuilder";

export const newBlockId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const cloneValue = <T>(value: T): T => {
  if (Array.isArray(value)) return value.map((entry) => cloneValue(entry)) as unknown as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        cloneValue(entry),
      ])
    ) as T;
  }
  return value;
};

export const defaultPropsOf = (fields: EmailBlockField[]): Record<string, unknown> =>
  Object.fromEntries(fields.map((field) => [field.key, cloneValue(field.defaultValue)]));

export const blockFromDefinition = (definition: EmailBlockDefinition): EmailBlock => ({
  id: newBlockId(),
  type: definition.type,
  hidden: false,
  layout: { ...definition.layout },
  props: defaultPropsOf(definition.fields),
});

export const duplicateBlock = (block: EmailBlock): EmailBlock => ({
  ...cloneValue(block),
  id: newBlockId(),
});

export const insertBlockAt = (
  blocks: EmailBlock[],
  block: EmailBlock,
  index?: number
): EmailBlock[] =>
  index === undefined
    ? [...blocks, block]
    : [...blocks.slice(0, index), block, ...blocks.slice(index)];

export const moveBlock = (
  blocks: EmailBlock[],
  id: string,
  targetId: string,
  position: "before" | "after"
): EmailBlock[] => {
  const from = blocks.findIndex((block) => block.id === id);
  const target = blocks.findIndex((block) => block.id === targetId);
  if (from < 0 || target < 0 || from === target) return blocks;

  const without = blocks.filter((block) => block.id !== id);
  const anchor = without.findIndex((block) => block.id === targetId);
  const at = position === "after" ? anchor + 1 : anchor;

  return [...without.slice(0, at), blocks[from], ...without.slice(at)];
};

export const reorderBlocks = (
  blocks: EmailBlock[],
  activeId: string,
  overId: string
): EmailBlock[] => {
  const from = blocks.findIndex((block) => block.id === activeId);
  const to = blocks.findIndex((block) => block.id === overId);
  if (from < 0 || to < 0 || from === to) return blocks;

  const next = [...blocks];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const groupDefinitions = (
  definitions: EmailBlockDefinition[]
): { group: string; blocks: EmailBlockDefinition[] }[] => {
  const groups = new Map<string, EmailBlockDefinition[]>();

  definitions.forEach((definition) => {
    const bucket = groups.get(definition.group) ?? [];
    bucket.push(definition);
    groups.set(definition.group, bucket);
  });

  return [...groups.entries()].map(([group, blocks]) => ({ group, blocks }));
};

export const titleCase = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const relativeDate = (value: string | null, emptyLabel: string): string => {
  if (!value) return emptyLabel;

  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;

  return new Date(value).toLocaleDateString();
};

const EMAIL_PATTERN = /[^\s,;<>()[\]]+@[^\s,;<>()[\]]+\.[^\s,;<>()[\]]+/g;

export const parseEmailList = (value: string): string[] => {
  const found = value.match(EMAIL_PATTERN) ?? [];
  const seen = new Set<string>();

  return found
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => {
      if (seen.has(entry)) return false;
      seen.add(entry);
      return true;
    });
};
