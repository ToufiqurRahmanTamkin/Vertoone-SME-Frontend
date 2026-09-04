import type { EmployeeRef } from "./employee";

export const MANAGED_FILE_KINDS = [
  "IMAGE",
  "DOCUMENT",
  "SPREADSHEET",
  "PRESENTATION",
  "ARCHIVE",
  "VIDEO",
  "AUDIO",
  "OTHER",
] as const;
export type ManagedFileKind = (typeof MANAGED_FILE_KINDS)[number];

export const MANAGED_FILE_KIND_LABELS: Record<ManagedFileKind, string> = {
  IMAGE: "Image",
  DOCUMENT: "Document",
  SPREADSHEET: "Spreadsheet",
  PRESENTATION: "Presentation",
  ARCHIVE: "Archive",
  VIDEO: "Video",
  AUDIO: "Audio",
  OTHER: "Other",
};

export const MANAGED_FILE_SOURCES = ["UPLOAD", "GOOGLE_DRIVE"] as const;
export type ManagedFileSource = (typeof MANAGED_FILE_SOURCES)[number];

export const MANAGED_FILE_SOURCE_LABELS: Record<ManagedFileSource, string> = {
  UPLOAD: "Uploaded",
  GOOGLE_DRIVE: "Google Drive",
};

export const MANAGED_FILE_SCOPES = ["ALL", "MINE", "SHARED_WITH_ME", "STARRED"] as const;
export type ManagedFileScope = (typeof MANAGED_FILE_SCOPES)[number];

export const MANAGED_FILE_SCOPE_LABELS: Record<ManagedFileScope, string> = {
  ALL: "Everything I can see",
  MINE: "My files",
  SHARED_WITH_ME: "Shared with me",
  STARRED: "Starred",
};

export interface ManagedFileUserRef {
  _id: string;
  name: string;
  email: string;
}

export interface ManagedFile {
  _id: string;
  name: string;
  description: string;
  kind: ManagedFileKind;
  source: ManagedFileSource;
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  extension: string;
  fileSize: number;
  width: number;
  height: number;
  isStarred: boolean;
  isMine: boolean;
  owner: ManagedFileUserRef | null;
  sharedWithUsers: ManagedFileUserRef[];
  sharedWithUserIds: string[];
  sharedWithEmployees: EmployeeRef[];
  sharedWithEmployeeIds: string[];
  shareCount: number;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedFileListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  scope?: ManagedFileScope;
  kind?: ManagedFileKind;
  source?: ManagedFileSource;
  accept?: string;
}

export interface ManagedFileSummary {
  total: number;
  mineCount: number;
  sharedWithMeCount: number;
  starredCount: number;
  sharedByMeCount: number;
  totalSize: number;
  imageCount: number;
  documentCount: number;
  otherCount: number;
}

export interface UpdateManagedFilePayload {
  name?: string;
  description?: string;
  isStarred?: boolean;
}

export interface ShareManagedFilePayload {
  userIds?: string[];
  employeeIds?: string[];
}

export interface GoogleDriveFileInput {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
}

export interface ImportGoogleDrivePayload {
  accessToken: string;
  files: GoogleDriveFileInput[];
}

export interface ShareTargetUser extends ManagedFileUserRef {
  role: string;
  isSelf: boolean;
}

export interface ShareTargetEmployee {
  _id: string;
  name: string;
  employeeCode: string;
  designation: string;
}

export interface ShareTargets {
  users: ShareTargetUser[];
  employees: ShareTargetEmployee[];
}

export interface GoogleDriveConfig {
  isConfigured: boolean;
  clientId: string;
  apiKey: string;
  scope: string;
}

const UNITS = ["B", "KB", "MB", "GB", "TB"];

export const formatBytes = (bytes: number): string => {
  if (!bytes) return "0 B";
  const index = Math.min(UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${UNITS[index]}`;
};

export const isPreviewableImage = (file: ManagedFile): boolean =>
  file.kind === "IMAGE" && file.mimeType !== "image/tiff";
