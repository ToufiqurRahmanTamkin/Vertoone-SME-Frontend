import { FormTextarea } from "@/components/shared/form-fields";
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
import { useRequestToJoinCommunityGroupMutation } from "@/redux/apis/communityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { CommunityGroup } from "@/types/domain/community";
import {
  CommunityJoinRequestSchema,
  type CommunityJoinRequestFormValues,
} from "@/validations/community";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface RequestToJoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: CommunityGroup | null;
}

export function RequestToJoinModal({ open, onOpenChange, group }: RequestToJoinModalProps) {
  const [requestToJoin, { isLoading }] = useRequestToJoinCommunityGroupMutation();

  const form = useForm<CommunityJoinRequestFormValues>({
    resolver: zodResolver(CommunityJoinRequestSchema),
    defaultValues: { message: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ message: "" });
  }, [open, form]);

  const onSubmit = async (values: CommunityJoinRequestFormValues) => {
    if (!group) return;

    try {
      await requestToJoin({ groupId: group._id, message: values.message }).unwrap();
      toast.success(`Your request to join ${group.name} is with the moderators`);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not send your request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Ask to join {group?.name ?? "this group"}</DialogTitle>
              <DialogDescription>
                A moderator answers this. You will get a notification either way.
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <FormTextarea
                control={form.control}
                name="message"
                label="Why you want in"
                placeholder="Optional — a line about what you would bring to the group"
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
