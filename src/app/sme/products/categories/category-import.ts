import type { ProductCategoryPayload } from "@/types/domain/productCategory";

export interface ImportColumn {
  header: string;
  required: boolean;
  hint: string;
  example: string;
}

export const CATEGORY_IMPORT_COLUMNS: ImportColumn[] = [
  {
    header: "Name",
    required: true,
    hint: "Must be unique in your catalogue",
    example: "Electronics",
  },
  { header: "Code", required: false, hint: "Short code, uppercased", example: "ELEC" },
  { header: "Colour", required: false, hint: "Hex colour like #0ea5e9", example: "#0ea5e9" },
  {
    header: "Description",
    required: false,
    hint: "What belongs in this category",
    example: "Phones, laptops and accessories",
  },
  {
    header: "Active",
    required: false,
    hint: "Yes or No, defaults to Yes",
    example: "Yes",
  },
];

export interface CategoryImportRow {
  line: number;
  name: string;
  code: string;
  payload: ProductCategoryPayload | null;
  errors: string[];
}

export interface CategoryImportPreview {
  rows: CategoryImportRow[];
  ready: CategoryImportRow[];
  rejected: CategoryImportRow[];
  missingHeaders: string[];
}

export const normalizeKey = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

export const parseBoolean = (value: string, label: string, errors: string[]): boolean | null => {
  const text = value.trim().toLowerCase();
  if (!text) return null;
  if (["yes", "y", "true", "1", "active"].includes(text)) return true;
  if (["no", "n", "false", "0", "inactive"].includes(text)) return false;
  errors.push(`${label} must be Yes or No`);
  return null;
};

export const parseColour = (value: string, errors: string[]): string | null => {
  const text = value.trim();
  if (!text) return null;

  const withHash = text.startsWith("#") ? text : `#${text}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(withHash)) {
    errors.push("Colour must be a hex value like #0ea5e9");
    return null;
  }

  return withHash.toLowerCase();
};

export const buildCategoryImportPreview = (
  headers: string[],
  rows: string[][],
  existingNames: string[]
): CategoryImportPreview => {
  const headerIndex = new Map(headers.map((header, index) => [normalizeKey(header), index]));

  const missingHeaders = CATEGORY_IMPORT_COLUMNS.filter(
    (column) => column.required && !headerIndex.has(normalizeKey(column.header))
  ).map((column) => column.header);

  if (missingHeaders.length > 0) {
    return { rows: [], ready: [], rejected: [], missingHeaders };
  }

  const taken = new Set(existingNames.map(normalizeKey));
  const seen = new Set<string>();

  const parsed = rows.map<CategoryImportRow>((cells, index) => {
    const cell = (header: string): string => {
      const position = headerIndex.get(normalizeKey(header));
      return position === undefined ? "" : (cells[position] ?? "").trim();
    };

    const errors: string[] = [];

    const name = cell("Name");
    const code = cell("Code");

    if (!name) {
      errors.push("Name is required");
    } else if (seen.has(normalizeKey(name))) {
      errors.push("This name appears more than once in the file");
    } else if (taken.has(normalizeKey(name))) {
      errors.push("A category with this name already exists");
    } else {
      seen.add(normalizeKey(name));
    }

    const colour = parseColour(cell("Colour"), errors);
    const isActive = parseBoolean(cell("Active"), "Active", errors);

    const line = index + 2;

    if (errors.length > 0) {
      return { line, name, code, payload: null, errors };
    }

    const payload: ProductCategoryPayload = {
      name,
      ...(code ? { code } : {}),
      ...(colour ? { color: colour } : {}),
      ...(cell("Description") ? { description: cell("Description") } : {}),
      ...(isActive === null ? {} : { isActive }),
    };

    return { line, name, code, payload, errors };
  });

  return {
    rows: parsed,
    ready: parsed.filter((row) => row.payload !== null),
    rejected: parsed.filter((row) => row.payload === null),
    missingHeaders: [],
  };
};
