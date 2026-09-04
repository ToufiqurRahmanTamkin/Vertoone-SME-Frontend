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
import { Stepper, type StepperStep } from "@/components/ui/stepper";
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
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { toast } from "sonner";

interface MeetingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting?: CalendarMeeting | null;
  defaultStartAt?: string | null;
}

const STEPS: readonly StepperStep[] = [
  { id: "details", label: "Details" },
  { id: "schedule", label: "When & where" },
  { id: "payment", label: "Payment" },
  { id: "look", label: "Look" },
];

const STEP_FIELDS: readonly FieldPath<CalendarMeetingFormValues>[][] = [
  ["title", "meetingType", "slug", "summary", "agenda", "hostName", "contactEmail", "contactPhone"],
  [
    "startAt",
    "endAt",
    "registrationClosesAt",
    "capacity",
    "meetingRoomId",
    "place",
    "isRegistrationOpen",
    "status",
  ],
  ["payment"],
  ["coverUrl", "coverPublicId", "accentColor"],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.includes(field as FieldPath<CalendarMeetingFormValues>)
  );
  return index === -1 ? 0 : index;
};

const TYPE_OPTIONS = toOptions(MEETING_TYPE_LABELS);

const STATUS_OPTIONS = toOptions(CALENDAR_STATUS_LABELS);

const nextWeek = (hourOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(date.getHours() + hourOffset, 0, 0, 0);
  return date.toISOString();
};

const seededStart = (startAt: string): string => {
  const date = new Date(startAt);
  if (isNaN(date.getTime())) return nextWeek(0);
  if (date.getHours() === 0 && date.getMinutes() === 0) date.setHours(10, 0, 0, 0);
  return date.toISOString();
};

const plusHours = (startAt: string, hours: number): string => {
  const date = new Date(startAt);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

const emptyValues = (defaultStartAt?: string | null): CalendarMeetingFormValues => ({
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
  startAt: defaultStartAt ? seededStart(defaultStartAt) : nextWeek(0),
  endAt: defaultStartAt ? plusHours(seededStart(defaultStartAt), 1) : nextWeek(1),
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

export function MeetingFormModal({
  open,
  onOpenChange,
  meeting,
  defaultStartAt = null,
}: MeetingFormModalProps) {
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
    form.reset(meeting ? toFormValues(meeting) : emptyValues(defaultStartAt));
  }, [open, meeting, defaultStartAt, form]);

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);
  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (meeting?._id ?? "new") : null;

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setStep(0);
    setFurthestStep(seedKey !== null && meeting ? LAST_STEP : 0);
  }

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const isValid = fields.length === 0 || (await form.trigger(fields, { shouldFocus: true }));
    if (!isValid) return;
    const next = Math.min(step + 1, LAST_STEP);
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

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

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstStep = Object.keys(errors)
      .map(stepOf)
      .sort((a, b) => a - b)[0];
    if (firstStep !== undefined) setStep(firstStep);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < LAST_STEP) {
      void goNext();
      return;
    }
    void form.handleSubmit(onSubmit, onInvalid)(event);
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
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleFormSubmit}>
            <DialogBody className="flex flex-col gap-4">
              <Stepper
                steps={STEPS}
                current={step}
                reachable={furthestStep}
                onStepSelect={setStep}
              />

              {step === 0 && (
                <div className="flex flex-col gap-4">
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
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-4">
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
                </div>
              )}

              {step === 2 && <CalendarPaymentSection label="meeting" />}

              {step === 3 && <CalendarPresentationSection />}
            </DialogBody>

            <DialogFooter className="sm:justify-between">
              <span className="hidden text-xs text-muted-foreground sm:block">
                Step {step + 1} of {STEPS.length}
              </span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
                  disabled={isSaving}
                >
                  {step === 0 ? (
                    "Cancel"
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </>
                  )}
                </Button>
                {step < LAST_STEP ? (
                  <Button key="wizard-next" type="button" onClick={() => void goNext()}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button key="wizard-submit" type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? "Save changes" : "Create meeting"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
