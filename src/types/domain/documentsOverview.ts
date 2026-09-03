import type { ContractStatus } from "./contract";
import type { DocumentCategory } from "./document";

export interface DocumentsOverviewKpis {
  documents: {
    total: number;
    active: number;
    archived: number;
    addedThisMonth: number;
    addedChangePercent: number;
    totalSize: number;
    expiringCount: number;
    expiredCount: number;
    limit: number | null;
    remaining: number | null;
  };
  contracts: {
    total: number;
    draft: number;
    awaiting: number;
    signed: number;
    declined: number;
    expired: number;
    expiring: number;
    completionRate: number;
    averageDaysToSign: number;
    totalValue: number;
    signedValue: number;
    limit: number | null;
    remaining: number | null;
  };
}

export interface DocumentCategoryPoint {
  category: DocumentCategory;
  count: number;
  size: number;
}

export interface ContractStatusPoint {
  status: ContractStatus;
  count: number;
}

export interface FolderPoint {
  folder: string;
  count: number;
  size: number;
}

export interface DocumentsTrendPoint {
  month: string;
  uploaded: number;
  signed: number;
}

export interface RecentDocumentRow {
  _id: string;
  title: string;
  fileName: string;
  extension: string;
  fileSize: number;
  folder: string;
  category: DocumentCategory;
  ownerName: string;
  updatedAt: string;
}

export interface ExpiringDocumentRow {
  _id: string;
  title: string;
  folder: string;
  category: DocumentCategory;
  expiresAt: string;
  isExpired: boolean;
}

export interface AwaitingContractRow {
  _id: string;
  contractNumber: string;
  title: string;
  status: ContractStatus;
  counterpartyName: string;
  signedCount: number;
  signerCount: number;
  progress: number;
  sentAt: string | null;
  expiresAt: string | null;
  isExpiringSoon: boolean;
  pendingSignerNames: string[];
}

export interface DocumentsOverview {
  kpis: DocumentsOverviewKpis;
  categories: DocumentCategoryPoint[];
  contractStatuses: ContractStatusPoint[];
  folders: FolderPoint[];
  trend: DocumentsTrendPoint[];
  recentDocuments: RecentDocumentRow[];
  expiringDocuments: ExpiringDocumentRow[];
  awaitingContracts: AwaitingContractRow[];
  generatedAt: string;
}
