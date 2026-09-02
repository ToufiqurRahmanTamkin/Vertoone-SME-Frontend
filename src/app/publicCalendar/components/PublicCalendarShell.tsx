import { Badge } from "@/components/ui/badge";
import { formatAmount } from "@/lib/amount";
import type { PublicCalendarBase } from "@/types/domain/publicCalendar";
import { CALENDAR_LOCATION_MODE_LABELS } from "@/constant";
import { CalendarX2, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";

interface PublicCalendarShellProps {
  page: PublicCalendarBase;
  facts: ReactNode;
  children: ReactNode;
}

export function PublicCalendarShell({ page, facts, children }: PublicCalendarShellProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div
        className="h-2 w-full"
        style={{ backgroundColor: page.accentColor }}
        aria-hidden="true"
      />

      {page.coverUrl && (
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <img
            src={page.coverUrl}
            alt=""
            className="aspect-[16/6] w-full rounded-xl border object-cover"
          />
        </div>
      )}

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:py-10">
        <header className="space-y-3">
          {page.companyName && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {page.companyName}
            </p>
          )}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{page.title}</h1>
          {page.summary && <p className="text-sm text-muted-foreground">{page.summary}</p>}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[11px]">
              {CALENDAR_LOCATION_MODE_LABELS[page.locationMode]}
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              {page.payment.isPaid
                ? formatAmount(page.payment.price, page.payment.currency)
                : "Free"}
            </Badge>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="space-y-6">
            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-sm font-semibold">The details</h2>
              <dl className="mt-3 space-y-3 text-sm">{facts}</dl>

              {page.place.venue && (
                <p className="mt-3 inline-flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {page.place.venue}
                    {page.place.address ? `, ${page.place.address}` : ""}
                  </span>
                </p>
              )}
            </section>

            {page.description && (
              <section className="rounded-xl border bg-card p-5">
                <h2 className="text-sm font-semibold">About</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {page.description}
                </p>
              </section>
            )}

            {(page.contactEmail || page.contactPhone) && (
              <section className="rounded-xl border bg-card p-5">
                <h2 className="text-sm font-semibold">Questions?</h2>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {page.contactEmail && (
                    <p className="inline-flex items-center gap-2">
                      <Mail className="size-4" />
                      <a className="hover:underline" href={`mailto:${page.contactEmail}`}>
                        {page.contactEmail}
                      </a>
                    </p>
                  )}
                  {page.contactPhone && (
                    <p className="inline-flex items-center gap-2">
                      <Phone className="size-4" />
                      <a className="hover:underline" href={`tel:${page.contactPhone}`}>
                        {page.contactPhone}
                      </a>
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="lg:sticky lg:top-6">
            {page.isOpen ? (
              children
            ) : (
              <div className="rounded-xl border bg-card p-6 text-center">
                <CalendarX2 className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium">Not taking sign-ups</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {page.closedReason || "This is closed for now."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicCalendarNotFound({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
      <CalendarX2 className="size-10 text-muted-foreground/50" />
      <h1 className="text-lg font-semibold">{message}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The link may be wrong, or whoever set it up has taken it offline.
      </p>
    </div>
  );
}
