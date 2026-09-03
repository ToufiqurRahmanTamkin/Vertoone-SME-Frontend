export const WIPE_SCOPES = ["SOFT_DELETED", "OPERATIONAL", "FACTORY_RESET"] as const;
export type WipeScope = (typeof WIPE_SCOPES)[number];

export interface WipeTargetPreview {
  key: string;
  label: string;
  description: string;
  liveCount: number;
  softDeletedCount: number;
  scopes: WipeScope[];
  companyScoped: boolean;
}

export interface DataWipePreview {
  targets: WipeTargetPreview[];
  totalLive: number;
  totalSoftDeleted: number;
  protectedSuperAdmins: number;
  confirmationPhrase: string;
  companyId: string | null;
  companyName: string | null;
}

export interface DataWipePreviewQuery {
  companyId?: string;
}

export interface DataWipeEntry {
  key: string;
  label: string;
  deleted: number;
}

export interface DataWipeResult {
  scope: WipeScope;
  executedAt: string;
  totalDeleted: number;
  entries: DataWipeEntry[];
  companyId: string | null;
  companyName: string | null;
}

export interface DataWipePayload {
  scope: WipeScope;
  password: string;
  confirmation: string;
  companyId?: string;
}
