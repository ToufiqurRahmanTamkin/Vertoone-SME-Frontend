import envConfig from "@/config/envConfig";
import type {
  FormField,
  FormFieldDefinition,
  SubmissionAnswer,
} from "@/types/domain/formBuilder";
import { toFieldKey } from "@/validations/formBuilder";

const API_SUFFIX_RE = /\/api\/v\d+$/i;

export const formOrigin = (): string => envConfig.serverURL.replace(API_SUFFIX_RE, "");

export const absoluteFormUrl = (publicUrl: string, publicPath: string): string =>
  publicUrl || `${formOrigin()}${publicPath}`;

export const newFieldId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `field-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

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

export const defaultSettingsOf = (
  definition: FormFieldDefinition
): Record<string, unknown> =>
  Object.fromEntries(
    definition.settings.map((setting) => [setting.key, cloneValue(setting.defaultValue)])
  );

export const uniqueKey = (base: string, taken: string[]): string => {
  const seed = toFieldKey(base) || "field";
  const used = new Set(taken);

  if (!used.has(seed)) return seed;

  let suffix = 2;
  while (used.has(`${seed}_${suffix}`)) suffix += 1;

  return `${seed}_${suffix}`;
};

export const fieldFromDefinition = (
  definition: FormFieldDefinition,
  existing: FormField[]
): FormField => ({
  id: newFieldId(),
  key: uniqueKey(
    definition.defaultKey,
    existing.map((field) => field.key)
  ),
  type: definition.type,
  label: definition.defaultLabel,
  placeholder: "",
  help: "",
  required: false,
  hidden: false,
  width: "FULL",
  options: definition.defaultOptions.map((entry) => ({ ...entry })),
  settings: defaultSettingsOf(definition),
});

export const duplicateField = (field: FormField, existing: FormField[]): FormField => ({
  ...cloneValue(field),
  id: newFieldId(),
  key: uniqueKey(
    field.key,
    existing.map((entry) => entry.key)
  ),
});

export const reorderFields = (
  fields: FormField[],
  activeId: string,
  overId: string
): FormField[] => {
  const from = fields.findIndex((field) => field.id === activeId);
  const to = fields.findIndex((field) => field.id === overId);
  if (from < 0 || to < 0 || from === to) return fields;

  const next = [...fields];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const insertFieldAt = (
  fields: FormField[],
  field: FormField,
  index?: number
): FormField[] =>
  index === undefined
    ? [...fields, field]
    : [...fields.slice(0, index), field, ...fields.slice(index)];

export const groupDefinitions = (
  definitions: FormFieldDefinition[]
): { group: string; fields: FormFieldDefinition[] }[] => {
  const groups = new Map<string, FormFieldDefinition[]>();

  definitions.forEach((definition) => {
    const bucket = groups.get(definition.group) ?? [];
    bucket.push(definition);
    groups.set(definition.group, bucket);
  });

  return [...groups.entries()].map(([group, fields]) => ({ group, fields }));
};

export const answerToText = (answer: SubmissionAnswer): string => {
  if (Array.isArray(answer.value)) return answer.value.join(", ");
  if (typeof answer.value === "boolean") return answer.value ? "Yes" : "No";
  if (answer.value === null) return "—";
  return String(answer.value);
};

export const answerableCount = (
  fields: FormField[],
  definitions: FormFieldDefinition[]
): number => {
  const collects = new Set(
    definitions.filter((definition) => definition.collectsAnswer).map((entry) => entry.type)
  );

  return fields.filter((field) => collects.has(field.type)).length;
};

export const embedSnippet = (url: string, title: string): string =>
  `<iframe src="${url}/embed" title="${title}" width="100%" height="720" style="border:0;max-width:100%" loading="lazy"></iframe>`;
