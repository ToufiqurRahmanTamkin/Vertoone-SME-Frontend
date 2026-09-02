import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EVENT_CATEGORY_LABELS } from "@/constant";
import { formatDateTime } from "@/lib/date";
import {
  useGetPublicEventQuery,
  useRegisterForPublicEventMutation,
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

export default function PublicEventPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: event, isLoading, isError } = useGetPublicEventQuery(slug, { skip: !slug });
  const [register, { isLoading: isRegistering }] = useRegisterForPublicEventMutation();

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

  if (isError || !event) {
    return <PublicCalendarNotFound message="This event is not available" />;
  }

  if (receipt) {
    return (
      <PublicReceipt
        receipt={receipt}
        accentColor={event.accentColor}
        onDone={() => setReceipt(null)}
      />
    );
  }

  return (
    <PublicCalendarShell
      page={event}
      facts={
        <>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Starts</dt>
            <dd className="text-right font-medium">{formatDateTime(event.startAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Ends</dt>
            <dd className="text-right font-medium">{formatDateTime(event.endAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Category</dt>
            <dd className="text-right font-medium">{EVENT_CATEGORY_LABELS[event.category]}</dd>
          </div>
          {event.organiserName && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Organiser</dt>
              <dd className="text-right font-medium">{event.organiserName}</dd>
            </div>
          )}
          {event.registrationClosesAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Registration closes</dt>
              <dd className="text-right font-medium">
                {formatDateTime(event.registrationClosesAt)}
              </dd>
            </div>
          )}
          {event.seatsLeft !== null && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Places left</dt>
              <dd className="text-right font-medium">{event.seatsLeft}</dd>
            </div>
          )}
        </>
      }
    >
      <PublicRegistrationForm
        payment={event.payment}
        accentColor={event.accentColor}
        submitLabel={event.payment.isPaid ? "Confirm and register" : "Register"}
        isSubmitting={isRegistering}
        errorMessage={errorMessage}
        maxSeats={event.seatsLeft ?? undefined}
        onSubmit={(payload) => void submit(payload)}
      />
    </PublicCalendarShell>
  );
}
