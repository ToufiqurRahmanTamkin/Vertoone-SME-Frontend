export const GUIDE_CATEGORIES = [
  "GETTING_STARTED",
  "ACCOUNT",
  "BILLING",
  "SUBSCRIPTIONS",
  "CONFIGURATION",
  "TROUBLESHOOTING",
  "FAQ",
] as const;
export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export const GUIDE_AUDIENCES = ["SUPER_ADMIN", "CUSTOMER", "EVERYONE"] as const;
export type GuideAudience = (typeof GUIDE_AUDIENCES)[number];

export interface UserGuide {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: GuideCategory;
  audience: GuideAudience;
  tags: string[];
  sortOrder: number;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GuideListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  category?: GuideCategory;
  audience?: GuideAudience;
  isPublished?: boolean;
}

export interface GuidePayload {
  title: string;
  /** Omitted on create — the server slugifies the title and de-duplicates. */
  slug?: string;
  summary?: string;
  content: string;
  category?: GuideCategory;
  audience?: GuideAudience;
  tags?: string[];
  sortOrder?: number;
  isPublished?: boolean;
}
