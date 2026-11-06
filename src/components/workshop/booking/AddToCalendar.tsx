import { bookingIcs, icsHref, type CalendarEvent } from "@/lib/booking/calendar";

/** Downloads an .ics file that Google, Apple and Outlook calendars can open. */
export function AddToCalendar({ event, className }: { event: CalendarEvent; className?: string }) {
  return (
    <a href={icsHref(bookingIcs(event))} download={`bokning-${event.reference}.ics`} className={className}>
      Lägg till i kalendern
    </a>
  );
}
