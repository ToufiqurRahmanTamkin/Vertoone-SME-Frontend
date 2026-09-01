import envConfig from "@/config/envConfig";
import type { Block, BlockDefinition, BlockField } from "@/types/domain/webBuilder";

const API_SUFFIX_RE = /\/api\/v\d+$/i;

export const siteOrigin = (): string => envConfig.serverURL.replace(API_SUFFIX_RE, "");

export const absoluteSiteUrl = (publicUrl: string, publicPath: string): string =>
  publicUrl || `${siteOrigin()}${publicPath}`;

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

export const defaultPropsOf = (fields: BlockField[]): Record<string, unknown> =>
  Object.fromEntries(fields.map((field) => [field.key, cloneValue(field.defaultValue)]));

export const blockFromDefinition = (definition: BlockDefinition): Block => ({
  id: newBlockId(),
  type: definition.type,
  hidden: false,
  layout: { ...definition.layout },
  props: defaultPropsOf(definition.fields),
});

export const duplicateBlock = (block: Block): Block => ({
  ...cloneValue(block),
  id: newBlockId(),
});

export const insertBlock = (blocks: Block[], block: Block, afterId: string): Block[] => {
  const index = blocks.findIndex((entry) => entry.id === afterId);
  if (index < 0) return [...blocks, block];
  return [...blocks.slice(0, index + 1), block, ...blocks.slice(index + 1)];
};

export const moveBlock = (
  blocks: Block[],
  id: string,
  targetId: string,
  position: "before" | "after"
): Block[] => {
  const from = blocks.findIndex((block) => block.id === id);
  const target = blocks.findIndex((block) => block.id === targetId);
  if (from < 0 || target < 0 || from === target) return blocks;

  const without = blocks.filter((block) => block.id !== id);
  const anchor = without.findIndex((block) => block.id === targetId);
  const at = position === "after" ? anchor + 1 : anchor;

  return [...without.slice(0, at), blocks[from], ...without.slice(at)];
};

export const reorderBlocks = (blocks: Block[], activeId: string, overId: string): Block[] => {
  const from = blocks.findIndex((block) => block.id === activeId);
  const to = blocks.findIndex((block) => block.id === overId);
  if (from < 0 || to < 0 || from === to) return blocks;

  const next = [...blocks];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const shiftBlock = (blocks: Block[], id: string, offset: number): Block[] => {
  const from = blocks.findIndex((block) => block.id === id);
  const to = from + offset;
  if (from < 0 || to < 0 || to >= blocks.length) return blocks;

  const next = [...blocks];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const updateBlock = (blocks: Block[], id: string, patch: Partial<Block>): Block[] =>
  blocks.map((block) => (block.id === id ? { ...block, ...patch } : block));

export const withProp = (block: Block, key: string, value: unknown): Block => ({
  ...block,
  props: { ...block.props, [key]: value },
});

export const groupDefinitions = (
  definitions: BlockDefinition[]
): { group: string; blocks: BlockDefinition[] }[] => {
  const groups = new Map<string, BlockDefinition[]>();

  definitions.forEach((definition) => {
    const bucket = groups.get(definition.group) ?? [];
    bucket.push(definition);
    groups.set(definition.group, bucket);
  });

  return [...groups.entries()].map(([group, blocks]) => ({ group, blocks }));
};
