import {
  CALENDAR_LOCATION_MODES,
  CALENDAR_MAX_SEATS_PER_REGISTRATION,
  CALENDAR_SLUG_MAX_LENGTH,
  CALENDAR_SLUG_MIN_LENGTH,
  CALENDAR_SLUG_PATTERN,
  CALENDAR_STATUSES,
} from "@/types/domain/calendar";
import {
  BOOKING_MAX_AVAILABILITY_RULES,
  BOOKING_MAX_DURATION_MINUTES,
  BOOKING_MIN_DURATION_MINUTES,
} from "@/types/domain/calendarBooking";
import { EVENT_CATEGORIES } from "@/types/domain/calendarEvent";
import { MEETING_TYPES } from "@/types/domain/calendarMeeting";
import { z } from "zod";
import { hexColorValidation } from "./color";

const TIME_PATTERN = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

const minutesOf = (value: string): number => {
  const [hours, minutes] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
};

export const optionalCalendarSlug = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .toLowerCase()
    .min(CALENDAR_SLUG_MIN_LENGTH, "An address needs at least 3 characters")
    .max(CALENDAR_SLUG_MAX_LENGTH)
    .regex(CALENDAR_SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only"),
]);

export const optionalEmail = z.union([
  z.literal(""),
  z.string().trim().toLowerCase().email("Enter a valid email address"),
]);

export const optionalUrl = z.union([
  z.literal(""),
  z.string().trim().url("Enter a full link starting with https://"),
]);

const PaymentSchema = z
  .object({
    isPaid: z.boolean(),
    price: z
      .number({ error: "Enter a price" })
      .min(0, "A price cannot be negative")
      .max(10_000_000),
    currency: z.string().trim().toUpperCase().length(3, "Use a three-letter currency code"),
    instructions: z.string().trim().max(600),
    qrUrl: z.string().trim(),
    qrPublicId: z.string().trim(),
  })
  .refine((payment) => !payment.isPaid || payment.price > 0, {
    message: "A paid page needs a price above zero",
    path: ["price"],
  })
  .refine((payment) => !payment.isPaid || payment.qrUrl.length > 0, {
    message: "Upload the payment QR code people will scan",
    path: ["qrUrl"],
  });

const PlaceSchema = z.object({
  mode: z.enum(CALENDAR_LOCATION_MODES),
  venue: z.string().trim().max(160),
  address: z.string().trim().max(400),
  onlineUrl: optionalUrl,
});

const presentationFields = {
  coverUrl: z.string().trim(),
  coverPublicId: z.string().trim(),
  accentColor: hexColorValidation,
};

const scheduleFields = {
  startAt: z.string().trim().min(1, "Pick when it starts"),
  endAt: z.string().trim().min(1, "Pick when it ends"),
  registrationClosesAt: z.string().trim(),
  capacity: z
    .number({ error: "Enter a number of places, or 0 for no limit" })
    .int("Use a whole number of places")
    .min(0, "Use 0 for no limit")
    .max(1_000_000),
};

const startsBeforeItEnds = <T extends { startAt: string; endAt: string }>(values: T): boolean =>
  new Date(values.endAt).getTime() > new Date(values.startAt).getTime();

export const CalendarEventSchema = z
  .object({
    title: z.string().trim().min(1, "Your event needs a title").max(140),
    slug: optionalCalendarSlug,
    summary: z.string().trim().max(300),
    description: z.string().trim().max(8000),
    category: z.enum(EVENT_CATEGORIES),
    organiserName: z.string().trim().max(120),
    contactEmail: optionalEmail,
    contactPhone: z.string().trim().max(30),
    place: PlaceSchema,
    payment: PaymentSchema,
    status: z.enum(CALENDAR_STATUSES),
    isRegistrationOpen: z.boolean(),
    ...scheduleFields,
    ...presentationFields,
  })
  .refine(startsBeforeItEnds, {
    message: "The end must come after the start",
    path: ["endAt"],
  });

export type CalendarEventFormValues = z.infer<typeof CalendarEventSchema>;

export const CalendarMeetingSchema = z
  .object({
    title: z.string().trim().min(1, "Your meeting needs a title").max(140),
    slug: optionalCalendarSlug,
    summary: z.string().trim().max(300),
    agenda: z.string().trim().max(8000),
    meetingType: z.enum(MEETING_TYPES),
    hostName: z.string().trim().max(120),
    meetingRoomId: z.string().trim(),
    contactEmail: optionalEmail,
    contactPhone: z.string().trim().max(30),
    place: PlaceSchema,
    payment: PaymentSchema,
    status: z.enum(CALENDAR_STATUSES),
    isRegistrationOpen: z.boolean(),
    ...scheduleFields,
    ...presentationFields,
  })
  .refine(startsBeforeItEnds, {
    message: "The end must come after the start",
    path: ["endAt"],
  });

export type CalendarMeetingFormValues = z.infer<typeof CalendarMeetingSchema>;

export const AvailabilityRuleSchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    startTime: z.string().trim().regex(TIME_PATTERN, "Use a 24 hour time like 09:30"),
    endTime: z.string().trim().regex(TIME_PATTERN, "Use a 24 hour time like 17:00"),
  })
  .refine((rule) => minutesOf(rule.endTime) > minutesOf(rule.startTime), {
    message: "The closing time must be after the opening time",
    path: ["endTime"],
  });

export type AvailabilityRuleValues = z.infer<typeof AvailabilityRuleSchema>;

export const CalendarBookingSchema = z
  .object({
    title: z.string().trim().min(1, "Your booking page needs a title").max(140),
    slug: optionalCalendarSlug,
    summary: z.string().trim().max(300),
    description: z.string().trim().max(8000),
    hostName: z.string().trim().max(120),
    contactEmail: optionalEmail,
    contactPhone: z.string().trim().max(30),
    place: PlaceSchema,
    payment: PaymentSchema,
    status: z.enum(CALENDAR_STATUSES),
    isRegistrationOpen: z.boolean(),
    durationMinutes: z
      .number({ error: "Enter how long a slot lasts" })
      .int("Use a whole number of minutes")
      .min(BOOKING_MIN_DURATION_MINUTES, "A slot lasts at least five minutes")
      .max(BOOKING_MAX_DURATION_MINUTES),
    bufferMinutes: z
      .number({ error: "Enter a gap in minutes, or 0 for none" })
      .int()
      .min(0, "Use 0 for no gap")
      .max(480),
    capacityPerSlot: z
      .number({ error: "Enter how many places a slot holds" })
      .int()
      .min(1, "At least one place per slot")
      .max(500),
    capacity: z
      .number({ error: "Enter a total, or 0 for no limit" })
      .int()
      .min(0, "Use 0 for no limit")
      .max(1_000_000),
    leadTimeHours: z
      .number({ error: "Enter a notice period in hours, or 0 for none" })
      .int()
      .min(0, "Use 0 for no notice period")
      .max(720),
    windowDays: z
      .number({ error: "Enter how many days ahead people can book" })
      .int()
      .min(1, "Open at least one day ahead")
      .max(365),
    timezoneOffsetMinutes: z
      .number({ error: "Enter an offset in minutes" })
      .int()
      .min(-840)
      .max(840),
    availability: z.array(AvailabilityRuleSchema).max(BOOKING_MAX_AVAILABILITY_RULES),
    ...presentationFields,
  })
  .refine((values) => values.status !== "PUBLISHED" || values.availability.length > 0, {
    message: "Add at least one weekly opening before going live",
    path: ["availability"],
  });

export type CalendarBookingFormValues = z.infer<typeof CalendarBookingSchema>;

const registrantFields = {
  name: z.string().trim().min(1, "Please tell us your name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().min(4, "Enter a phone number we can reach you on").max(30),
  note: z.string().trim().max(600),
  seats: z
    .number({ error: "Enter how many places you need" })
    .int()
    .min(1, "At least one place")
    .max(CALENDAR_MAX_SEATS_PER_REGISTRATION, "That is more places than we can hold for you"),
};

export const PublicRegistrationSchema = z.object({
  ...registrantFields,
  transactionId: z.string().trim().max(120),
});

export const PaidPublicRegistrationSchema = z.object({
  ...registrantFields,
  transactionId: z
    .string()
    .trim()
    .min(3, "Enter the transaction ID from your payment")
    .max(120),
});

export type PublicRegistrationFormValues = z.infer<typeof PublicRegistrationSchema>;
