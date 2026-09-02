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
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
}

const CATEGORY_OPTIONS = toOptions(EVENT_CATEGORY_LABELS);

const STATUS_OPTIONS = toOptions(CALENDAR_STATUS_LABELS);

const inTwoWeeks = (hourOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  date.setHours(date.getHours() + hourOffset, 0, 0, 0);
  return date.toISOString();
};

const emptyValues = (): CalendarEventFormValues => ({
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
  startAt: inTwoWeeks(0),
  endAt: inTwoWeeks(2),
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

export function EventFormModal({ open, onOpenChange, event }: EventFormModalProps) {
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
    form.reset(event ? toFormValues(event) : emptyValues());
  }, [open, event, form]);

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
                </TabsContent>

                <TabsContent value="schedule" className="mt-4 flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormDate
                      control={form.control}
                      name="startAt"
                      label="Starts"
                      includeTime
                    />
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
                </TabsContent>

                <TabsContent value="payment" className="mt-4">
                  <CalendarPaymentSection label="event" />
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
                {isEdit ? "Save changes" : "Create event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
