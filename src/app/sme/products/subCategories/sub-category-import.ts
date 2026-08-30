import {
  normalizeKey,
  parseBoolean,
  parseColour,
  type ImportColumn,
} from "@/app/sme/products/categories/category-import";
import type { ProductSubCategoryPayload } from "@/types/domain/productSubCategory";

export const SUB_CATEGORY_IMPORT_COLUMNS: ImportColumn[] = [
  {
    header: "Category",
    required: true,
    hint: "An existing category name. Create the category first",
    example: "Electronics",
  },
  {
    header: "Name",
    required: true,
    hint: "Must be unique inside its category",
    example: "Mobile phones",
  },
  { header: "Code", required: false, hint: "Short code, uppercased", example: "MOB" },
  { header: "Colour", required: false, hint: "Hex colour like #6366f1", example: "#6366f1" },
  {
    header: "Description",
    required: false,
    hint: "What belongs in this sub category",
    example: "Smartphones and feature phones",
  },
  { header: "Active", required: false, hint: "Yes or No, defaults to Yes", example: "Yes" },
];

export interface CategoryOption {
  _id: string;
  name: string;
}

export interface SubCategoryImportRow {
  line: number;
  name: string;
  categoryName: string;
  payload: ProductSubCategoryPayload | null;
  errors: string[];
}

export interface SubCategoryImportPreview {
  rows: SubCategoryImportRow[];
  ready: SubCategoryImportRow[];
  rejected: SubCategoryImportRow[];
  missingHeaders: string[];
}

export interface ExistingSubCategory {
  name: string;
  categoryId: string;
}

export const buildSubCategoryImportPreview = (
  headers: string[],
  rows: string[][],
  categories: CategoryOption[],
  existing: ExistingSubCategory[]
): SubCategoryImportPreview => {
  const headerIndex = new Map(headers.map((header, index) => [normalizeKey(header), index]));

  const missingHeaders = SUB_CATEGORY_IMPORT_COLUMNS.filter(
    (column) => column.required && !headerIndex.has(normalizeKey(column.header))
  ).map((column) => column.header);

  if (missingHeaders.length > 0) {
    return { rows: [], ready: [], rejected: [], missingHeaders };
  }

  const taken = new Set(existing.map((row) => `${row.categoryId}:${normalizeKey(row.name)}`));
  const seen = new Set<string>();

  const parsed = rows.map<SubCategoryImportRow>((cells, index) => {
    const cell = (header: string): string => {
      const position = headerIndex.get(normalizeKey(header));
      return position === undefined ? "" : (cells[position] ?? "").trim();
    };

    const errors: string[] = [];

    const categoryName = cell("Category");
    const name = cell("Name");
    const code = cell("Code");

    let categoryId = "";

    if (!categoryName) {
      errors.push("Category is required");
    } else {
      const match = categories.find(
        (option) => normalizeKey(option.name) === normalizeKey(categoryName)
      );
      if (match) {
        categoryId = match._id;
      } else {
        errors.push(`Category "${categoryName}" not found. Create it first, then import`);
      }
    }

    if (!name) {
      errors.push("Name is required");
    } else if (categoryId) {
      const key = `${categoryId}:${normalizeKey(name)}`;
      if (seen.has(key)) {
        errors.push("This name appears twice under the same category in the file");
      } else if (taken.has(key)) {
        errors.push("This sub category already exists under that category");
      } else {
        seen.add(key);
      }
    }

    const colour = parseColour(cell("Colour"), errors);
    const isActive = parseBoolean(cell("Active"), "Active", errors);

    const line = index + 2;

    if (errors.length > 0 || !categoryId) {
      return { line, name, categoryName, payload: null, errors };
    }

    const payload: ProductSubCategoryPayload = {
      categoryId,
      name,
      ...(code ? { code } : {}),
      ...(colour ? { color: colour } : {}),
      ...(cell("Description") ? { description: cell("Description") } : {}),
      ...(isActive === null ? {} : { isActive }),
    };

    return { line, name, categoryName, payload, errors };
  });

  return {
    rows: parsed,
    ready: parsed.filter((row) => row.payload !== null),
    rejected: parsed.filter((row) => row.payload === null),
    missingHeaders: [],
  };
};
