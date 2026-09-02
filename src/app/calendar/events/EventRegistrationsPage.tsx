import { RegistrationsPage } from "@/app/calendar/components/RegistrationsPage";
import { useGetCalendarEventQuery } from "@/redux/apis/calendarEventApis";
import { useParams } from "react-router-dom";

export default function EventRegistrationsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: event, isLoading, isError } = useGetCalendarEventQuery(id, { skip: !id });

  return (
    <RegistrationsPage
      resourceType="EVENT"
      resourceId={id}
      modulePath="/calendar/events"
      heading={event ? `${event.title} · Registrations` : "Registrations"}
      description={
        event?.payment.isPaid
          ? "Everyone who signed up. Check each transaction ID against your wallet before you confirm the place."
          : "Everyone who signed up through the public page."
      }
      backTo="/calendar/events"
      backLabel="All events"
      emptyMessage="This event is not available"
      isLoadingResource={isLoading}
      isResourceMissing={Boolean(isError || (!isLoading && !event))}
    />
  );
}
