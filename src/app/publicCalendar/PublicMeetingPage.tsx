import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MEETING_TYPE_LABELS } from "@/constant";
import { formatDateTime } from "@/lib/date";
import {
  useGetPublicMeetingQuery,
  useRegisterForPublicMeetingMutation,
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

export default function PublicMeetingPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: meeting, isLoading, isError } = useGetPublicMeetingQuery(slug, { skip: !slug });
  const [register, { isLoading: isRegistering }] = useRegisterForPublicMeetingMutation();

  const [receipt, setReceipt] = React.useState<RegistrationReceipt | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const submit = async (payload: PublicRegistrationPayload) => {
    try {
      const result = await register({ slug, body: payload }).unwrap();
      setErrorMessage(null);
      setReceipt(result);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      setErrorMessage(err?.data?.message || "We could not register you. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !meeting) {
    return <PublicCalendarNotFound message="This meeting is not available" />;
  }

  if (receipt) {
    return (
      <PublicReceipt
        receipt={receipt}
        accentColor={meeting.accentColor}
        onDone={() => setReceipt(null)}
      />
    );
  }

  return (
    <PublicCalendarShell
      page={meeting}
      facts={
        <>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Starts</dt>
            <dd className="text-right font-medium">{formatDateTime(meeting.startAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Ends</dt>
            <dd className="text-right font-medium">{formatDateTime(meeting.endAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Type</dt>
            <dd className="text-right font-medium">
              {MEETING_TYPE_LABELS[meeting.meetingType]}
            </dd>
          </div>
          {meeting.hostName && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Host</dt>
              <dd className="text-right font-medium">{meeting.hostName}</dd>
            </div>
          )}
          {meeting.roomName && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Room</dt>
              <dd className="text-right font-medium">{meeting.roomName}</dd>
            </div>
          )}
          {meeting.registrationClosesAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Registration closes</dt>
              <dd className="text-right font-medium">
                {formatDateTime(meeting.registrationClosesAt)}
              </dd>
            </div>
          )}
          {meeting.seatsLeft !== null && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Seats left</dt>
              <dd className="text-right font-medium">{meeting.seatsLeft}</dd>
            </div>
          )}
        </>
      }
    >
      <PublicRegistrationForm
        payment={meeting.payment}
        accentColor={meeting.accentColor}
        submitLabel={meeting.payment.isPaid ? "Confirm and register" : "Register"}
        isSubmitting={isRegistering}
        errorMessage={errorMessage}
        maxSeats={meeting.seatsLeft ?? undefined}
        onSubmit={(payload) => void submit(payload)}
      />
    </PublicCalendarShell>
  );
}
