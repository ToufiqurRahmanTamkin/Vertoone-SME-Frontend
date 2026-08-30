import type { StatusColor } from "@/components/shared/status-badge";
import type { ContactTypeRef } from "./contactType";
import type { EmployeeRef } from "./employee";
import type { LeadSourceRef } from "./leadSource";
import type { TagRef } from "./tag";

export const CONTACT_STATUSES = ["ACTIVE", "INACTIVE", "DO_NOT_CONTACT"] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DO_NOT_CONTACT: "Do not contact",
};

export const CONTACT_STATUS_COLORS: Record<ContactStatus, StatusColor> = {
  ACTIVE: "green",
  INACTIVE: "zinc",
  DO_NOT_CONTACT: "red",
};

export const CONTACT_PREFERRED_CHANNELS = ["EMAIL", "PHONE", "WHATSAPP", "SMS"] as const;

export type ContactPreferredChannel = (typeof CONTACT_PREFERRED_CHANNELS)[number];

export const CONTACT_CHANNEL_LABELS: Record<ContactPreferredChannel, string> = {
  EMAIL: "Email",
  PHONE: "Phone call",
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
};

export interface ContactAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ContactRef {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Contact extends ContactRef {
  firstName: string;
  lastName: string;
  alternatePhone: string;
  jobTitle: string;
  companyName: string;
  department: string;
  website: string;
  contactType: ContactTypeRef | null;
  contactTypeId: string | null;
  leadSource: LeadSourceRef | null;
  leadSourceId: string | null;
  owner: EmployeeRef | null;
  ownerId: string | null;
  tags: TagRef[];
  tagIds: string[];
  address: ContactAddress;
  preferredChannel: ContactPreferredChannel;
  status: ContactStatus;
  birthday: string | null;
  lastContactedAt: string | null;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
  status?: ContactStatus;
  contactTypeId?: string;
  leadSourceId?: string;
  ownerId?: string;
  tagIds?: string;
}

export interface ContactOptionQuery {
  search?: string;
}

export interface ContactSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  doNotContactCount: number;
  withEmailCount: number;
}

export interface ContactPayload {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  jobTitle?: string;
  companyName?: string;
  department?: string;
  website?: string;
  contactTypeId?: string | null;
  leadSourceId?: string | null;
  ownerId?: string | null;
  tagIds?: string[];
  address?: Partial<ContactAddress>;
  preferredChannel?: ContactPreferredChannel;
  status?: ContactStatus;
  birthday?: string | null;
  lastContactedAt?: string | null;
  notes?: string;
  isActive?: boolean;
}
