import type { StatusColor } from "@/components/shared/status-badge";
import type { DocumentFile, DocumentRef } from "./document";
import type { EmployeeRef } from "./employee";
import type { TagRef } from "./tag";

export const CONTRACT_STATUSES = [
  "DRAFT",
  "SENT",
  "PARTIALLY_SIGNED",
  "SIGNED",
  "DECLINED",
  "EXPIRED",
  "CANCELLED",
] as const;

export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: "Draft",
  SENT: "Out for signature",
  PARTIALLY_SIGNED: "Partly signed",
  SIGNED: "Signed",
  DECLINED: "Declined",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, StatusColor> = {
  DRAFT: "zinc",
  SENT: "blue",
  PARTIALLY_SIGNED: "amber",
  SIGNED: "green",
  DECLINED: "red",
  EXPIRED: "orange",
  CANCELLED: "muted",
};

export const CONTRACT_SIGNER_STATUSES = ["PENDING", "VIEWED", "SIGNED", "DECLINED"] as const;

export type ContractSignerStatus = (typeof CONTRACT_SIGNER_STATUSES)[number];

export const CONTRACT_SIGNER_STATUS_LABELS: Record<ContractSignerStatus, string> = {
  PENDING: "Not opened",
  VIEWED: "Opened",
  SIGNED: "Signed",
  DECLINED: "Declined",
};

export const CONTRACT_SIGNER_STATUS_COLORS: Record<ContractSignerStatus, StatusColor> = {
  PENDING: "zinc",
  VIEWED: "blue",
  SIGNED: "green",
  DECLINED: "red",
};

export const CONTRACT_SIGNING_ORDERS = ["PARALLEL", "SEQUENTIAL"] as const;

export type ContractSigningOrder = (typeof CONTRACT_SIGNING_ORDERS)[number];

export const CONTRACT_SIGNING_ORDER_LABELS: Record<ContractSigningOrder, string> = {
  PARALLEL: "Everyone at once",
  SEQUENTIAL: "One after another, in order",
};

export const CONTRACT_SIGNATURE_TYPES = ["TYPED", "DRAWN"] as const;

export type ContractSignatureType = (typeof CONTRACT_SIGNATURE_TYPES)[number];

export type ContractAuditAction =
  | "CREATED"
  | "UPDATED"
  | "SENT"
  | "REMINDED"
  | "VIEWED"
  | "SIGNED"
  | "DECLINED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export const CONTRACT_AUDIT_LABELS: Record<ContractAuditAction, string> = {
  CREATED: "Drafted",
  UPDATED: "Updated",
  SENT: "Sent for signature",
  REMINDED: "Reminder sent",
  VIEWED: "Opened",
  SIGNED: "Signed",
  DECLINED: "Declined",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export interface ContractSigner {
  _id: string;
  name: string;
  email: string;
  role: string;
  order: number;
  status: ContractSignerStatus;
  sentAt: string | null;
  remindedAt: string | null;
  viewedAt: string | null;
  signedAt: string | null;
  declinedAt: string | null;
  declineReason: string;
  signatureType: ContractSignatureType | null;
  isTurn: boolean;
  signingUrl: string | null;
}

export interface ContractAuditEntry {
  _id: string;
  action: ContractAuditAction;
  actor: string;
  detail: string;
  at: string;
}

export interface ContractRef {
  _id: string;
  contractNumber: string;
  title: string;
}

export interface Contract extends ContractRef {
  description: string;
  message: string;
  file: DocumentFile;
  document: DocumentRef | null;
  documentId: string | null;
  status: ContractStatus;
  signingOrder: ContractSigningOrder;
  signers: ContractSigner[];
  auditTrail: ContractAuditEntry[];
  counterpartyName: string;
  value: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  expiresAt: string | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
  owner: EmployeeRef | null;
  ownerId: string | null;
  tags: TagRef[];
  tagIds: string[];
  signedCount: number;
  signerCount: number;
  progress: number;
  sentAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  total: number;
  draftCount: number;
  awaitingCount: number;
  signedCount: number;
  declinedCount: number;
  expiredCount: number;
  expiringCount: number;
  totalValue: number;
  signedValue: number;
  averageDaysToSign: number;
}

export interface ContractSignerPayload {
  name: string;
  email: string;
  role?: string;
}

export interface ContractPayload {
  title: string;
  description?: string;
  message?: string;
  file: DocumentFile;
  documentId?: string | null;
  signingOrder?: ContractSigningOrder;
  signers: ContractSignerPayload[];
  counterpartyName?: string;
  value?: number;
  currency?: string;
  startDate?: string | null;
  endDate?: string | null;
  expiresAt?: string | null;
  ownerId?: string | null;
  tagIds?: string[];
}

export type ContractUpdatePayload = Partial<ContractPayload>;

export interface ContractListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContractStatus;
  ownerId?: string;
  tagIds?: string;
  openOnly?: boolean;
  expiringOnly?: boolean;
}

export interface PublicContractSigner {
  name: string;
  role: string;
  status: ContractSignerStatus;
  signedAt: string | null;
  isYou: boolean;
}

export interface PublicContractView {
  contractNumber: string;
  title: string;
  description: string;
  message: string;
  companyName: string;
  fileUrl: string;
  fileName: string;
  extension: string;
  status: ContractStatus;
  expiresAt: string | null;
  signer: {
    name: string;
    email: string;
    role: string;
    status: ContractSignerStatus;
    signedAt: string | null;
  };
  otherSigners: PublicContractSigner[];
  canSign: boolean;
  blockedReason: string;
}

export interface SignContractPayload {
  signatureType: ContractSignatureType;
  signatureValue: string;
  fullName: string;
  agreed: boolean;
}
