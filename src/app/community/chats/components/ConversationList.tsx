import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { safeDistanceToNow } from "@/lib/date";
import type {
  CommunityConversation,
  CommunityConversationType,
} from "@/types/domain/community";
import { MessagesSquare, Search } from "lucide-react";
import { GroupAvatar } from "../../groups/components/GroupAvatar";
import { MemberAvatar } from "../../members/components/MemberAvatar";

export type ConversationScope = "ALL" | CommunityConversationType | "UNREAD";

interface ConversationListProps {
  conversations: CommunityConversation[];
  activeId: string | null;
  isLoading: boolean;
  search: string;
  scope: ConversationScope;
  onSearchChange: (value: string) => void;
  onScopeChange: (value: ConversationScope) => void;
  onSelect: (conversation: CommunityConversation) => void;
}

const SKELETON_ROWS = Array.from({ length: 5 });

const SCOPES: { value: ConversationScope; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "DIRECT", label: "Direct" },
  { value: "GROUP", label: "Groups" },
  { value: "UNREAD", label: "Unread" },
];

export function ConversationList({
  conversations,
  activeId,
  isLoading,
  search,
  scope,
  onSearchChange,
  onScopeChange,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 border-b p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search conversations..."
            className="pl-9"
            aria-label="Search conversations"
          />
        </div>

        <Tabs value={scope} onValueChange={(value) => onScopeChange(value as ConversationScope)}>
          <TabsList className="grid w-full grid-cols-4">
            {SCOPES.map((entry) => (
              <TabsTrigger key={entry.value} value={entry.value} className="text-xs">
                {entry.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {SKELETON_ROWS.map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <MessagesSquare className="size-7 text-muted-foreground" />
            <p className="text-sm font-medium">No conversations</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Join a group to get its chat, or start a direct message with somebody.
            </p>
          </div>
        ) : (
          <ul>
            {conversations.map((conversation) => (
              <li key={conversation._id}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 border-b px-3 py-3 text-left transition-colors hover:bg-muted/60",
                    activeId === conversation._id && "bg-muted"
                  )}
                >
                  {conversation.type === "GROUP" ? (
                    <GroupAvatar
                      name={conversation.title}
                      color={conversation.group?.color ?? "#8b5cf6"}
                      logoUrl={conversation.avatarUrl}
                      className="size-10"
                    />
                  ) : (
                    <MemberAvatar
                      name={conversation.title}
                      avatarUrl={conversation.avatarUrl}
                      className="size-10"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-sm",
                          conversation.unreadCount > 0 ? "font-semibold" : "font-medium"
                        )}
                      >
                        {conversation.title}
                      </p>
                      {conversation.lastMessageAt && (
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {safeDistanceToNow(conversation.lastMessageAt, "")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted-foreground">
                        {conversation.lastMessagePreview || "No messages yet"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="h-5 min-w-5 shrink-0 justify-center px-1.5 text-[10px]">
                          {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
