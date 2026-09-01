import type { SiteFont, SiteRadius, SiteSeo } from "./webBuilder";

export type FormFieldType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "EMAIL"
  | "PHONE"
  | "NUMBER"
  | "URL"
  | "DATE"
  | "TIME"
  | "DROPDOWN"
  | "RADIO"
  | "CHECKBOXES"
  | "CONSENT"
  | "RATING"
  | "HEADING"
  | "PARAGRAPH"
  | "DIVIDER";

export type FieldWidth = "FULL" | "HALF";

export type FieldSettingType = "text" | "textarea" | "number" | "switch" | "select";

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FieldSetting {
  key: string;
  label: string;
  type: FieldSettingType;
  defaultValue: unknown;
  help?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: FormFieldOption[];
  half?: boolean;
}

export interface FormFieldDefinition {
  type: FormFieldType;
  label: string;
  group: string;
  description: string;
  icon: string;
  collectsAnswer: boolean;
  supportsOptions: boolean;
  supportsPlaceholder: boolean;
  supportsRequired: boolean;
  defaultLabel: string;
  defaultKey: string;
  defaultOptions: FormFieldOption[];
  settings: FieldSetting[];
}

export interface FormField {
  id: string;
  key: string;
  type: FormFieldType;
  label: string;
  placeholder: string;
  help: string;
  required: boolean;
  hidden: boolean;
  width: FieldWidth;
  options: FormFieldOption[];
  settings: Record<string, unknown>;
}

export interface FieldCatalogue {
  fields: FormFieldDefinition[];
  icons: Record<string, string>;
  widths: FieldWidth[];
}

export interface FormTemplate {
  key: string;
  label: string;
  description: string;
  accentColor: string;
  suggestedName: string;
  suggestedSlug: string;
  fieldCount: number;
  fieldLabels: string[];
}

export interface FormTemplateCatalogue {
  templates: FormTemplate[];
}

export type FormStatus = "DRAFT" | "PUBLISHED";

export type FormLayout = "CARD" | "PLAIN";

export type FormWidth = "NARROW" | "DEFAULT" | "WIDE";

export type FormAfterSubmit = "MESSAGE" | "REDIRECT";

export interface FormTheme {
  primaryColor: string;
  font: SiteFont;
  radius: SiteRadius;
  layout: FormLayout;
  width: FormWidth;
  logoUrl: string | null;
  logoPublicId: string | null;
  coverUrl: string | null;
  coverPublicId: string | null;
}

export interface FormBehaviour {
  submitLabel: string;
  afterSubmit: FormAfterSubmit;
  successMessage: string;
  redirectUrl: string;
  notifyEmail: string;
  notifyOnSubmission: boolean;
  storeSubmissions: boolean;
  spamProtection: boolean;
  closedMessage: string;
  isAcceptingResponses: boolean;
  responseLimit: number | null;
  closesAt: string | null;
}

export interface FormListItem {
  _id: string;
  slug: string;
  name: string;
  description: string;
  templateKey: string;
  status: FormStatus;
  primaryColor: string;
  fieldCount: number;
  submissionCount: number;
  lastSubmissionAt: string | null;
  hasUnpublishedChanges: boolean;
  isAcceptingResponses: boolean;
  publicPath: string;
  publicUrl: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormDetail extends FormListItem {
  language: string;
  fields: FormField[];
  theme: FormTheme;
  behaviour: FormBehaviour;
  seo: SiteSeo;
  revision: number;
}

export interface FormOption {
  _id: string;
  name: string;
  slug: string;
  status: FormStatus;
  fieldCount: number;
  publicPath: string;
}

export interface FormListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: FormStatus;
}

export interface CreateFormPayload {
  name: string;
  slug?: string;
  description?: string;
  templateKey?: string;
}

export interface UpdateFormPayload {
  slug?: string;
  name?: string;
  description?: string;
  language?: string;
  fields?: FormField[];
  theme?: Partial<FormTheme>;
  behaviour?: Partial<FormBehaviour>;
  seo?: Partial<SiteSeo>;
  revision?: number;
}

export interface FormSummary {
  totalForms: number;
  publishedForms: number;
  totalSubmissions: number;
  submissionsThisMonth: number;
  formsWithUnpublishedChanges: number;
  formLimit: number | null;
  formsRemaining: number | null;
}

export type SubmissionSource = "DIRECT_LINK" | "EMBEDDED" | "PREVIEW";

export type AnswerValue = string | string[] | number | boolean | null;

export interface SubmissionAnswer {
  key: string;
  label: string;
  type: string;
  value: AnswerValue;
}

export interface SubmissionListItem {
  _id: string;
  formId: string;
  formName: string;
  summary: string;
  contactEmail: string;
  contactName: string;
  isRead: boolean;
  isSpam: boolean;
  source: SubmissionSource;
  submittedAt: string;
}

export interface SubmissionDetail extends SubmissionListItem {
  answers: SubmissionAnswer[];
  referer: string;
  userAgent: string;
  country: string;
}

export interface SubmissionListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isRead?: boolean;
  isSpam?: boolean;
  from?: string;
  to?: string;
}

export interface SubmissionSummary {
  totalSubmissions: number;
  unreadSubmissions: number;
  spamSubmissions: number;
  submissionsThisWeek: number;
  lastSubmissionAt: string | null;
}
