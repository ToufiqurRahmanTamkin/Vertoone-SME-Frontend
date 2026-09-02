import { RegistrationsPage } from "@/app/calendar/components/RegistrationsPage";
import { useGetCalendarBookingQuery } from "@/redux/apis/calendarBookingApis";
import { useParams } from "react-router-dom";

export default function BookingRequestsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: booking, isLoading, isError } = useGetCalendarBookingQuery(id, { skip: !id });

  return (
    <RegistrationsPage
      resourceType="BOOKING"
      resourceId={id}
      modulePath="/company/calendar/bookings"
      heading={booking ? `${booking.title} · Requests` : "Booking requests"}
      description={
        booking?.payment.isPaid
          ? "Every slot people booked. Check each transaction ID against your wallet before you hold the slot."
          : "Every slot people booked through the public page."
      }
      backTo="/company/calendar/bookings"
      backLabel="All booking pages"
      emptyMessage="This booking page is not available"
      showSlot
      isLoadingResource={isLoading}
      isResourceMissing={Boolean(isError || (!isLoading && !booking))}
    />
  );
}
