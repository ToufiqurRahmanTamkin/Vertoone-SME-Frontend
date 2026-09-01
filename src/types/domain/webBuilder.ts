export type BlockPadding = "NONE" | "SM" | "MD" | "LG" | "XL";

export type BlockWidth = "NARROW" | "DEFAULT" | "WIDE" | "FULL";

export type BlockBackground = "NONE" | "MUTED" | "PRIMARY_SOFT" | "PRIMARY" | "DARK";

export type BlockAlignment = "LEFT" | "CENTER";

export interface BlockLayout {
  padding: BlockPadding;
  width: BlockWidth;
  background: BlockBackground;
  align: BlockAlignment;
}

export interface BlockImage {
  url: string | null;
  publicId: string | null;
  alt: string;
}

export interface Block {
  id: string;
  type: string;
  hidden: boolean;
  layout: BlockLayout;
  props: Record<string, unknown>;
}

export type BlockFieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "url"
  | "switch"
  | "number"
  | "select"
  | "icon"
  | "image"
  | "products"
  | "form"
  | "repeater";

export interface BlockFieldOption {
  value: string;
  label: string;
}

export interface BlockField {
  key: string;
  label: string;
  type: BlockFieldType;
  defaultValue: unknown;
  placeholder?: string;
  help?: string;
  max?: number;
  min?: number;
  options?: BlockFieldOption[];
  fields?: BlockField[];
  itemLabel?: string;
  half?: boolean;
}

export interface BlockDefinition {
  type: string;
  label: string;
  group: string;
  description: string;
  icon: string;
  fields: BlockField[];
  layout: BlockLayout;
}

export interface BlockCatalogue {
  blocks: BlockDefinition[];
  icons: Record<string, string>;
  layout: {
    paddings: BlockPadding[];
    widths: BlockWidth[];
    backgrounds: BlockBackground[];
    alignments: BlockAlignment[];
  };
}

export type PageShape =
  | "BLANK"
  | "HOME"
  | "SHOWCASE"
  | "ABOUT"
  | "SERVICES"
  | "PRICING"
  | "CONTACT";

export interface PageTemplate {
  key: string;
  label: string;
  description: string;
  category: string;
  categoryLabel: string;
  shape: PageShape;
  suggestedTitle: string;
  suggestedSlug: string;
}

export interface SiteTemplatePage {
  title: string;
  slug: string;
  templateKey: string;
  isHome: boolean;
}

export interface SiteTemplate {
  key: string;
  label: string;
  description: string;
  accentColor: string;
  pages: SiteTemplatePage[];
}

export interface TemplateCatalogue {
  sites: SiteTemplate[];
  pages: PageTemplate[];
}

export type SiteFont = "SYSTEM" | "SERIF" | "ROUNDED";

export type SiteRadius = "NONE" | "SMALL" | "MEDIUM" | "LARGE";

export type SiteSocialPlatform =
  | "FACEBOOK"
  | "INSTAGRAM"
  | "LINKEDIN"
  | "X"
  | "YOUTUBE"
  | "TIKTOK"
  | "WHATSAPP";

export interface SiteSocial {
  platform: SiteSocialPlatform;
  url: string;
}

export interface SiteTheme {
  primaryColor: string;
  font: SiteFont;
  radius: SiteRadius;
}

export interface SiteHeader {
  showLogo: boolean;
  showNav: boolean;
  sticky: boolean;
  ctaLabel: string;
  ctaHref: string;
}

export interface SiteFooter {
  text: string;
  showPages: boolean;
  showContact: boolean;
}

export interface SiteContact {
  email: string;
  phone: string;
  address: string;
}

export interface SiteSeo {
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  ogImagePublicId: string | null;
  indexable: boolean;
}

export interface WebSiteListItem {
  _id: string;
  slug: string;
  name: string;
  tagline: string;
  templateKey: string;
  logoUrl: string | null;
  primaryColor: string;
  isPublished: boolean;
  publishedAt: string | null;
  publicPath: string;
  publicUrl: string;
  pageCount: number;
  publishedPageCount: number;
  pagesWithUnpublishedChanges: number;
  homePageTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebSite extends WebSiteListItem {
  language: string;
  logoPublicId: string | null;
  faviconUrl: string | null;
  faviconPublicId: string | null;
  theme: SiteTheme;
  header: SiteHeader;
  footer: SiteFooter;
  contact: SiteContact;
  socials: SiteSocial[];
  seo: SiteSeo;
}

export interface WebSiteListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isPublished?: boolean;
}

export interface CreateWebSitePayload {
  name: string;
  slug?: string;
  tagline?: string;
  templateKey?: string;
}

export interface WebSitePayload {
  slug?: string;
  name?: string;
  tagline?: string;
  language?: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  faviconUrl?: string | null;
  faviconPublicId?: string | null;
  theme?: Partial<SiteTheme>;
  header?: Partial<SiteHeader>;
  footer?: Partial<SiteFooter>;
  contact?: Partial<SiteContact>;
  socials?: SiteSocial[];
  seo?: Partial<SiteSeo>;
  isPublished?: boolean;
}

export interface WebSiteSummary {
  totalSites: number;
  publishedSites: number;
  totalPages: number;
  pagesWithUnpublishedChanges: number;
  siteLimit: number | null;
  sitesRemaining: number | null;
}

export type PageStatus = "DRAFT" | "PUBLISHED";

export interface WebPageListItem {
  _id: string;
  title: string;
  slug: string;
  isHome: boolean;
  status: PageStatus;
  showInNav: boolean;
  navLabel: string;
  sortOrder: number;
  blockCount: number;
  hasUnpublishedChanges: boolean;
  publicPath: string;
  publicUrl: string;
  publishedAt: string | null;
  updatedAt: string;
}

export interface WebPage extends WebPageListItem {
  blocks: Block[];
  seo: SiteSeo;
  revision: number;
  createdAt: string;
}

export interface WebPageListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: PageStatus;
}

export interface CreateWebPagePayload {
  title: string;
  slug?: string;
  showInNav?: boolean;
  navLabel?: string;
  templateKey?: string;
}

export interface UpdateWebPagePayload {
  title?: string;
  slug?: string;
  showInNav?: boolean;
  navLabel?: string;
  sortOrder?: number;
  seo?: Partial<SiteSeo>;
  blocks?: Block[];
  revision?: number;
}

export interface WebBuilderSettings {
  defaultPrimaryColor: string;
  defaultFont: SiteFont;
  defaultRadius: SiteRadius;
  defaultLanguage: string;
  defaultIndexable: boolean;
  defaultFooterText: string;
}

export interface FormBuilderSettings {
  notifyEmail: string;
  notifyOnSubmission: boolean;
  storeSubmissions: boolean;
  retentionDays: number;
  spamProtection: boolean;
  successMessage: string;
}

export interface EmailBuilderSettings {
  senderName: string;
  replyToEmail: string;
  brandColor: string;
  contentWidth: number;
  footerText: string;
}

export interface BusinessToolsSettings {
  _id: string;
  webBuilder: WebBuilderSettings;
  formBuilder: FormBuilderSettings;
  emailBuilder: EmailBuilderSettings;
  updatedAt: string;
}

export interface BusinessToolsSettingsPayload {
  webBuilder?: Partial<WebBuilderSettings>;
  formBuilder?: Partial<FormBuilderSettings>;
  emailBuilder?: Partial<EmailBuilderSettings>;
}
