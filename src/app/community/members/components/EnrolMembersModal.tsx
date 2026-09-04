import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnrolCommunityMembersMutation, useGetCommunityCandidatesQuery } from "@/redux/apis/communityApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import {
  COMMUNITY_MEMBER_ROLES,
  COMMUNITY_MEMBER_ROLE_LABELS,
  type CommunityMemberRole,
} from "@/types/domain/community";
import { Loader2, Search } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { MemberAvatar } from "./MemberAvatar";

interface EnrolMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remaining: number | null;
}

const ROLE_OPTIONS = COMMUNITY_MEMBER_ROLES.map((value) => ({
  value,
  label: COMMUNITY_MEMBER_ROLE_LABELS[value],
}));

export function EnrolMembersModal({ open, onOpenChange, remaining }: EnrolMembersModalProps) {
  const [search, setSearch] = React.useState("");
  const [picked, setPicked] = React.useState<Record<string, boolean>>({});
  const [role, setRole] = React.useState<CommunityMemberRole>("MEMBER");

  const { data: candidates = [], isFetching } = useGetCommunityCandidatesQuery(
    { search: search.trim() || undefined },
    { skip: !open }
  );

  const [enrol, { isLoading: isSaving }] = useEnrolCommunityMembersMutation();

  const [seededFor, setSeededFor] = React.useState(false);
  if (seededFor !== open) {
    setSeededFor(open);
    setPicked({});
    setSearch("");
    setRole("MEMBER");
  }

  const selectedIds = Object.keys(picked).filter((id) => picked[id]);
  const overAllowance = remaining !== null && selectedIds.length > remaining;

  const onSave = async () => {
    try {
      const created = await enrol({ userIds: selectedIds, role }).unwrap();
      toast.success(`${created.length} member${created.length === 1 ? "" : "s"} added`);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not add those people");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add people to the community</DialogTitle>
          <DialogDescription>
            Everybody with an account in your company who is not a member yet. They can post the
            moment you add them.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
            <div className="space-y-1.5">
              <Label htmlFor="candidate-search">Find somebody</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="candidate-search"
                  value={search}
                  className="pl-9"
                  placeholder="Name or email"
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="enrol-role">Join as</Label>
              <Select value={role} onValueChange={(value) => setRole(value as CommunityMemberRole)}>
                <SelectTrigger id="enrol-role" className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="max-h-72 divide-y overflow-y-auto rounded-lg border">
            {isFetching && candidates.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">Looking…</p>
            )}
            {!isFetching && candidates.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Everybody in your company is already a member.
              </p>
            )}
            {candidates.map((candidate) => (
              <label
                key={candidate._id}
                className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/40"
              >
                <Checkbox
                  checked={picked[candidate._id] ?? false}
                  onCheckedChange={(checked) =>
                    setPicked((previous) => ({ ...previous, [candidate._id]: checked === true }))
                  }
                />
                <MemberAvatar name={candidate.name} avatarUrl={candidate.avatarUrl} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{candidate.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {candidate.email}
                  </span>
                </span>
                {candidate.employeeId && (
                  <Badge variant="secondary" className="text-[10px]">
                    Employee
                  </Badge>
                )}
              </label>
            ))}
          </div>

          {overAllowance && (
            <p className="text-xs text-amber-600">
              Your plan has room for {remaining} more. Unselect a few or the rest will fail.
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={selectedIds.length === 0 || isSaving}
            onClick={onSave}
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            Add {selectedIds.length > 0 ? selectedIds.length : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
