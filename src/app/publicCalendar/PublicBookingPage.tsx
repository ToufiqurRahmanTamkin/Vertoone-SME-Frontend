import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDateTime } from "@/lib/date";
import {
  useBookPublicSlotMutation,
  useGetPublicBookingQuery,
  useGetPublicBookingSlotsQuery,
} from "@/redux/apis/publicCalendarApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { PublicRegistrationPayload, RegistrationReceipt } from "@/types/domain/publicCalendar";
import * as React from "react";
import { useParams } from "react-router-dom";
import {
  PublicCalendarNotFound,
  PublicCalendarShell,
} from "./components/PublicCalendarShell";
import { PublicReceipt } from "./components/PublicReceipt";
import { PublicRegistrationForm } from "./components/PublicRegistrationForm";
import { SlotPicker } from "./components/SlotPicker";

export default function PublicBookingPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: booking, isLoading, isError } = useGetPublicBookingQuery(slug, { skip: !slug });
  const { data: slots, isFetching: isLoadingSlots } = useGetPublicBookingSlotsQuery(
    { slug },
    { skip: !slug || !booking?.isOpen }
  );
  const [bookSlot, { isLoading: isBooking }] = useBookPublicSlotMutation();

  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [receipt, setReceipt] = React.useState<RegistrationReceipt | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const slotList = React.useMemo(() => slots ?? [], [slots]);
  const chosen = slotList.find((slot) => slot.start === selectedSlot) ?? null;

  const submit = async (payload: PublicRegistrationPayload) => {
    if (!selectedSlot) {
      setErrorMessage("Pick a time first.");
      return;
    }

    try {
      const result = await bookSlot({
        slug,
        body: { ...payload, slotStart: selectedSlot },
      }).unwrap();
      setErrorMessage(null);
      setSelectedSlot(null);
      setReceipt(result);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      setErrorMessage(err?.data?.message || "We could not take that booking. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !booking) {
    return <PublicCalendarNotFound message="This booking page is not available" />;
  }

  if (receipt) {
    return (
      <PublicReceipt
        receipt={receipt}
        accentColor={booking.accentColor}
        onDone={() => setReceipt(null)}
      />
    );
  }

  return (
    <PublicCalendarShell
      page={booking}
      facts={
        <>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Each slot lasts</dt>
            <dd className="text-right font-medium">{booking.durationMinutes} minutes</dd>
          </div>
          {booking.hostName && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">You will meet</dt>
              <dd className="text-right font-medium">{booking.hostName}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Places per slot</dt>
            <dd className="text-right font-medium">{booking.capacityPerSlot}</dd>
          </div>
          {booking.leadTimeHours > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shortest notice</dt>
              <dd className="text-right font-medium">{booking.leadTimeHours} hours</dd>
            </div>
          )}
          {chosen && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Your slot</dt>
              <dd className="text-right font-medium">{formatDateTime(chosen.start)}</dd>
            </div>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold">Pick a time</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Times are shown in your own time zone.
          </p>
          <div className="mt-4">
            <SlotPicker
              slots={slotList}
              isLoading={isLoadingSlots}
              selected={selectedSlot}
              accentColor={booking.accentColor}
              onSelect={setSelectedSlot}
            />
          </div>
        </div>

        <PublicRegistrationForm
          payment={booking.payment}
          accentColor={booking.accentColor}
          submitLabel={booking.payment.isPaid ? "Confirm and book" : "Book this slot"}
          isSubmitting={isBooking}
          errorMessage={errorMessage}
          allowMultipleSeats={booking.capacityPerSlot > 1}
          maxSeats={chosen?.available ?? booking.capacityPerSlot}
          disabled={!selectedSlot}
          disabledHint="Pick a time above to carry on."
          onSubmit={(payload) => void submit(payload)}
        />
      </div>
    </PublicCalendarShell>
  );
}
