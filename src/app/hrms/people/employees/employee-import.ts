import { excelSerialToDate } from "@/lib/sheet";
import {
  BLOOD_GROUPS,
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  GENDERS,
  MARITAL_STATUSES,
  type EmployeePayload,
} from "@/types/domain/employee";

export interface ImportColumn {
  header: string;
  required: boolean;
  hint: string;
  example: string;
}

export const IMPORT_COLUMNS: ImportColumn[] = [
  { header: "Full name", required: true, hint: "As it should appear", example: "Ayesha Rahman" },
  {
    header: "Email",
    required: true,
    hint: "Must be unique in your company",
    example: "ayesha.rahman@example.com",
  },
  { header: "Phone", required: true, hint: "Must be unique", example: "+8801711000000" },
  {
    header: "Departments",
    required: true,
    hint: "Existing department names, separated by commas",
    example: "Operations",
  },
  {
    header: "Designations",
    required: true,
    hint: "Existing designation names, separated by commas",
    example: "Officer",
  },
  {
    header: "Employment type",
    required: true,
    hint: "Full time, Part time, Contract, Intern, Temporary or Consultant",
    example: "Full time",
  },
  {
    header: "Joining date",
    required: false,
    hint: "YYYY-MM-DD, today when blank",
    example: "2024-01-15",
  },
  { header: "Alternate phone", required: false, hint: "", example: "" },
  { header: "Date of birth", required: false, hint: "YYYY-MM-DD", example: "1996-04-02" },
  { header: "Gender", required: false, hint: "Male, Female or Other", example: "Female" },
  {
    header: "Marital status",
    required: false,
    hint: "Single, Married, Divorced or Widowed",
    example: "Single",
  },
  { header: "Blood group", required: false, hint: "A+, A-, B+, B-, AB+, AB-, O+, O-", example: "" },
  { header: "National ID", required: false, hint: "", example: "" },
  {
    header: "Status",
    required: false,
    hint: "Active, On probation, On leave, Suspended, Resigned or Terminated",
    example: "Active",
  },
  { header: "Work location", required: false, hint: "", example: "Head office" },
  { header: "Confirmation date", required: false, hint: "YYYY-MM-DD", example: "" },
  { header: "Present address", required: false, hint: "", example: "" },
  { header: "Permanent address", required: false, hint: "", example: "" },
  { header: "Emergency contact name", required: false, hint: "", example: "" },
  { header: "Emergency contact relationship", required: false, hint: "", example: "" },
  { header: "Emergency contact phone", required: false, hint: "", example: "" },
  { header: "Bank name", required: false, hint: "", example: "" },
  { header: "Branch name", required: false, hint: "", example: "" },
  { header: "Account name", required: false, hint: "", example: "" },
  { header: "Account number", required: false, hint: "", example: "" },
  { header: "Routing number", required: false, hint: "", example: "" },
  { header: "Notes", required: false, hint: "", example: "" },
];

export interface NamedOption {
  _id: string;
  name: string;
}

export interface ImportRow {
  line: number;
  name: string;
  email: string;
  payload: EmployeePayload | null;
  errors: string[];
}

export interface ImportPreview {
  rows: ImportRow[];
  ready: ImportRow[];
  rejected: ImportRow[];
  missingHeaders: string[];
}

const normalizeKey = (value: string): string => value.toLowerCase().replace(/[^a-z0-9+]/g, "");

const matchEnum = <T extends string>(value: string, allowed: readonly T[]): T | null => {
  const key = normalizeKey(value);
  return allowed.find((option) => normalizeKey(option) === key) ?? null;
};

const parseSheetDate = (value: string, label: string, errors: string[]): string | null => {
  const text = value.trim();
  if (!text) return null;

  if (/^\d+(\.\d+)?$/.test(text)) {
    const date = excelSerialToDate(Number(text));
    if (Number.isNaN(date.getTime())) {
      errors.push(`${label} is not a valid date`);
      return null;
    }
    return date.toISOString();
  }

  if (!/^\d{4}-\d{2}-\d{2}/.test(text)) {
    errors.push(`${label} must be written as YYYY-MM-DD`);
    return null;
  }

  const date = new Date(text.length === 10 ? `${text}T00:00:00.000Z` : text);
  if (Number.isNaN(date.getTime())) {
    errors.push(`${label} is not a valid date`);
    return null;
  }

  return date.toISOString();
};

const splitNames = (value: string): string[] =>
  value
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const resolveNames = (
  value: string,
  options: NamedOption[],
  label: string,
  errors: string[]
): string[] => {
  const names = splitNames(value);

  if (names.length === 0) {
    errors.push(`${label} is required`);
    return [];
  }

  const ids: string[] = [];
  const unknown: string[] = [];

  for (const name of names) {
    const match = options.find((option) => normalizeKey(option.name) === normalizeKey(name));
    if (match) {
      ids.push(match._id);
    } else {
      unknown.push(name);
    }
  }

  if (unknown.length > 0) {
    errors.push(`${label} not found: ${unknown.join(", ")}. Create them first, then import`);
  }

  return ids;
};

export const buildImportPreview = (
  headers: string[],
  rows: string[][],
  departments: NamedOption[],
  designations: NamedOption[]
): ImportPreview => {
  const headerIndex = new Map(headers.map((header, index) => [normalizeKey(header), index]));

  const missingHeaders = IMPORT_COLUMNS.filter(
    (column) => column.required && !headerIndex.has(normalizeKey(column.header))
  ).map((column) => column.header);

  if (missingHeaders.length > 0) {
    return { rows: [], ready: [], rejected: [], missingHeaders };
  }

  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();

  const parsed = rows.map<ImportRow>((cells, index) => {
    const cell = (header: string): string => {
      const position = headerIndex.get(normalizeKey(header));
      return position === undefined ? "" : (cells[position] ?? "").trim();
    };

    const errors: string[] = [];

    const fullName = cell("Full name");
    const email = cell("Email").toLowerCase();
    const phone = cell("Phone");

    if (!fullName) errors.push("Full name is required");

    if (!email) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Email is not a valid address");
    } else if (seenEmails.has(email)) {
      errors.push("This email appears more than once in the file");
    } else {
      seenEmails.add(email);
    }

    if (!phone) {
      errors.push("Phone is required");
    } else if (phone.length < 6) {
      errors.push("Phone is too short");
    } else if (seenPhones.has(phone)) {
      errors.push("This phone number appears more than once in the file");
    } else {
      seenPhones.add(phone);
    }

    const departmentIds = resolveNames(cell("Departments"), departments, "Departments", errors);
    const designationIds = resolveNames(cell("Designations"), designations, "Designations", errors);

    const joiningDate = parseSheetDate(cell("Joining date"), "Joining date", errors);

    const dateOfBirth = parseSheetDate(cell("Date of birth"), "Date of birth", errors);
    const confirmationDate = parseSheetDate(
      cell("Confirmation date"),
      "Confirmation date",
      errors
    );

    const gender = cell("Gender") ? matchEnum(cell("Gender"), GENDERS) : null;
    if (cell("Gender") && !gender) errors.push(`Gender "${cell("Gender")}" is not recognised`);

    const maritalStatus = cell("Marital status")
      ? matchEnum(cell("Marital status"), MARITAL_STATUSES)
      : null;
    if (cell("Marital status") && !maritalStatus) {
      errors.push(`Marital status "${cell("Marital status")}" is not recognised`);
    }

    const bloodGroup = cell("Blood group") ? matchEnum(cell("Blood group"), BLOOD_GROUPS) : null;
    if (cell("Blood group") && !bloodGroup) {
      errors.push(`Blood group "${cell("Blood group")}" is not recognised`);
    }

    const employmentType = matchEnum(cell("Employment type"), EMPLOYMENT_TYPES);
    if (!cell("Employment type")) {
      errors.push("Employment type is required");
    } else if (!employmentType) {
      errors.push(`Employment type "${cell("Employment type")}" is not recognised`);
    }

    const status = cell("Status") ? matchEnum(cell("Status"), EMPLOYEE_STATUSES) : null;
    if (cell("Status") && !status) errors.push(`Status "${cell("Status")}" is not recognised`);

    const name = fullName;
    const line = index + 2;

    if (errors.length > 0 || !employmentType) {
      return { line, name, email, payload: null, errors };
    }

    const emergencyContact = {
      name: cell("Emergency contact name"),
      relationship: cell("Emergency contact relationship"),
      phone: cell("Emergency contact phone"),
    };

    const bankAccount = {
      bankName: cell("Bank name"),
      branchName: cell("Branch name"),
      accountName: cell("Account name"),
      accountNumber: cell("Account number"),
      routingNumber: cell("Routing number"),
    };

    const hasValue = (record: Record<string, string>): boolean =>
      Object.values(record).some((value) => value !== "");

    const payload: EmployeePayload = {
      fullName,
      email,
      phone,
      departmentIds,
      designationIds,
      employmentType,
      ...(joiningDate ? { joiningDate } : {}),
      ...(cell("Alternate phone") ? { alternatePhone: cell("Alternate phone") } : {}),
      ...(dateOfBirth ? { dateOfBirth } : {}),
      ...(confirmationDate ? { confirmationDate } : {}),
      ...(gender ? { gender } : {}),
      ...(maritalStatus ? { maritalStatus } : {}),
      ...(bloodGroup ? { bloodGroup } : {}),
      ...(cell("National ID") ? { nationalId: cell("National ID") } : {}),
      ...(status ? { status } : {}),
      ...(cell("Work location") ? { workLocation: cell("Work location") } : {}),
      ...(cell("Present address") ? { presentAddress: cell("Present address") } : {}),
      ...(cell("Permanent address") ? { permanentAddress: cell("Permanent address") } : {}),
      ...(hasValue(emergencyContact) ? { emergencyContact } : {}),
      ...(hasValue(bankAccount) ? { bankAccount } : {}),
      ...(cell("Notes") ? { notes: cell("Notes") } : {}),
    };

    return { line, name, email, payload, errors };
  });

  return {
    rows: parsed,
    ready: parsed.filter((row) => row.payload !== null),
    rejected: parsed.filter((row) => row.payload === null),
    missingHeaders: [],
  };
};
