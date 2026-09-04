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
import { CALENDAR_STATUS_LABELS, EVENT_CATEGORY_LABELS, toOptions } from "@/constant";
import {
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
} from "@/redux/apis/calendarEventApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { DEFAULT_CALENDAR_COLOR, DEFAULT_CALENDAR_CURRENCY } from "@/types/domain/calendar";
import type {
  CalendarEvent,
  CreateCalendarEventPayload,
} from "@/types/domain/calendarEvent";
import { CalendarEventSchema, type CalendarEventFormValues } from "@/validations/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { toast } from "sonner";

interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  defaultStartAt?: string | null;
}

const STEPS: readonly StepperStep[] = [
  { id: "details", label: "Details" },
  { id: "schedule", label: "When & where" },
  { id: "payment", label: "Payment" },
  { id: "look", label: "Look" },
];

const STEP_FIELDS: readonly FieldPath<CalendarEventFormValues>[][] = [
  [
    "title",
    "category",
    "slug",
    "summary",
    "description",
    "organiserName",
    "contactEmail",
    "contactPhone",
  ],
  [
    "startAt",
    "endAt",
    "registrationClosesAt",
    "capacity",
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
    fields.includes(field as FieldPath<CalendarEventFormValues>)
  );
  return index === -1 ? 0 : index;
};

const CATEGORY_OPTIONS = toOptions(EVENT_CATEGORY_LABELS);

const STATUS_OPTIONS = toOptions(CALENDAR_STATUS_LABELS);

const inTwoWeeks = (hourOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  date.setHours(date.getHours() + hourOffset, 0, 0, 0);
  return date.toISOString();
};

const seededStart = (startAt: string): string => {
  const date = new Date(startAt);
  if (isNaN(date.getTime())) return inTwoWeeks(0);
  if (date.getHours() === 0 && date.getMinutes() === 0) date.setHours(9, 0, 0, 0);
  return date.toISOString();
};

const plusHours = (startAt: string, hours: number): string => {
  const date = new Date(startAt);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

const emptyValues = (defaultStartAt?: string | null): CalendarEventFormValues => ({
  title: "",
  slug: "",
  summary: "",
  description: "",
  category: "OTHER",
  organiserName: "",
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
  startAt: defaultStartAt ? seededStart(defaultStartAt) : inTwoWeeks(0),
  endAt: defaultStartAt ? plusHours(seededStart(defaultStartAt), 2) : inTwoWeeks(2),
  registrationClosesAt: "",
  capacity: 0,
  coverUrl: "",
  coverPublicId: "",
  accentColor: DEFAULT_CALENDAR_COLOR,
});

const toFormValues = (event: CalendarEvent): CalendarEventFormValues => ({
  title: event.title,
  slug: event.slug,
  summary: event.summary ?? "",
  description: event.description ?? "",
  category: event.category,
  organiserName: event.organiserName ?? "",
  contactEmail: event.contactEmail ?? "",
  contactPhone: event.contactPhone ?? "",
  place: {
    mode: event.place.mode,
    venue: event.place.venue ?? "",
    address: event.place.address ?? "",
    onlineUrl: event.place.onlineUrl ?? "",
  },
  payment: {
    isPaid: event.payment.isPaid,
    price: event.payment.price,
    currency: event.payment.currency || DEFAULT_CALENDAR_CURRENCY,
    instructions: event.payment.instructions ?? "",
    qrUrl: event.payment.qrUrl ?? "",
    qrPublicId: event.payment.qrPublicId ?? "",
  },
  status: event.status,
  isRegistrationOpen: event.isRegistrationOpen,
  startAt: event.startAt,
  endAt: event.endAt,
  registrationClosesAt: event.registrationClosesAt ?? "",
  capacity: event.capacity ?? 0,
  coverUrl: event.coverUrl ?? "",
  coverPublicId: event.coverPublicId ?? "",
  accentColor: event.accentColor || DEFAULT_CALENDAR_COLOR,
});

const toPayload = (values: CalendarEventFormValues): CreateCalendarEventPayload => ({
  title: values.title,
  slug: values.slug || undefined,
  summary: values.summary,
  description: values.description,
  category: values.category,
  organiserName: values.organiserName,
  contactEmail: values.contactEmail,
  contactPhone: values.contactPhone,
  place: values.place,
  payment: {
    isPaid: values.payment.isPaid,
    price: values.payment.price,
    currency: values.payment.currency,
    instructions: values.payment.instructions,
    qrUrl: values.payment.qrUrl,
    qrPublicId: values.payment.qrPublicId,
  },
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

export function EventFormModal({
  open,
  onOpenChange,
  event,
  defaultStartAt = null,
}: EventFormModalProps) {
  const isEdit = Boolean(event);

  const [createEvent, { isLoading: isCreating }] = useCreateCalendarEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateCalendarEventMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<CalendarEventFormValues>({
    resolver: zodResolver(CalendarEventSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(event ? toFormValues(event) : emptyValues(defaultStartAt));
  }, [open, event, defaultStartAt, form]);

  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);
  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (event?._id ?? "new") : null;

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setStep(0);
    setFurthestStep(seedKey !== null && event ? LAST_STEP : 0);
  }

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const isValid = fields.length === 0 || (await form.trigger(fields, { shouldFocus: true }));
    if (!isValid) return;
    const next = Math.min(step + 1, LAST_STEP);
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const onSubmit = async (values: CalendarEventFormValues) => {
    try {
      if (event) {
        await updateEvent({ id: event._id, body: toPayload(values) }).unwrap();
        toast.success("Event updated");
      } else {
        await createEvent(toPayload(values)).unwrap();
        toast.success("Event created");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the event");
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstStep = Object.keys(errors)
      .map(stepOf)
      .sort((a, b) => a - b)[0];
    if (firstStep !== undefined) setStep(firstStep);
  };

  const handleFormSubmit = (event_: React.FormEvent<HTMLFormElement>) => {
    event_.preventDefault();
    if (step < LAST_STEP) {
      void goNext();
      return;
    }
    void form.handleSubmit(onSubmit, onInvalid)(event_);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit event" : "New event"}</DialogTitle>
          <DialogDescription>
            Events get their own public page where anyone can register. Charge for a place by
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
                    placeholder="Annual customer summit"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      control={form.control}
                      name="category"
                      label="Category"
                      options={CATEGORY_OPTIONS}
                    />
                    <FormInput
                      control={form.control}
                      name="slug"
                      label="Public address"
                      placeholder="annual-customer-summit"
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
                    placeholder="What happens, who it is for and what people should bring"
                    className="[&_textarea]:min-h-40"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={form.control}
                      name="organiserName"
                      label="Organiser"
                      placeholder="Events team"
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
                    placeholder="events@example.com"
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
                      description="Optional. Leave blank to keep it open until the event starts."
                    />
                    <FormInput
                      control={form.control}
                      name="capacity"
                      label="Places available"
                      type="number"
                      min={0}
                      description="Use 0 for no limit."
                    />
                  </div>

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
                    description="Only a live event is reachable on its public link."
                  />
                </div>
              )}

              {step === 2 && <CalendarPaymentSection label="event" />}

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
                    {isEdit ? "Save changes" : "Create event"}
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
