import { BreakdownBars, type BreakdownRow } from "@/app/dashboard/components/BreakdownBars";
import { KpiCard } from "@/app/dashboard/components/KpiCard";
import { MemberAvatar } from "@/app/community/members/components/MemberAvatar";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatGrid } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { formatNumber } from "@/lib/amount";
import { safeDistanceToNow } from "@/lib/date";
import { useGetCommunityOverviewQuery } from "@/redux/apis/communityApis";
import {
  COMMUNITY_GROUP_VISIBILITY_COLORS,
  COMMUNITY_GROUP_VISIBILITY_LABELS,
  COMMUNITY_MEMBER_ROLE_LABELS,
  COMMUNITY_REACTION_EMOJI,
  COMMUNITY_REACTION_LABELS,
} from "@/types/domain/community";
import {
  Activity,
  Heart,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Trophy,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CommunityActivityChart } from "./components/CommunityActivityChart";

const LIST_SKELETON = Array.from({ length: 5 });

const REACTION_COLORS = ["blue", "red", "amber", "violet", "green"] as const;

export default function CommunityOverviewPage() {
  const { data, isLoading } = useGetCommunityOverviewQuery();

  const feedAccess = useModulePermission("/company/community/feeds");
  const membersAccess = useModulePermission("/company/community/members");
  const groupsAccess = useModulePermission("/company/community/groups");

  const kpis = data?.kpis;

  const kpiCards = [
    {
      label: "Members",
      value: formatNumber(kpis?.memberCount),
      description: `${formatNumber(kpis?.activeMemberCount)} active right now`,
      icon: UsersRound,
      color: "info" as const,
    },
    {
      label: "Posts",
      value: formatNumber(kpis?.publishedCount),
      description: `${formatNumber(kpis?.postsThisWeek)} this week · ${formatNumber(
        kpis?.pendingCount
      )} awaiting approval`,
      icon: Newspaper,
      color: "default" as const,
      changePercent: kpis?.postChangePercent,
    },
    {
      label: "Engagement",
      value: formatNumber((kpis?.reactionCount ?? 0) + (kpis?.commentCount ?? 0)),
      description: `${formatNumber(kpis?.reactionCount)} reactions · ${formatNumber(
        kpis?.commentCount
      )} comments`,
      icon: Heart,
      color: "success" as const,
    },
    {
      label: "Per post",
      value: `${kpis?.engagementPerPost ?? 0}`,
      description: "Reactions and comments the average post collects",
      icon: Activity,
      color: (kpis?.engagementPerPost ?? 0) > 0 ? ("success" as const) : ("default" as const),
    },
  ];

  const groupRows: BreakdownRow[] = (data?.groups ?? []).map((group, index) => ({
    key: group._id,
    label: group.name,
    count: group.postCount,
    color: REACTION_COLORS[index % REACTION_COLORS.length],
    valueLabel: `${group.postCount} posts · ${group.memberCount} members`,
  }));

  const reactionRows: BreakdownRow[] = (data?.reactions ?? []).map((reaction, index) => ({
    key: reaction.type,
    label: `${COMMUNITY_REACTION_EMOJI[reaction.type]} ${COMMUNITY_REACTION_LABELS[reaction.type]}`,
    count: reaction.count,
    color: REACTION_COLORS[index % REACTION_COLORS.length],
  }));

  return (
    <>
      <PageHeader
        title={data?.name || "Community"}
        description={
          data?.tagline || "Activity, top posts and how engaged your people have been."
        }
      />

      {data?.bannerUrl && (
        <div className="overflow-hidden rounded-xl border">
          <img
            src={data.bannerUrl}
            alt={data.name}
            className="h-32 w-full object-cover sm:h-44"
          />
        </div>
      )}

      <StatGrid className="lg:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <SectionCard
        icon={Activity}
        title="What has been happening"
        description="Posts, comments and reactions day by day over the last month."
      >
        <CommunityActivityChart points={data?.activity ?? []} isLoading={isLoading} />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {(data?.leaderboardEnabled ?? true) && (
          <SectionCard
            icon={Trophy}
            title="Leaderboard"
            description="Who has put the most in, scored on the points you set in settings."
            action={
              membersAccess.canView ? (
                <Link
                  to="/company/community/members"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  All members
                </Link>
              ) : undefined
            }
          >
            {isLoading ? (
              <div className="space-y-3">
                {LIST_SKELETON.map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (data?.leaders ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nobody has earned any points yet.
              </p>
            ) : (
              <ol className="space-y-2">
                {(data?.leaders ?? []).map((leader, index) => (
                  <li key={leader._id} className="flex items-center gap-3">
                    <span className="w-5 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <MemberAvatar name={leader.displayName} avatarUrl={leader.avatarUrl} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{leader.displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatNumber(leader.postCount)} posts ·{" "}
                        {formatNumber(leader.commentCount)} comments
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {leader.badgeCount > 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          {leader.badgeCount} badge{leader.badgeCount === 1 ? "" : "s"}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {formatNumber(leader.points)} pts
                      </Badge>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>
        )}

        <SectionCard
          icon={UsersRound}
          title="Busiest groups"
          description="Where the conversation is actually happening."
          action={
            groupsAccess.canView ? (
              <Link
                to="/company/community/groups"
                className="text-xs font-medium text-primary hover:underline"
              >
                All groups
              </Link>
            ) : undefined
          }
        >
          <BreakdownBars
            rows={groupRows}
            isLoading={isLoading}
            emptyMessage="No groups with posts yet."
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={MessagesSquare}
          title="Top posts"
          description="The posts people reacted to and commented on the most."
          action={
            feedAccess.canView ? (
              <Link
                to="/company/community/feeds"
                className="text-xs font-medium text-primary hover:underline"
              >
                Open the feed
              </Link>
            ) : undefined
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : (data?.topPosts ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing has been posted yet.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.topPosts ?? []).map((post) => (
                <li key={post._id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                  <MemberAvatar
                    name={post.author?.displayName ?? "Someone"}
                    avatarUrl={post.author?.avatarUrl}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm">{post.excerpt || "(no text)"}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {post.author?.displayName ?? "Someone"}
                      {post.group ? ` in ${post.group.name}` : ""} ·{" "}
                      {safeDistanceToNow(post.publishedAt ?? post.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="size-3.5" />
                      {formatNumber(post.reactionCount)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="size-3.5" />
                      {formatNumber(post.commentCount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={Heart}
          title="How people react"
          description="The spread of reactions across everything posted so far."
        >
          <BreakdownBars
            rows={reactionRows}
            isLoading={isLoading}
            emptyMessage="Nobody has reacted to anything yet."
          />

          {!isLoading && (data?.groups ?? []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1 border-t pt-4">
              {(data?.groups ?? []).map((group) => (
                <StatusBadge
                  key={group._id}
                  color={COMMUNITY_GROUP_VISIBILITY_COLORS[group.visibility]}
                  label={`${group.name} · ${COMMUNITY_GROUP_VISIBILITY_LABELS[group.visibility]}`}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {!isLoading && data && !data.isMember && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          You are not a member of this community yet, so you cannot post or comment. Ask a
          community admin to add you under Community · Members.
        </p>
      )}

      {!isLoading && (data?.leaders ?? []).length > 0 && (
        <p className="text-xs text-muted-foreground">
          Roles shown on the leaderboard:{" "}
          {[...new Set((data?.leaders ?? []).map((leader) => leader.role))]
            .map((role) => COMMUNITY_MEMBER_ROLE_LABELS[role])
            .join(", ")}
          .
        </p>
      )}
    </>
  );
}
