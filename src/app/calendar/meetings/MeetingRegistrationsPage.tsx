import { RegistrationsPage } from "@/app/calendar/components/RegistrationsPage";
import { useGetCalendarMeetingQuery } from "@/redux/apis/calendarMeetingApis";
import { useParams } from "react-router-dom";

export default function MeetingRegistrationsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: meeting, isLoading, isError } = useGetCalendarMeetingQuery(id, { skip: !id });

  return (
    <RegistrationsPage
      resourceType="MEETING"
      resourceId={id}
      modulePath="/calendar/meetings"
      heading={meeting ? `${meeting.title} · Attendees` : "Attendees"}
      description={
        meeting?.payment.isPaid
          ? "Everyone who registered. Check each transaction ID against your wallet before you hold the seat."
          : "Everyone who registered through the public page."
      }
      backTo="/calendar/meetings"
      backLabel="All meetings"
      emptyMessage="This meeting is not available"
      isLoadingResource={isLoading}
      isResourceMissing={Boolean(isError || (!isLoading && !meeting))}
    />
  );
}
