import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetCommunityMemberOptionsQuery,
  useStartCommunityDirectChatMutation,
} from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  COMMUNITY_MEMBER_ROLE_LABELS,
  type CommunityConversation,
} from "@/types/domain/community";
import { Loader2, Search, UsersRound } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { MemberAvatar } from "../../members/components/MemberAvatar";

interface NewChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  myMemberId: string | null;
  onStarted: (conversation: CommunityConversation) => void;
}

const SKELETON_ROWS = Array.from({ length: 5 });

export function NewChatModal({ open, onOpenChange, ...rest }: NewChatModalProps) {
  const [session, setSession] = React.useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setSession((current) => current + 1);
        onOpenChange(next);
      }}
    >
      {open && <NewChatBody key={session} open={open} onOpenChange={onOpenChange} {...rest} />}
    </Dialog>
  );
}

function NewChatBody({ open, onOpenChange, myMemberId, onStarted }: NewChatModalProps) {
  const { data: members = [], isLoading } = useGetCommunityMemberOptionsQuery(undefined, {
    skip: !open,
  });

  const [startDirect, { isLoading: isStarting }] = useStartCommunityDirectChatMutation();

  const [search, setSearch] = React.useState("");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const candidates = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return members
      .filter((member) => member._id !== myMemberId)
      .filter((member) => !needle || member.displayName.toLowerCase().includes(needle));
  }, [members, myMemberId, search]);

  const start = async (memberId: string, name: string) => {
    setPendingId(memberId);
    try {
      const conversation = await startDirect(memberId).unwrap();
      onStarted(conversation);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || `Could not open a chat with ${name}`);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>New message</DialogTitle>
        <DialogDescription>
          Pick somebody in the community to start a one-to-one chat with.
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people..."
            className="pl-9"
            aria-label="Search people"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {SKELETON_ROWS.map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center">
            <UsersRound className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Nobody to message</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Add people under Community · Members and they will show up here.
            </p>
          </div>
        ) : (
          <ul className="max-h-80 divide-y overflow-y-auto rounded-lg border">
            {candidates.map((member) => (
              <li key={member._id}>
                <button
                  type="button"
                  disabled={isStarting}
                  onClick={() => void start(member._id, member.displayName)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  <MemberAvatar name={member.displayName} avatarUrl={member.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {COMMUNITY_MEMBER_ROLE_LABELS[member.role]}
                    </p>
                  </div>
                  {pendingId === member._id && <Loader2 className="size-4 animate-spin" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogBody>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
