import { FormColor, FormInput, FormSwitch } from "@/components/shared/form-fields";
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
  useCreateMeetingRoomMutation,
  useUpdateMeetingRoomMutation,
} from "@/redux/apis/meetingRoomApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { CreateMeetingRoomPayload, MeetingRoom } from "@/types/domain/meetingRoom";
import { MeetingRoomSchema, type MeetingRoomFormValues } from "@/validations/meetingRoom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface MeetingRoomFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: MeetingRoom | null;
}

const DEFAULT_COLOR = "#0ea5e9";

const emptyValues = (): MeetingRoomFormValues => ({
  name: "",
  code: "",
  floor: "",
  color: DEFAULT_COLOR,
  capacity: 8,
  isActive: true,
});

const toFormValues = (room: MeetingRoom): MeetingRoomFormValues => ({
  name: room.name,
  code: room.code,
  floor: room.floor ?? "",
  color: room.color,
  capacity: room.capacity,
  isActive: room.isActive,
});

const toPayload = (values: MeetingRoomFormValues): CreateMeetingRoomPayload => ({
  name: values.name,
  code: values.code.toUpperCase(),
  floor: values.floor,
  color: values.color,
  capacity: values.capacity,
  isActive: values.isActive,
});

export function MeetingRoomFormModal({ open, onOpenChange, room }: MeetingRoomFormModalProps) {
  const isEdit = Boolean(room);

  const [createMeetingRoom, { isLoading: isCreating }] = useCreateMeetingRoomMutation();
  const [updateMeetingRoom, { isLoading: isUpdating }] = useUpdateMeetingRoomMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<MeetingRoomFormValues>({
    resolver: zodResolver(MeetingRoomSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(room ? toFormValues(room) : emptyValues());
  }, [open, room, form]);

  const onSubmit = async (values: MeetingRoomFormValues) => {
    try {
      if (room) {
        await updateMeetingRoom({ id: room._id, body: toPayload(values) }).unwrap();
        toast.success("Meeting room updated");
      } else {
        await createMeetingRoom(toPayload(values)).unwrap();
        toast.success("Meeting room created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the meeting room");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit meeting room" : "New meeting room"}</DialogTitle>
          <DialogDescription>
            Rooms people can book for meetings. The colour is what the room looks like on the
            calendar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="Boardroom"
                />
                <FormInput
                  control={form.control}
                  name="code"
                  label="Code"
                  placeholder="MR-01"
                  description="A short code, unique in your company."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="floor"
                  label="Floor"
                  placeholder="3rd floor"
                />
                <FormInput
                  control={form.control}
                  name="capacity"
                  label="Capacity"
                  type="number"
                  min={1}
                  placeholder="8"
                  description="How many people the room seats."
                />
              </div>

              <FormColor control={form.control} name="color" label="Colour" />

              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Inactive rooms stay on existing bookings but cannot be booked again."
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create meeting room"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
