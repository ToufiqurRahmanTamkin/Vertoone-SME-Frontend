import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";
import type { TagRef } from "./tag";

export const DOCUMENT_CATEGORIES = [
  "CONTRACT",
  "POLICY",
  "INVOICE",
  "REPORT",
  "PROPOSAL",
  "CERTIFICATE",
  "IDENTITY",
  "TEMPLATE",
  "OTHER",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  CONTRACT: "Contract",
  POLICY: "Policy",
  INVOICE: "Invoice",
  REPORT: "Report",
  PROPOSAL: "Proposal",
  CERTIFICATE: "Certificate",
  IDENTITY: "Identity",
  TEMPLATE: "Template",
  OTHER: "Other",
};

export const DOCUMENT_CATEGORY_COLORS: Record<DocumentCategory, StatusColor> = {
  CONTRACT: "violet",
  POLICY: "blue",
  INVOICE: "green",
  REPORT: "amber",
  PROPOSAL: "orange",
  CERTIFICATE: "green",
  IDENTITY: "red",
  TEMPLATE: "zinc",
  OTHER: "muted",
};

export const DOCUMENT_VISIBILITIES = ["COMPANY", "SHARED", "PRIVATE"] as const;

export type DocumentVisibility = (typeof DOCUMENT_VISIBILITIES)[number];

export const DOCUMENT_VISIBILITY_LABELS: Record<DocumentVisibility, string> = {
  COMPANY: "Everyone in the company",
  SHARED: "Only the people I pick",
  PRIVATE: "Only me",
};

export const DOCUMENT_VISIBILITY_SHORT_LABELS: Record<DocumentVisibility, string> = {
  COMPANY: "Company",
  SHARED: "Shared",
  PRIVATE: "Private",
};

export const DOCUMENT_VISIBILITY_COLORS: Record<DocumentVisibility, StatusColor> = {
  COMPANY: "blue",
  SHARED: "amber",
  PRIVATE: "zinc",
};

export interface DocumentFile {
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  extension: string;
  fileSize: number;
}

export interface DocumentVersion extends DocumentFile {
  _id: string;
  version: number;
  note: string;
  uploadedAt: string;
}

export interface DocumentRef {
  _id: string;
  title: string;
  fileName: string;
  extension: string;
  url: string;
}

export interface CompanyDocument extends DocumentRef {
  description: string;
  folder: string;
  category: DocumentCategory;
  file: DocumentFile;
  version: number;
  versions: DocumentVersion[];
  visibility: DocumentVisibility;
  owner: EmployeeRef | null;
  ownerId: string | null;
  sharedWith: EmployeeRef[];
  sharedWithIds: string[];
  tags: TagRef[];
  tagIds: string[];
  fileSize: number;
  expiresAt: string | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
  downloadCount: number;
  lastAccessedAt: string | null;
  isArchived: boolean;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  archivedCount: number;
  totalSize: number;
  expiringCount: number;
  expiredCount: number;
  sharedCount: number;
  privateCount: number;
  folderCount: number;
}

export interface DocumentPayload {
  title: string;
  description?: string;
  folder?: string;
  category?: DocumentCategory;
  file: DocumentFile;
  visibility?: DocumentVisibility;
  ownerId?: string | null;
  sharedWithIds?: string[];
  tagIds?: string[];
  expiresAt?: string | null;
  isArchived?: boolean;
}

export type DocumentUpdatePayload = Partial<Omit<DocumentPayload, "file">>;

export interface DocumentVersionPayload {
  file: DocumentFile;
  note?: string;
}

export interface DocumentListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: DocumentCategory;
  visibility?: DocumentVisibility;
  folder?: string;
  ownerId?: string;
  tagIds?: string;
  isArchived?: boolean;
  expiringOnly?: boolean;
}

const UNITS = ["B", "KB", "MB", "GB"] as const;

export const formatFileSize = (bytes: number): string => {
  if (!bytes) return "0 B";
  const index = Math.min(UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${UNITS[index]}`;
};
