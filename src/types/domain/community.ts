import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";

export const COMMUNITY_POST_PERMISSIONS = ["EVERYONE", "MODERATORS", "ADMINS"] as const;
export type CommunityPostPermission = (typeof COMMUNITY_POST_PERMISSIONS)[number];

export const COMMUNITY_POST_PERMISSION_LABELS: Record<CommunityPostPermission, string> = {
  EVERYONE: "Everyone",
  MODERATORS: "Moderators and admins",
  ADMINS: "Admins only",
};

export const COMMUNITY_LEADERBOARD_PERIODS = [
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
  "ALL_TIME",
] as const;
export type CommunityLeaderboardPeriod = (typeof COMMUNITY_LEADERBOARD_PERIODS)[number];

export const COMMUNITY_LEADERBOARD_PERIOD_LABELS: Record<CommunityLeaderboardPeriod, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
  ALL_TIME: "All time",
};

export const COMMUNITY_BADGE_ICONS = [
  "Award",
  "Medal",
  "Trophy",
  "Star",
  "Crown",
  "Flame",
  "Sparkles",
  "Heart",
  "ThumbsUp",
  "Zap",
  "Target",
  "Rocket",
] as const;
export type CommunityBadgeIcon = (typeof COMMUNITY_BADGE_ICONS)[number];

export const COMMUNITY_MEMBER_ROLES = ["ADMIN", "MODERATOR", "MEMBER"] as const;
export type CommunityMemberRole = (typeof COMMUNITY_MEMBER_ROLES)[number];

export const COMMUNITY_MEMBER_ROLE_LABELS: Record<CommunityMemberRole, string> = {
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  MEMBER: "Member",
};

export const COMMUNITY_MEMBER_ROLE_COLORS: Record<CommunityMemberRole, StatusColor> = {
  ADMIN: "violet",
  MODERATOR: "blue",
  MEMBER: "zinc",
};

export const COMMUNITY_MEMBER_STATUSES = ["ACTIVE", "INVITED", "SUSPENDED"] as const;
export type CommunityMemberStatus = (typeof COMMUNITY_MEMBER_STATUSES)[number];

export const COMMUNITY_MEMBER_STATUS_LABELS: Record<CommunityMemberStatus, string> = {
  ACTIVE: "Active",
  INVITED: "Invited",
  SUSPENDED: "Suspended",
};

export const COMMUNITY_MEMBER_STATUS_COLORS: Record<CommunityMemberStatus, StatusColor> = {
  ACTIVE: "green",
  INVITED: "amber",
  SUSPENDED: "red",
};

export const COMMUNITY_GROUP_VISIBILITIES = ["OPEN", "CLOSED", "SECRET"] as const;
export type CommunityGroupVisibility = (typeof COMMUNITY_GROUP_VISIBILITIES)[number];

export const COMMUNITY_GROUP_VISIBILITY_LABELS: Record<CommunityGroupVisibility, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
  SECRET: "Secret",
};

export const COMMUNITY_GROUP_VISIBILITY_COLORS: Record<CommunityGroupVisibility, StatusColor> = {
  OPEN: "green",
  CLOSED: "amber",
  SECRET: "zinc",
};

export const COMMUNITY_GROUP_VISIBILITY_HINTS: Record<CommunityGroupVisibility, string> = {
  OPEN: "Public — anybody in the community can find it.",
  CLOSED: "Private — people can find it but a moderator lets them in.",
  SECRET: "Hidden — only its members know it exists.",
};

export const COMMUNITY_GROUP_JOIN_MODES = ["INSTANT", "REQUEST", "INVITE"] as const;
export type CommunityGroupJoinMode = (typeof COMMUNITY_GROUP_JOIN_MODES)[number];

export const COMMUNITY_GROUP_JOIN_MODE_LABELS: Record<CommunityGroupJoinMode, string> = {
  INSTANT: "Anyone can join",
  REQUEST: "Approval needed",
  INVITE: "Invite only",
};

export const COMMUNITY_JOIN_REQUEST_STATUSES = ["PENDING", "APPROVED", "DECLINED"] as const;
export type CommunityJoinRequestStatus = (typeof COMMUNITY_JOIN_REQUEST_STATUSES)[number];

export const COMMUNITY_JOIN_REQUEST_STATUS_LABELS: Record<CommunityJoinRequestStatus, string> = {
  PENDING: "Waiting",
  APPROVED: "Approved",
  DECLINED: "Declined",
};

export const COMMUNITY_JOIN_REQUEST_STATUS_COLORS: Record<CommunityJoinRequestStatus, StatusColor> =
  {
    PENDING: "amber",
    APPROVED: "green",
    DECLINED: "red",
  };

export const COMMUNITY_POST_STATUSES = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED",
] as const;
export type CommunityPostStatus = (typeof COMMUNITY_POST_STATUSES)[number];

export const COMMUNITY_POST_STATUS_LABELS: Record<CommunityPostStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Awaiting approval",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

export const COMMUNITY_POST_STATUS_COLORS: Record<CommunityPostStatus, StatusColor> = {
  DRAFT: "zinc",
  PENDING: "amber",
  PUBLISHED: "green",
  REJECTED: "red",
  ARCHIVED: "muted",
};

export const COMMUNITY_ATTACHMENT_TYPES = ["IMAGE", "VIDEO", "FILE"] as const;
export type CommunityAttachmentType = (typeof COMMUNITY_ATTACHMENT_TYPES)[number];

export const COMMUNITY_REACTIONS = [
  "LIKE",
  "LOVE",
  "CELEBRATE",
  "INSIGHTFUL",
  "SUPPORT",
] as const;
export type CommunityReaction = (typeof COMMUNITY_REACTIONS)[number];

export const COMMUNITY_REACTION_LABELS: Record<CommunityReaction, string> = {
  LIKE: "Like",
  LOVE: "Love",
  CELEBRATE: "Celebrate",
  INSIGHTFUL: "Insightful",
  SUPPORT: "Support",
};

export const COMMUNITY_REACTION_EMOJI: Record<CommunityReaction, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  CELEBRATE: "🎉",
  INSIGHTFUL: "💡",
  SUPPORT: "🤝",
};

export interface CommunityBadge {
  _id: string;
  name: string;
  description: string;
  icon: CommunityBadgeIcon;
  color: string;
  pointsRequired: number;
  isActive: boolean;
}

export interface CommunityBranding {
  name: string;
  tagline: string;
  logoUrl: string;
  bannerUrl: string;
  accentColor: string;
}

export interface CommunityPosting {
  whoCanPost: CommunityPostPermission;
  whoCanCreateGroups: CommunityPostPermission;
  requirePostApproval: boolean;
  allowComments: boolean;
  allowReactions: boolean;
  allowAttachments: boolean;
  autoEnrolEmployees: boolean;
}

export interface CommunityPoints {
  perPost: number;
  perComment: number;
  perReaction: number;
  perGroupJoin: number;
}

export interface CommunityLeaderboard {
  isEnabled: boolean;
  period: CommunityLeaderboardPeriod;
  size: number;
  showPoints: boolean;
}

export interface CommunitySettings {
  _id: string;
  branding: CommunityBranding;
  posting: CommunityPosting;
  points: CommunityPoints;
  leaderboard: CommunityLeaderboard;
  badges: CommunityBadge[];
  updatedAt: string;
}

export interface CommunitySettingsPayload {
  branding?: Partial<CommunityBranding>;
  posting?: Partial<CommunityPosting>;
  points?: Partial<CommunityPoints>;
  leaderboard?: Partial<CommunityLeaderboard>;
  badges?: {
    _id?: string;
    name: string;
    description?: string;
    icon?: CommunityBadgeIcon;
    color?: string;
    pointsRequired?: number;
    isActive?: boolean;
  }[];
}

export interface CommunityMemberRef {
  _id: string;
  displayName: string;
  avatarUrl: string;
  role: CommunityMemberRole;
}

export interface CommunityMember extends CommunityMemberRef {
  userId: string;
  employeeId: string | null;
  employee: EmployeeRef | null;
  email: string;
  headline: string;
  status: CommunityMemberStatus;
  points: number;
  postCount: number;
  commentCount: number;
  reactionCount: number;
  groupCount: number;
  badgeIds: string[];
  badges: CommunityBadge[];
  joinedAt: string;
  lastActiveAt: string | null;
  isMe: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMemberListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  role?: CommunityMemberRole;
  status?: CommunityMemberStatus;
  groupId?: string;
}

export interface CommunityMemberSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  invitedCount: number;
  suspendedCount: number;
  moderatorCount: number;
  totalPoints: number;
}

export interface CommunityMemberOption {
  _id: string;
  displayName: string;
  avatarUrl: string;
  role: CommunityMemberRole;
}

export interface CommunityCandidate {
  _id: string;
  name: string;
  email: string;
  avatarUrl: string;
  employeeId: string | null;
}

export interface EnrolCommunityMembersPayload {
  userIds: string[];
  role?: CommunityMemberRole;
}

export interface CommunityMemberPayload {
  displayName?: string;
  headline?: string;
  avatarUrl?: string;
  role?: CommunityMemberRole;
  status?: CommunityMemberStatus;
  badgeIds?: string[];
}

export interface CommunityGroupRef {
  _id: string;
  name: string;
  slug: string;
  color: string;
  logoUrl: string;
}

export interface CommunityGroup extends CommunityGroupRef {
  description: string;
  bannerUrl: string;
  visibility: CommunityGroupVisibility;
  requiresApproval: boolean;
  joinMode: CommunityGroupJoinMode;
  memberIds: string[];
  members: CommunityMemberRef[];
  moderatorIds: string[];
  moderators: CommunityMemberRef[];
  memberCount: number;
  postCount: number;
  isArchived: boolean;
  archivedAt: string | null;
  isJoined: boolean;
  isModerator: boolean;
  hasPendingRequest: boolean;
  canJoin: boolean;
  canRequestToJoin: boolean;
  pendingRequestCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityGroupListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  visibility?: CommunityGroupVisibility;
  memberId?: string;
  isArchived?: boolean;
  joinedByMe?: boolean;
}

export interface CommunityGroupSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  archivedCount: number;
  openCount: number;
  privateCount: number;
  averageMembers: number;
  pendingRequestCount: number;
}

export interface CommunityGroupOption {
  _id: string;
  name: string;
  color: string;
  logoUrl: string;
  visibility: CommunityGroupVisibility;
  isJoined: boolean;
}

export interface CommunityGroupPayload {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  logoUrl: string;
  bannerUrl: string;
  visibility?: CommunityGroupVisibility;
  requiresApproval?: boolean;
  memberIds?: string[];
  moderatorIds?: string[];
  isArchived?: boolean;
}

export interface CommunityAttachment {
  type: CommunityAttachmentType;
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface CommunityComment {
  _id: string;
  memberId: string;
  member: CommunityMemberRef | null;
  body: string;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityReactionCount {
  type: CommunityReaction;
  count: number;
}

export interface CommunityPost {
  _id: string;
  body: string;
  excerpt: string;
  attachments: CommunityAttachment[];
  linkUrl: string;
  status: CommunityPostStatus;
  groupId: string | null;
  group: CommunityGroupRef | null;
  authorId: string;
  author: CommunityMemberRef | null;
  isPinned: boolean;
  pinnedAt: string | null;
  isCommentingClosed: boolean;
  reactionCount: number;
  reactionCounts: CommunityReactionCount[];
  myReaction: CommunityReaction | null;
  commentCount: number;
  comments: CommunityComment[];
  viewCount: number;
  publishedAt: string | null;
  isMine: boolean;
  canModerate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: CommunityPostStatus;
  groupId?: string;
  authorId?: string;
  isPinned?: boolean;
  mineOnly?: boolean;
}

export interface CommunityPostSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  publishedCount: number;
  pendingCount: number;
  draftCount: number;
  archivedCount: number;
  reactionCount: number;
  commentCount: number;
  postsThisWeek: number;
}

export interface CommunityPostPayload {
  body: string;
  groupId?: string | null;
  attachments?: CommunityAttachment[];
  linkUrl?: string;
  status?: CommunityPostStatus;
  isPinned?: boolean;
  isCommentingClosed?: boolean;
}

export interface CommunityOverviewKpis {
  memberCount: number;
  activeMemberCount: number;
  groupCount: number;
  postCount: number;
  publishedCount: number;
  pendingCount: number;
  reactionCount: number;
  commentCount: number;
  postsThisWeek: number;
  postsLastWeek: number;
  postChangePercent: number;
  engagementPerPost: number;
}

export interface CommunityActivityPoint {
  date: string;
  posts: number;
  comments: number;
  reactions: number;
}

export interface CommunityLeaderRow {
  _id: string;
  displayName: string;
  avatarUrl: string;
  role: CommunityMemberRole;
  points: number;
  postCount: number;
  commentCount: number;
  badgeCount: number;
}

export interface CommunityGroupActivityRow {
  _id: string;
  name: string;
  color: string;
  visibility: CommunityGroupVisibility;
  memberCount: number;
  postCount: number;
}

export interface CommunityOverview {
  name: string;
  tagline: string;
  logoUrl: string;
  bannerUrl: string;
  accentColor: string;
  leaderboardEnabled: boolean;
  kpis: CommunityOverviewKpis;
  activity: CommunityActivityPoint[];
  leaders: CommunityLeaderRow[];
  groups: CommunityGroupActivityRow[];
  reactions: CommunityReactionCount[];
  topPosts: CommunityPost[];
  isMember: boolean;
}

export interface CommunityJoinRequest {
  _id: string;
  groupId: string;
  group: CommunityGroupRef | null;
  memberId: string;
  member: CommunityMemberRef | null;
  message: string;
  status: CommunityJoinRequestStatus;
  decidedById: string | null;
  decidedBy: CommunityMemberRef | null;
  decidedAt: string | null;
  decisionNote: string;
  isMine: boolean;
  canDecide: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityJoinRequestListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  groupId?: string;
  status?: CommunityJoinRequestStatus;
  mineOnly?: boolean;
}

export interface CommunityJoinRequestSummary {
  pendingCount: number;
  approvedCount: number;
  declinedCount: number;
  myPendingCount: number;
}

export interface CommunityJoinRequestPayload {
  groupId: string;
  message?: string;
}

export const COMMUNITY_CONVERSATION_TYPES = ["DIRECT", "GROUP"] as const;
export type CommunityConversationType = (typeof COMMUNITY_CONVERSATION_TYPES)[number];

export const COMMUNITY_CONVERSATION_TYPE_LABELS: Record<CommunityConversationType, string> = {
  DIRECT: "Direct",
  GROUP: "Group",
};

export const COMMUNITY_MESSAGE_KINDS = ["TEXT", "SYSTEM"] as const;
export type CommunityMessageKind = (typeof COMMUNITY_MESSAGE_KINDS)[number];

export interface CommunityMessageAttachment {
  type: CommunityAttachmentType;
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface CommunityMessageRef {
  _id: string;
  senderId: string | null;
  sender: CommunityMemberRef | null;
  body: string;
  createdAt: string;
}

export interface CommunityMessage {
  _id: string;
  conversationId: string;
  senderId: string | null;
  sender: CommunityMemberRef | null;
  kind: CommunityMessageKind;
  body: string;
  attachments: CommunityMessageAttachment[];
  replyToId: string | null;
  replyTo: CommunityMessageRef | null;
  readCount: number;
  isMine: boolean;
  isEdited: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityConversation {
  _id: string;
  type: CommunityConversationType;
  title: string;
  avatarUrl: string;
  groupId: string | null;
  group: CommunityGroupRef | null;
  participantIds: string[];
  participants: CommunityMemberRef[];
  participantCount: number;
  counterpartId: string | null;
  counterpart: CommunityMemberRef | null;
  lastMessageAt: string | null;
  lastMessagePreview: string;
  lastMessageSenderId: string | null;
  messageCount: number;
  unreadCount: number;
  lastReadAt: string | null;
  canPost: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityConversationListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  type?: CommunityConversationType;
  unreadOnly?: boolean;
}

export interface CommunityMessageListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface CommunityChatSummary {
  conversationCount: number;
  directCount: number;
  groupCount: number;
  unreadCount: number;
  unreadConversationCount: number;
}

export interface SendCommunityMessagePayload {
  body?: string;
  attachments?: CommunityMessageAttachment[];
  replyToId?: string | null;
}

export const initialsOf = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
