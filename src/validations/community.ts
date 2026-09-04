import {
  COMMUNITY_BADGE_ICONS,
  COMMUNITY_GROUP_VISIBILITIES,
  COMMUNITY_LEADERBOARD_PERIODS,
  COMMUNITY_MEMBER_ROLES,
  COMMUNITY_MEMBER_STATUSES,
  COMMUNITY_POST_PERMISSIONS,
} from "@/types/domain/community";
import { z } from "zod";

const hexColor = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^#[0-9a-f]{6}$/, "Use a hex colour like #0ea5e9");

const optionalUrl = z.union([z.literal(""), z.string().trim().url("That does not look like a link")]);

const wholeNumber = (max: number) =>
  z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value) && value >= 0 && value <= max, {
      message: `Enter a number between 0 and ${max}`,
    });

export const CommunityBadgeSchema = z.object({
  _id: z.string().optional(),
  name: z.string().trim().min(1, "A badge needs a name").max(60),
  description: z.string().trim().max(200),
  icon: z.enum(COMMUNITY_BADGE_ICONS),
  color: hexColor,
  pointsRequired: wholeNumber(1_000_000),
  isActive: z.boolean(),
});

export type CommunityBadgeFormValues = z.input<typeof CommunityBadgeSchema>;

export const CommunitySettingsSchema = z.object({
  name: z.string().trim().min(1, "The community needs a name").max(80),
  tagline: z.string().trim().max(160),
  logoUrl: optionalUrl,
  bannerUrl: optionalUrl,
  accentColor: hexColor,

  whoCanPost: z.enum(COMMUNITY_POST_PERMISSIONS),
  whoCanCreateGroups: z.enum(COMMUNITY_POST_PERMISSIONS),
  requirePostApproval: z.boolean(),
  allowComments: z.boolean(),
  allowReactions: z.boolean(),
  allowAttachments: z.boolean(),
  autoEnrolEmployees: z.boolean(),

  perPost: wholeNumber(1000),
  perComment: wholeNumber(1000),
  perReaction: wholeNumber(1000),
  perGroupJoin: wholeNumber(1000),

  leaderboardEnabled: z.boolean(),
  leaderboardPeriod: z.enum(COMMUNITY_LEADERBOARD_PERIODS),
  leaderboardSize: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value) && value >= 1 && value <= 50, {
      message: "Show between 1 and 50 people",
    }),
  leaderboardShowPoints: z.boolean(),

  badges: z.array(CommunityBadgeSchema).max(20),
});

export type CommunitySettingsFormValues = z.input<typeof CommunitySettingsSchema>;

export type CommunitySettingsFormOutput = z.output<typeof CommunitySettingsSchema>;

export const CommunityGroupSchema = z.object({
  name: z.string().trim().min(1, "A group needs a name").max(80),
  slug: z.string().trim().max(60),
  description: z.string().trim().max(600),
  color: hexColor,
  coverImageUrl: optionalUrl,
  visibility: z.enum(COMMUNITY_GROUP_VISIBILITIES),
  memberIds: z.array(z.string()),
  moderatorIds: z.array(z.string()),
  isArchived: z.boolean(),
});

export type CommunityGroupFormValues = z.infer<typeof CommunityGroupSchema>;

export const CommunityMemberSchema = z.object({
  displayName: z.string().trim().min(1, "A member needs a name").max(80),
  headline: z.string().trim().max(160),
  role: z.enum(COMMUNITY_MEMBER_ROLES),
  status: z.enum(COMMUNITY_MEMBER_STATUSES),
  badgeIds: z.array(z.string()),
});

export type CommunityMemberFormValues = z.infer<typeof CommunityMemberSchema>;
