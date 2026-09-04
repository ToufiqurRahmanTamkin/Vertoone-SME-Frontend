import {
  FormInput,
  FormMultiSelect,
  FormSelect,
  type MultiSelectOption,
} from "@/components/shared/form-fields";
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
import { Form } from "@/components/ui/form";
import {
  useGetCommunitySettingsQuery,
  useUpdateCommunityMemberMutation,
} from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  COMMUNITY_MEMBER_ROLES,
  COMMUNITY_MEMBER_ROLE_LABELS,
  COMMUNITY_MEMBER_STATUSES,
  COMMUNITY_MEMBER_STATUS_LABELS,
  type CommunityMember,
} from "@/types/domain/community";
import { CommunityMemberSchema, type CommunityMemberFormValues } from "@/validations/community";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface MemberFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: CommunityMember | null;
}

const ROLE_OPTIONS = COMMUNITY_MEMBER_ROLES.map((value) => ({
  value,
  label: COMMUNITY_MEMBER_ROLE_LABELS[value],
}));

const STATUS_OPTIONS = COMMUNITY_MEMBER_STATUSES.map((value) => ({
  value,
  label: COMMUNITY_MEMBER_STATUS_LABELS[value],
}));

const emptyValues = (): CommunityMemberFormValues => ({
  displayName: "",
  headline: "",
  role: "MEMBER",
  status: "ACTIVE",
  badgeIds: [],
});

export function MemberFormModal({ open, onOpenChange, member }: MemberFormModalProps) {
  const [updateMember, { isLoading }] = useUpdateCommunityMemberMutation();
  const { data: settings } = useGetCommunitySettingsQuery(undefined, { skip: !open });

  const badgeChoices = React.useMemo<MultiSelectOption[]>(
    () =>
      (settings?.badges ?? []).map((badge) => ({
        value: badge._id,
        label: badge.name,
        color: badge.color,
        hint: `${badge.pointsRequired} pts`,
      })),
    [settings]
  );

  const form = useForm<CommunityMemberFormValues>({
    resolver: zodResolver(CommunityMemberSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open || !member) return;
    form.reset({
      displayName: member.displayName,
      headline: member.headline,
      role: member.role,
      status: member.status,
      badgeIds: member.badgeIds,
    });
  }, [open, member, form]);

  const onSubmit = async (values: CommunityMemberFormValues) => {
    if (!member) return;

    try {
      await updateMember({ id: member._id, body: values }).unwrap();
      toast.success("Member updated");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the member");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit member</DialogTitle>
              <DialogDescription>
                How this person appears in the community, what they may do, and the badges pinned
                to their name.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <FormInput control={form.control} name="displayName" label="Shown as" />

              <FormInput
                control={form.control}
                name="headline"
                label="Headline"
                placeholder="Warehouse lead, Chattogram"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="role"
                  label="Role"
                  options={ROLE_OPTIONS}
                />
                <FormSelect
                  control={form.control}
                  name="status"
                  label="Status"
                  options={STATUS_OPTIONS}
                />
              </div>

              <FormMultiSelect
                control={form.control}
                name="badgeIds"
                label="Badges"
                placeholder="None pinned"
                options={badgeChoices}
                emptyText="No badges set up yet. Add them under Community · Settings."
              />
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
              <Button type="submit" className="cursor-pointer" disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
