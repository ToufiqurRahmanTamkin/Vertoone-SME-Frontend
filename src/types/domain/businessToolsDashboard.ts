import type { EmailStatus } from "./email";
import type { EmailTemplateCategory, EmailTemplateStatus } from "./emailBuilder";
import type { FormStatus, SubmissionSource } from "./formBuilder";

export type BusinessTool = "EMAIL" | "WEB" | "FORM";

export interface BusinessToolsOverviewKpis {
  totalAssets: number;
  publishedAssets: number;
  draftAssets: number;
  pendingChanges: number;
  publishRate: number;
  outputThisMonth: number;
  outputLastMonth: number;
  outputChangePercent: number;
}

export interface BusinessToolsEmailKpis {
  templates: number;
  published: number;
  drafts: number;
  pendingChanges: number;
  blocks: number;
  sent: number;
  sentThisMonth: number;
  sentLastMonth: number;
  sentChangePercent: number;
  failed: number;
  skipped: number;
  deliveryRate: number;
  recipients: number;
  lastSentAt: string | null;
  isMailConfigured: boolean;
  templateLimit: number | null;
}

export interface BusinessToolsWebKpis {
  sites: number;
  publishedSites: number;
  pages: number;
  publishedPages: number;
  pendingChanges: number;
  blocks: number;
  averagePagesPerSite: number;
  indexablePages: number;
  lastPublishedAt: string | null;
  siteLimit: number | null;
}

export interface BusinessToolsFormKpis {
  forms: number;
  publishedForms: number;
  acceptingForms: number;
  pendingChanges: number;
  fields: number;
  submissions: number;
  submissionsThisMonth: number;
  submissionsLastMonth: number;
  submissionsThisWeek: number;
  submissionsChangePercent: number;
  unread: number;
  spam: number;
  averageSubmissionsPerForm: number;
  lastSubmissionAt: string | null;
  formLimit: number | null;
}

export interface BusinessToolsKpis {
  overview: BusinessToolsOverviewKpis;
  email: BusinessToolsEmailKpis;
  web: BusinessToolsWebKpis;
  form: BusinessToolsFormKpis;
}

export interface BusinessToolsTrendPoint {
  month: string;
  emailsSent: number;
  responses: number;
  published: number;
}

export interface ToolBreakdownEntry {
  tool: BusinessTool;
  total: number;
  published: number;
  draft: number;
}

export interface DeliveryStatusPoint {
  status: EmailStatus;
  count: number;
}

export interface TemplateCategoryPoint {
  category: EmailTemplateCategory;
  count: number;
  sent: number;
}

export interface SubmissionSourcePoint {
  source: SubmissionSource;
  count: number;
}

export interface TopEmailTemplate {
  _id: string;
  name: string;
  subject: string;
  category: EmailTemplateCategory;
  status: EmailTemplateStatus;
  blockCount: number;
  sentCount: number;
  lastSentAt: string | null;
}

export interface TopForm {
  _id: string;
  name: string;
  slug: string;
  status: FormStatus;
  fieldCount: number;
  submissionCount: number;
  isAcceptingResponses: boolean;
  publicUrl: string;
  lastSubmissionAt: string | null;
}

export interface SiteOverviewRow {
  _id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  pageCount: number;
  publishedPageCount: number;
  pendingChanges: number;
  publicUrl: string;
  publishedAt: string | null;
}

export interface RecentResponse {
  _id: string;
  formId: string;
  formName: string;
  summary: string;
  contactName: string;
  contactEmail: string;
  isRead: boolean;
  isSpam: boolean;
  source: SubmissionSource;
  submittedAt: string;
}

export interface RecentDelivery {
  _id: string;
  to: string;
  recipientName: string;
  subject: string;
  status: EmailStatus;
  errorMessage: string;
  sentAt: string;
}

export interface BusinessToolsDashboard {
  generatedAt: string;
  kpis: BusinessToolsKpis;
  trend: BusinessToolsTrendPoint[];
  toolBreakdown: ToolBreakdownEntry[];
  deliveryStatuses: DeliveryStatusPoint[];
  templateCategories: TemplateCategoryPoint[];
  submissionSources: SubmissionSourcePoint[];
  topTemplates: TopEmailTemplate[];
  topForms: TopForm[];
  sites: SiteOverviewRow[];
  recentResponses: RecentResponse[];
  recentDeliveries: RecentDelivery[];
}
