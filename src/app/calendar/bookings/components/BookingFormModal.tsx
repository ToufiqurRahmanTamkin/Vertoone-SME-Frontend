import { CalendarPaymentSection } from "@/app/calendar/components/CalendarPaymentSection";
import { CalendarPlaceSection } from "@/app/calendar/components/CalendarPlaceSection";
import { CalendarPresentationSection } from "@/app/calendar/components/CalendarPresentationSection";
import { FormInput, FormSelect, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
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
import { CALENDAR_STATUS_LABELS, toOptions } from "@/constant";
import {
  useCreateCalendarBookingMutation,
  useUpdateCalendarBookingMutation,
} from "@/redux/apis/calendarBookingApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { DEFAULT_CALENDAR_COLOR, DEFAULT_CALENDAR_CURRENCY } from "@/types/domain/calendar";
import type {
  CalendarBooking,
  CreateCalendarBookingPayload,
} from "@/types/domain/calendarBooking";
import { CalendarBookingSchema, type CalendarBookingFormValues } from "@/validations/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import { AvailabilityEditor } from "./AvailabilityEditor";

interface BookingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: CalendarBooking | null;
  defaultWeekday?: number | null;
}

const STEPS: readonly StepperStep[] = [
  { id: "details", label: "Details" },
  { id: "availability", label: "Availability" },
  { id: "payment", label: "Payment" },
  { id: "look", label: "Look" },
];

const STEP_FIELDS: readonly FieldPath<CalendarBookingFormValues>[][] = [
  [
    "title",
    "hostName",
    "slug",
    "summary",
    "description",
    "contactEmail",
    "contactPhone",
    "place",
    "isRegistrationOpen",
    "status",
  ],
  [
    "durationMinutes",
    "bufferMinutes",
    "capacityPerSlot",
    "capacity",
    "leadTimeHours",
    "windowDays",
    "timezoneOffsetMinutes",
    "availability",
  ],
  ["payment"],
  ["coverUrl", "coverPublicId", "accentColor"],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.includes(field as FieldPath<CalendarBookingFormValues>)
  );
  return index === -1 ? 0 : index;
};

const STATUS_OPTIONS = toOptions(CALENDAR_STATUS_LABELS);

const localOffsetMinutes = (): number => -new Date().getTimezoneOffset();

const WEEKDAY_HOURS = { startTime: "09:00", endTime: "17:00" } as const;

const defaultAvailability = (weekday?: number | null) =>
  weekday === null || weekday === undefined
    ? [1, 2, 3, 4, 5].map((day) => ({ weekday: day, ...WEEKDAY_HOURS }))
    : [{ weekday, ...WEEKDAY_HOURS }];

const emptyValues = (defaultWeekday?: number | null): CalendarBookingFormValues => ({
  title: "",
  slug: "",
  summary: "",
  description: "",
  hostName: "",
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
  durationMinutes: 30,
  bufferMinutes: 0,
  capacityPerSlot: 1,
  capacity: 0,
  leadTimeHours: 2,
  windowDays: 30,
  timezoneOffsetMinutes: localOffsetMinutes(),
  availability: defaultAvailability(defaultWeekday),
  coverUrl: "",
  coverPublicId: "",
  accentColor: DEFAULT_CALENDAR_COLOR,
});

const toFormValues = (booking: CalendarBooking): CalendarBookingFormValues => ({
  title: booking.title,
  slug: booking.slug,
  summary: booking.summary ?? "",
  description: booking.description ?? "",
  hostName: booking.hostName ?? "",
  contactEmail: booking.contactEmail ?? "",
  contactPhone: booking.contactPhone ?? "",
  place: {
    mode: booking.place.mode,
    venue: booking.place.venue ?? "",
    address: booking.place.address ?? "",
    onlineUrl: booking.place.onlineUrl ?? "",
  },
  payment: {
    isPaid: booking.payment.isPaid,
    price: booking.payment.price,
    currency: booking.payment.currency || DEFAULT_CALENDAR_CURRENCY,
    instructions: booking.payment.instructions ?? "",
    qrUrl: booking.payment.qrUrl ?? "",
    qrPublicId: booking.payment.qrPublicId ?? "",
  },
  status: booking.status,
  isRegistrationOpen: booking.isRegistrationOpen,
  durationMinutes: booking.durationMinutes,
  bufferMinutes: booking.bufferMinutes,
  capacityPerSlot: booking.capacityPerSlot,
  capacity: booking.capacity ?? 0,
  leadTimeHours: booking.leadTimeHours,
  windowDays: booking.windowDays,
  timezoneOffsetMinutes: booking.timezoneOffsetMinutes,
  availability: booking.availability.map((rule) => ({ ...rule })),
  coverUrl: booking.coverUrl ?? "",
  coverPublicId: booking.coverPublicId ?? "",
  accentColor: booking.accentColor || DEFAULT_CALENDAR_COLOR,
});

const toPayload = (values: CalendarBookingFormValues): CreateCalendarBookingPayload => ({
  title: values.title,
  slug: values.slug || undefined,
  summary: values.summary,
  description: values.description,
  hostName: values.hostName,
  contactEmail: values.contactEmail,
  contactPhone: values.contactPhone,
  place: values.place,
  payment: { ...values.payment },
  status: values.status,
  isRegistrationOpen: values.isRegistrationOpen,
  durationMinutes: values.durationMinutes,
  bufferMinutes: values.bufferMinutes,
  capacityPerSlot: values.capacityPerSlot,
  capacity: values.capacity > 0 ? values.capacity : null,
  leadTimeHours: values.leadTimeHours,
  windowDays: values.windowDays,
  timezoneOffsetMinutes: values.timezoneOffsetMinutes,
  availability: values.availability,
  coverUrl: values.coverUrl,
  coverPublicId: values.coverPublicId,
  accentColor: values.accentColor,
});

export function BookingFormModal({
  open,
  onOpenChange,
  booking,
  defaultWeekday = null,
}: BookingFormModalProps) {
  const isEdit = Boolean(booking);

  const [createBooking, { isLoading: isCreating }] = useCreateCalendarBookingMutation();
  const [updateBooking, { isLoading: isUpdating }] = useUpdateCalendarBookingMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<CalendarBookingFormValues>({
    resolver: zodResolver(CalendarBookingSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(booking ? toFormValues(booking) : emptyValues(defaultWeekday));
  }, [open, booking, defaultWeekday, form]);

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);
  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (booking?._id ?? "new") : null;

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setStep(0);
    setFurthestStep(seedKey !== null && booking ? LAST_STEP : 0);
  }

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const isValid = fields.length === 0 || (await form.trigger(fields, { shouldFocus: true }));
    if (!isValid) return;
    const next = Math.min(step + 1, LAST_STEP);
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const onSubmit = async (values: CalendarBookingFormValues) => {
    try {
      if (booking) {
        await updateBooking({ id: booking._id, body: toPayload(values) }).unwrap();
        toast.success("Booking page updated");
      } else {
        await createBooking(toPayload(values)).unwrap();
        toast.success("Booking page created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the booking page");
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
          <DialogTitle>{isEdit ? "Edit booking page" : "New booking page"}</DialogTitle>
          <DialogDescription>
            A booking page offers your open hours as slots anyone can book. Charge for a slot by
            turning on payment and uploading the QR code people scan.
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
                    placeholder="30 minute consultation"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="hostName"
                      label="Who people meet"
                      placeholder="Sales team"
                    />
                    <FormInput
                      control={form.control}
                      name="slug"
                      label="Public address"
                      placeholder="consultation"
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
                    name="description"
                    label="Description"
                    placeholder="What the session covers and how people should prepare"
                    className="[&_textarea]:min-h-32"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="contactEmail"
                      label="Contact email"
                      placeholder="hello@example.com"
                    />
                    <FormInput
                      control={form.control}
                      name="contactPhone"
                      label="Contact phone"
                      placeholder="+8801XXXXXXXXX"
                    />
                  </div>

                  <CalendarPlaceSection />

                  <FormSwitch
                    control={form.control}
                    name="isRegistrationOpen"
                    label="Taking bookings"
                    description="Turn this off to keep the page live but stop new bookings."
                  />

                  <FormSelect
                    control={form.control}
                    name="status"
                    label="Status"
                    options={STATUS_OPTIONS}
                    description="Only a live page is reachable on its public link."
                  />
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="durationMinutes"
                      label="Slot length (minutes)"
                      type="number"
                      min={5}
                    />
                    <FormInput
                      control={form.control}
                      name="bufferMinutes"
                      label="Gap between slots (minutes)"
                      type="number"
                      min={0}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="capacityPerSlot"
                      label="Places per slot"
                      type="number"
                      min={1}
                      description="More than one turns each slot into a group session."
                    />
                    <FormInput
                      control={form.control}
                      name="capacity"
                      label="Total places"
                      type="number"
                      min={0}
                      description="Use 0 for no overall limit."
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="leadTimeHours"
                      label="Shortest notice (hours)"
                      type="number"
                      min={0}
                      description="Slots sooner than this are hidden."
                    />
                    <FormInput
                      control={form.control}
                      name="windowDays"
                      label="Bookable days ahead"
                      type="number"
                      min={1}
                    />
                  </div>

                  <FormInput
                    control={form.control}
                    name="timezoneOffsetMinutes"
                    label="Time zone offset (minutes from UTC)"
                    type="number"
                    min={-840}
                    description="Your openings are read in this offset. 360 is UTC+6."
                  />

                  <AvailabilityEditor />
                </div>
              )}

              {step === 2 && <CalendarPaymentSection label="booking page" />}

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
                    {isEdit ? "Save changes" : "Create booking page"}
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
