export type EmailBlockPadding = "NONE" | "SM" | "MD" | "LG" | "XL";

export type EmailBlockBackground = "NONE" | "MUTED" | "BRAND_SOFT" | "BRAND" | "DARK";

export type EmailBlockAlignment = "LEFT" | "CENTER" | "RIGHT";

export interface EmailBlockLayout {
  padding: EmailBlockPadding;
  background: EmailBlockBackground;
  align: EmailBlockAlignment;
}

export interface EmailBlockImage {
  url: string | null;
  publicId: string | null;
  alt: string;
}

export interface EmailBlock {
  id: string;
  type: string;
  hidden: boolean;
  layout: EmailBlockLayout;
  props: Record<string, unknown>;
}

export type EmailBlockFieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "url"
  | "switch"
  | "number"
  | "select"
  | "icon"
  | "image"
  | "repeater";

export interface EmailBlockFieldOption {
  value: string;
  label: string;
}

export interface EmailBlockField {
  key: string;
  label: string;
  type: EmailBlockFieldType;
  defaultValue: unknown;
  placeholder?: string;
  help?: string;
  max?: number;
  min?: number;
  options?: EmailBlockFieldOption[];
  fields?: EmailBlockField[];
  itemLabel?: string;
  half?: boolean;
  supportsMerge?: boolean;
}

export interface EmailBlockDefinition {
  type: string;
  label: string;
  group: string;
  description: string;
  icon: string;
  fields: EmailBlockField[];
  layout: EmailBlockLayout;
}

export interface MergeVariable {
  token: string;
  label: string;
  group: string;
  description: string;
  sample: string;
}

export interface EmailBlockCatalogue {
  blocks: EmailBlockDefinition[];
  icons: Record<string, string>;
  socialIcons: Record<string, string>;
  variables: MergeVariable[];
  layout: {
    paddings: EmailBlockPadding[];
    backgrounds: EmailBlockBackground[];
    alignments: EmailBlockAlignment[];
  };
}

export type EmailFont = "SYSTEM" | "SERIF" | "ROUNDED";

export interface EmailTheme {
  brandColor: string;
  backgroundColor: string;
  font: EmailFont;
  contentWidth: number;
}

export type EmailTemplateStatus = "DRAFT" | "PUBLISHED";

export type EmailTemplateCategory =
  | "GENERAL"
  | "MARKETING"
  | "TRANSACTIONAL"
  | "ANNOUNCEMENT"
  | "INTERNAL";

export const EMAIL_TEMPLATE_CATEGORIES: EmailTemplateCategory[] = [
  "GENERAL",
  "MARKETING",
  "TRANSACTIONAL",
  "ANNOUNCEMENT",
  "INTERNAL",
];

export interface EmailStarterTemplate {
  key: string;
  label: string;
  description: string;
  category: EmailTemplateCategory;
  categoryLabel: string;
  suggestedName: string;
  suggestedSubject: string;
  suggestedPreheader: string;
  accentColor: string;
  blockCount: number;
}

export interface EmailStarterCatalogue {
  templates: EmailStarterTemplate[];
}

export interface EmailTemplateListItem {
  _id: string;
  name: string;
  description: string;
  subject: string;
  preheader: string;
  category: EmailTemplateCategory;
  templateKey: string;
  status: EmailTemplateStatus;
  brandColor: string;
  blockCount: number;
  sentCount: number;
  lastSentAt: string | null;
  hasUnpublishedChanges: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate extends EmailTemplateListItem {
  blocks: EmailBlock[];
  theme: EmailTheme;
  revision: number;
}

export interface EmailTemplateListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: EmailTemplateStatus;
  category?: EmailTemplateCategory;
}

export interface CreateEmailTemplatePayload {
  name: string;
  subject?: string;
  preheader?: string;
  description?: string;
  category?: EmailTemplateCategory;
  templateKey?: string;
}

export interface UpdateEmailTemplatePayload {
  name?: string;
  description?: string;
  subject?: string;
  preheader?: string;
  category?: EmailTemplateCategory;
  blocks?: EmailBlock[];
  theme?: Partial<EmailTheme>;
  revision?: number;
}

export interface EmailTemplateSummary {
  totalTemplates: number;
  publishedTemplates: number;
  templatesWithUnpublishedChanges: number;
  emailsSent: number;
  emailsSentThisMonth: number;
  emailsFailed: number;
  isMailConfigured: boolean;
  templateLimit: number | null;
  templatesRemaining: number | null;
}

export interface EmailTemplateOption {
  _id: string;
  name: string;
  subject: string;
  category: EmailTemplateCategory;
  status: EmailTemplateStatus;
  blockCount: number;
}

export type EmailRecipientSource = "MANUAL" | "CONTACT" | "LEAD" | "EMPLOYEE";

export interface EmailRecipientRef {
  _id: string;
  source: EmailRecipientSource;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  contactCompany: string;
}

export interface ManualRecipient {
  email: string;
  name?: string;
}

export interface SendEmailTemplatePayload {
  recipients: ManualRecipient[];
  contactIds?: string[];
  leadIds?: string[];
  employeeIds?: string[];
  subject?: string;
  replyTo?: string;
  senderName?: string;
}

export interface SendResultRow {
  email: string;
  name: string;
  status: "SENT" | "FAILED" | "SKIPPED";
  errorMessage: string;
}

export interface SendEmailTemplateResult {
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  isMailConfigured: boolean;
  results: SendResultRow[];
}

export interface TestSendPayload {
  email: string;
  blocks?: EmailBlock[];
  subject?: string;
  preheader?: string;
  theme?: Partial<EmailTheme>;
}

export interface EmailDeliveryListItem {
  _id: string;
  to: string;
  recipientName: string;
  subject: string;
  status: "SENT" | "FAILED" | "SKIPPED";
  errorMessage: string;
  relatedReference: string;
  relatedId: string | null;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailDelivery extends EmailDeliveryListItem {
  html: string;
  text: string;
}

export interface EmailDeliveryListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: "SENT" | "FAILED" | "SKIPPED";
  templateId?: string;
  from?: string;
  to?: string;
}
