import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useDebounce } from "@/hooks/use-debounce";
import { formatNumber } from "@/lib/amount";
import { cn } from "@/lib/utils";
import {
  useGetCommunityChatSummaryQuery,
  useGetCommunityConversationsQuery,
  useGetCommunityMembersQuery,
} from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type {
  CommunityConversation,
  CommunityConversationType,
} from "@/types/domain/community";
import { MessagesSquare, Plus } from "lucide-react";
import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { ConversationList, type ConversationScope } from "./components/ConversationList";
import { MessageThread } from "./components/MessageThread";
import { NewChatModal } from "./components/NewChatModal";

const CONVERSATION_LIMIT = 100;

export default function CommunityChatsPage() {
  const access = useModulePermission("/company/community/chats");
  const [searchParams, setSearchParams] = useSearchParams();

  const conversationIdParam = searchParams.get("conversationId");
  const groupIdParam = searchParams.get("groupId");

  const [search, setSearch] = React.useState("");
  const [scope, setScope] = React.useState<ConversationScope>("ALL");
  const [newChatOpen, setNewChatOpen] = React.useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error } = useGetCommunityConversationsQuery({
    limit: CONVERSATION_LIMIT,
    search: debouncedSearch || undefined,
    type:
      scope === "DIRECT" || scope === "GROUP"
        ? (scope as CommunityConversationType)
        : undefined,
    unreadOnly: scope === "UNREAD" ? true : undefined,
  });

  const { data: summary } = useGetCommunityChatSummaryQuery();
  const { data: members } = useGetCommunityMembersQuery({ limit: 100 });

  const myMemberId = React.useMemo(
    () => (members?.data ?? []).find((member) => member.isMe)?._id ?? null,
    [members]
  );

  const conversations = React.useMemo(() => data?.data ?? [], [data]);

  const selectConversation = React.useCallback(
    (conversation: CommunityConversation) => {
      const next = new URLSearchParams(searchParams);
      next.set("conversationId", conversation._id);
      next.delete("groupId");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const clearSelection = React.useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("conversationId");
    next.delete("groupId");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  React.useEffect(() => {
    if (!groupIdParam || conversations.length === 0) return;

    const match = conversations.find((conversation) => conversation.groupId === groupIdParam);
    if (!match) return;

    const next = new URLSearchParams(searchParams);
    next.set("conversationId", match._id);
    next.delete("groupId");
    setSearchParams(next, { replace: true });
  }, [groupIdParam, conversations, searchParams, setSearchParams]);

  const active = React.useMemo(
    () =>
      conversations.find((conversation) => conversation._id === conversationIdParam) ?? null,
    [conversations, conversationIdParam]
  );

  const showThreadOnMobile = Boolean(conversationIdParam);
  const notEnrolled = (error as ApiErrorResponse | undefined)?.status === 403;

  if (notEnrolled) {
    return (
      <>
        <PageHeader
          title="Community chats"
          description="Direct and group conversations between the people in your community."
          actions={<BackLink to="/company/community/overview" label="Community overview" />}
        />

        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-16 text-center">
          <MessagesSquare className="size-8 text-muted-foreground" />
          <p className="font-medium">You are not in the community yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {(error as ApiErrorResponse).data?.message ||
              "Ask an admin to add you under Community · Members, then your chats show up here."}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Community chats"
        description="Direct and group conversations between the people in your community."
        actions={<BackLink to="/company/community/overview" label="Community overview" />}
      />

      <StatGrid>
        <Stat>
          <StatLabel>Conversations</StatLabel>
          <StatValue>{formatNumber(summary?.conversationCount)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.groupCount)} group, {formatNumber(summary?.directCount)} direct
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Unread messages</StatLabel>
          <StatValue>{formatNumber(summary?.unreadCount)}</StatValue>
          <StatDescription>
            Across {formatNumber(summary?.unreadConversationCount)} conversation
            {summary?.unreadConversationCount === 1 ? "" : "s"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Group chats</StatLabel>
          <StatValue>{formatNumber(summary?.groupCount)}</StatValue>
          <StatDescription>One for every group you belong to</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Direct chats</StatLabel>
          <StatValue>{formatNumber(summary?.directCount)}</StatValue>
          <StatDescription>One-to-one threads you are part of</StatDescription>
        </Stat>
      </StatGrid>

      <div className="flex justify-end">
        {access.canCreate && (
          <ActionButton icon={Plus} label="New message" onClick={() => setNewChatOpen(true)} />
        )}
      </div>

      <div className="grid h-[68vh] min-h-125 grid-cols-1 overflow-hidden rounded-xl border bg-card lg:grid-cols-[320px_1fr]">
        <div
          className={cn(
            "min-h-0 border-b lg:border-b-0 lg:border-r",
            showThreadOnMobile ? "hidden lg:block" : "block"
          )}
        >
          <ConversationList
            conversations={conversations}
            activeId={conversationIdParam}
            isLoading={isLoading}
            search={search}
            scope={scope}
            onSearchChange={setSearch}
            onScopeChange={setScope}
            onSelect={selectConversation}
          />
        </div>

        <div className={cn("min-h-0", showThreadOnMobile ? "block" : "hidden lg:block")}>
          <MessageThread
            key={active?._id ?? "empty"}
            conversation={active}
            canSend={access.canCreate}
            canEditMessages={access.canEdit}
            canDeleteMessages={access.canDelete}
            onBack={clearSelection}
          />
        </div>
      </div>

      <NewChatModal
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        myMemberId={myMemberId}
        onStarted={selectConversation}
      />
    </>
  );
}
