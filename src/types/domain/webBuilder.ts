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

export interface WebSite {
  _id: string;
  slug: string;
  name: string;
  tagline: string;
  language: string;
  logoUrl: string | null;
  logoPublicId: string | null;
  faviconUrl: string | null;
  faviconPublicId: string | null;
  theme: SiteTheme;
  header: SiteHeader;
  footer: SiteFooter;
  contact: SiteContact;
  socials: SiteSocial[];
  seo: SiteSeo;
  isPublished: boolean;
  publishedAt: string | null;
  publicPath: string;
  publicUrl: string;
  createdAt: string;
  updatedAt: string;
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
  isPublished: boolean;
  publicUrl: string;
  publicPath: string;
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  pagesWithUnpublishedChanges: number;
  homePageTitle: string;
  lastPublishedAt: string | null;
  pageLimit: number | null;
  pagesRemaining: number | null;
}

export type PageStatus = "DRAFT" | "PUBLISHED";

export type PageTemplate = "BLANK" | "LANDING" | "ABOUT" | "SERVICES" | "CONTACT";

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
  template?: PageTemplate;
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
