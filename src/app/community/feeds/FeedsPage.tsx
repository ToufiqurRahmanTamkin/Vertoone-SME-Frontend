import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatNumber } from "@/lib/amount";
import {
  useDeleteCommunityPostMutation,
  useGetCommunityGroupOptionsQuery,
  useGetCommunityMembersQuery,
  useGetCommunityPostSummaryQuery,
  useGetCommunityPostsQuery,
  useGetCommunitySettingsQuery,
} from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  COMMUNITY_POST_STATUSES,
  COMMUNITY_POST_STATUS_LABELS,
  type CommunityPost,
  type CommunityPostStatus,
} from "@/types/domain/community";
import { MessagesSquare } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { PostCard } from "./components/PostCard";
import { PostComposer } from "./components/PostComposer";

const SKELETON_ROWS = Array.from({ length: 3 });

export default function CommunityFeedsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters(10);
  const access = useModulePermission("/company/community/feeds");

  const { data: settings } = useGetCommunitySettingsQuery();
  const { data: groups = [] } = useGetCommunityGroupOptionsQuery();
  const { data: summary } = useGetCommunityPostSummaryQuery();

  const { data: me } = useGetCommunityMembersQuery({ limit: 100 });
  const viewer = React.useMemo(
    () => (me?.data ?? []).find((member) => member.isMe) ?? null,
    [me]
  );

  const { data, isLoading, isFetching } = useGetCommunityPostsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as CommunityPostStatus | undefined,
    groupId: filters.groupId as string | undefined,
    mineOnly: filters.mineOnly === "true" ? true : undefined,
  });

  const [pendingDelete, setPendingDelete] = React.useState<CommunityPost | null>(null);
  const [deletePost, { isLoading: isDeleting }] = useDeleteCommunityPostMutation();

  const groupFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: COMMUNITY_POST_STATUSES.map((value) => ({
          value,
          label: COMMUNITY_POST_STATUS_LABELS[value],
        })),
      },
      {
        name: "groupId",
        label: "Group",
        type: "select",
        options: groups.map((group) => ({ value: group._id, label: group.name })),
      },
      {
        name: "mineOnly",
        label: "Author",
        type: "select",
        options: [{ label: "Only mine", value: "true" }],
      },
    ],
    [groups]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deletePost(pendingDelete._id).unwrap();
      toast.success("Post removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the post");
    }
  };

  const posts = data?.data ?? [];
  const meta = data?.meta;
  const hasMore = meta ? meta.page < meta.totalPages : false;

  return (
    <>
      <PageHeader
        title={settings?.branding.name || "Community feed"}
        description={
          settings?.branding.tagline ||
          "Posts with text, photos and video, plus the reactions and comments they collect."
        }
        actions={<BackLink to="/company/community/overview" label="Community overview" />}
      />

      <StatGrid className="lg:grid-cols-4">
        <Stat>
          <StatLabel>Posts</StatLabel>
          <StatValue>{formatNumber(summary?.publishedCount)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.postsThisWeek)} in the last seven days
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Reactions</StatLabel>
          <StatValue>{formatNumber(summary?.reactionCount)}</StatValue>
          <StatDescription>Across every post</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Comments</StatLabel>
          <StatValue>{formatNumber(summary?.commentCount)}</StatValue>
          <StatDescription>Across every post</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Waiting on approval</StatLabel>
          <StatValue>{formatNumber(summary?.pendingCount)}</StatValue>
          <StatDescription>{formatNumber(summary?.draftCount)} still in draft</StatDescription>
        </Stat>
      </StatGrid>

      {access.canCreate && (
        <PostComposer
          groups={groups}
          settings={settings}
          authorName={viewer?.displayName ?? "You"}
          authorAvatarUrl={viewer?.avatarUrl ?? ""}
          defaultGroupId={filters.groupId as string | undefined}
        />
      )}

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search the feed..."
        filters={groupFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
      />

      {isLoading ? (
        <div className="space-y-4">
          {SKELETON_ROWS.map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-16 text-center">
          <MessagesSquare className="size-8 text-muted-foreground" />
          <p className="font-medium">Nothing here yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The first post sets the tone. Share an update, a photo from the floor, or a question
            for everybody.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              allowComments={settings?.posting.allowComments ?? true}
              allowReactions={settings?.posting.allowReactions ?? true}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={isFetching}
            onClick={() => setFilter("limit", Number(filters.limit) + 10)}
          >
            {isFetching ? <LoadingSpinner /> : "Show more"}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this post?"
        description="It disappears from the feed along with its reactions and comments."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
