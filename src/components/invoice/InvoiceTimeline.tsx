// Purpose: vertical timeline of one invoice: raised, each reminder, each payment, and paid in full.
import { INVOICE_COPY } from '../../lib/constants';
import type { TimelineEvent } from '../../lib/domain/invoiceTimeline';
import { EmptyNote } from '../khata/EmptyNote';

/** Why: the events arrive already ordered; this only lays them out on the ruled margin. */
export function InvoiceTimeline({ events }: { events: TimelineEvent[] }) {
   if (events.length === 0) {
      return <EmptyNote text={INVOICE_COPY.timelineEmpty} />;
   }
   return (
      <ol className="flex flex-col gap-4 border-l-2 border-margin-red pl-4">
         {events.map((event, index) => (
            <li key={`${event.kind}-${event.date}-${index}`} className="flex flex-col gap-0.5">
               <span className="font-body text-sm font-semibold text-ink-soft">
                  {event.date}
               </span>
               <span className="font-hand text-xl text-ink">{event.label}</span>
               <span className="font-body text-base text-ink">{event.detail}</span>
            </li>
         ))}
      </ol>
   );
}
