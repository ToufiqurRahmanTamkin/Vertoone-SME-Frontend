import { CalendarPaymentSection } from "@/app/calendar/components/CalendarPaymentSection";
import { CalendarPlaceSection } from "@/app/calendar/components/CalendarPlaceSection";
import { CalendarPresentationSection } from "@/app/calendar/components/CalendarPresentationSection";
import {
  FormDate,
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CALENDAR_STATUS_LABELS, MEETING_TYPE_LABELS, toOptions } from "@/constant";
import {
  useCreateCalendarMeetingMutation,
  useUpdateCalendarMeetingMutation,
} from "@/redux/apis/calendarMeetingApis";
import { useGetMeetingRoomOptionsQuery } from "@/redux/apis/meetingRoomApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { DEFAULT_CALENDAR_COLOR, DEFAULT_CALENDAR_CURRENCY } from "@/types/domain/calendar";
import type {
  CalendarMeeting,
  CreateCalendarMeetingPayload,
} from "@/types/domain/calendarMeeting";
import { CalendarMeetingSchema, type CalendarMeetingFormValues } from "@/validations/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface MeetingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting?: CalendarMeeting | null;
}

const TYPE_OPTIONS = toOptions(MEETING_TYPE_LABELS);

const STATUS_OPTIONS = toOptions(CALENDAR_STATUS_LABELS);

const nextWeek = (hourOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(date.getHours() + hourOffset, 0, 0, 0);
  return date.toISOString();
};

const emptyValues = (): CalendarMeetingFormValues => ({
  title: "",
  slug: "",
  summary: "",
  agenda: "",
  meetingType: "OTHER",
  hostName: "",
  meetingRoomId: "",
  contactEmail: "",
  contactPhone: "",
  place: { mode: "IN_PERSON", venue: "", address: "", onlineUrl: "" },
  payment: {
    isPaid: false,
    price: 0,
    currency: DEFAULT_CALENDAR_CURRENCY,
    instructions:
      "Scan the QR code with your mobile wallet, then enter the transaction ID below.",
    qrUrl: "",
    qrPublicId: "",
  },
  status: "DRAFT",
  isRegistrationOpen: true,
  startAt: nextWeek(0),
  endAt: nextWeek(1),
  registrationClosesAt: "",
  capacity: 0,
  coverUrl: "",
  coverPublicId: "",
  accentColor: DEFAULT_CALENDAR_COLOR,
});

const toFormValues = (meeting: CalendarMeeting): CalendarMeetingFormValues => ({
  title: meeting.title,
  slug: meeting.slug,
  summary: meeting.summary ?? "",
  agenda: meeting.agenda ?? "",
  meetingType: meeting.meetingType,
  hostName: meeting.hostName ?? "",
  meetingRoomId: meeting.meetingRoomId ?? "",
  contactEmail: meeting.contactEmail ?? "",
  contactPhone: meeting.contactPhone ?? "",
  place: {
    mode: meeting.place.mode,
    venue: meeting.place.venue ?? "",
    address: meeting.place.address ?? "",
    onlineUrl: meeting.place.onlineUrl ?? "",
  },
  payment: {
    isPaid: meeting.payment.isPaid,
    price: meeting.payment.price,
    currency: meeting.payment.currency || DEFAULT_CALENDAR_CURRENCY,
    instructions: meeting.payment.instructions ?? "",
    qrUrl: meeting.payment.qrUrl ?? "",
    qrPublicId: meeting.payment.qrPublicId ?? "",
  },
  status: meeting.status,
  isRegistrationOpen: meeting.isRegistrationOpen,
  startAt: meeting.startAt,
  endAt: meeting.endAt,
  registrationClosesAt: meeting.registrationClosesAt ?? "",
  capacity: meeting.capacity ?? 0,
  coverUrl: meeting.coverUrl ?? "",
  coverPublicId: meeting.coverPublicId ?? "",
  accentColor: meeting.accentColor || DEFAULT_CALENDAR_COLOR,
});

const toPayload = (values: CalendarMeetingFormValues): CreateCalendarMeetingPayload => ({
  title: values.title,
  slug: values.slug || undefined,
  summary: values.summary,
  agenda: values.agenda,
  meetingType: values.meetingType,
  hostName: values.hostName,
  meetingRoomId: values.meetingRoomId || null,
  contactEmail: values.contactEmail,
  contactPhone: values.contactPhone,
  place: values.place,
  payment: { ...values.payment },
  status: values.status,
  isRegistrationOpen: values.isRegistrationOpen,
  startAt: values.startAt,
  endAt: values.endAt,
  registrationClosesAt: values.registrationClosesAt || null,
  capacity: values.capacity > 0 ? values.capacity : null,
  coverUrl: values.coverUrl,
  coverPublicId: values.coverPublicId,
  accentColor: values.accentColor,
});

export function MeetingFormModal({ open, onOpenChange, meeting }: MeetingFormModalProps) {
  const isEdit = Boolean(meeting);

  const [createMeeting, { isLoading: isCreating }] = useCreateCalendarMeetingMutation();
  const [updateMeeting, { isLoading: isUpdating }] = useUpdateCalendarMeetingMutation();
  const { data: rooms } = useGetMeetingRoomOptionsQuery(undefined, { skip: !open });
  const isSaving = isCreating || isUpdating;

  const roomOptions = React.useMemo(
    () => [
      { label: "No room", value: "" },
      ...(rooms ?? []).map((room) => ({
        label: `${room.name} · seats ${room.capacity}`,
        value: room._id,
      })),
    ],
    [rooms]
  );

  const form = useForm<CalendarMeetingFormValues>({
    resolver: zodResolver(CalendarMeetingSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(meeting ? toFormValues(meeting) : emptyValues());
  }, [open, meeting, form]);

  const onSubmit = async (values: CalendarMeetingFormValues) => {
    try {
      if (meeting) {
        await updateMeeting({ id: meeting._id, body: toPayload(values) }).unwrap();
        toast.success("Meeting updated");
      } else {
        await createMeeting(toPayload(values)).unwrap();
        toast.success("Meeting created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the meeting");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit meeting" : "New meeting"}</DialogTitle>
          <DialogDescription>
            Meetings get a public page people can register on. Charge for a seat by turning on
            payment and uploading the QR code attendees scan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody>
              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="schedule">When & where</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                  <TabsTrigger value="look">Look</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4 flex flex-col gap-4">
                  <FormInput
                    control={form.control}
                    name="title"
                    label="Title"
                    placeholder="Quarterly product review"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      control={form.control}
                      name="meetingType"
                      label="Type"
                      options={TYPE_OPTIONS}
                    />
                    <FormInput
                      control={form.control}
                      name="slug"
                      label="Public address"
                      placeholder="quarterly-product-review"
                      description="Leave blank and we will build one from the title."
                    />
                  </div>

                  <FormTextarea
                    control={form.control}
                    name="summary"
                    label="Short summary"
                    placeholder="One line people see before they open the page"
                    showCharCount={false}
                  />

                  <FormTextarea
                    control={form.control}
                    name="agenda"
                    label="Agenda"
                    placeholder="What you will cover, in the order you will cover it"
                    className="[&_textarea]:min-h-40"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="hostName"
                      label="Host"
                      placeholder="Who runs the meeting"
                    />
                    <FormInput
                      control={form.control}
                      name="contactPhone"
                      label="Contact phone"
                      placeholder="+8801XXXXXXXXX"
                    />
                  </div>

                  <FormInput
                    control={form.control}
                    name="contactEmail"
                    label="Contact email"
                    placeholder="meetings@example.com"
                  />
                </TabsContent>

                <TabsContent value="schedule" className="mt-4 flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormDate control={form.control} name="startAt" label="Starts" includeTime />
                    <FormDate control={form.control} name="endAt" label="Ends" includeTime />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormDate
                      control={form.control}
                      name="registrationClosesAt"
                      label="Registration closes"
                      includeTime
                      description="Optional. Leave blank to keep it open until the meeting starts."
                    />
                    <FormInput
                      control={form.control}
                      name="capacity"
                      label="Seats available"
                      type="number"
                      min={0}
                      description="Use 0 for no limit."
                    />
                  </div>

                  <FormSelect
                    control={form.control}
                    name="meetingRoomId"
                    label="Meeting room"
                    options={roomOptions}
                    description="Rooms come from your calendar settings."
                  />

                  <CalendarPlaceSection />

                  <FormSwitch
                    control={form.control}
                    name="isRegistrationOpen"
                    label="Taking registrations"
                    description="Turn this off to keep the page live but stop new sign-ups."
                  />

                  <FormSelect
                    control={form.control}
                    name="status"
                    label="Status"
                    options={STATUS_OPTIONS}
                    description="Only a live meeting is reachable on its public link."
                  />
                </TabsContent>

                <TabsContent value="payment" className="mt-4">
                  <CalendarPaymentSection label="meeting" />
                </TabsContent>

                <TabsContent value="look" className="mt-4">
                  <CalendarPresentationSection />
                </TabsContent>
              </Tabs>
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
                {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create meeting"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
