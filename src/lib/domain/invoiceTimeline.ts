// Purpose: orders one invoice's raised, reminder, payment and paid-in-full events for its timeline (PRD §5).
// Pure: no clock or storage; dates are validated 'YYYY-MM-DD' strings, so text order is date order.
import {
   PAYMENT_METHOD_LABELS,
   REMINDER_CHANNEL_LABELS,
   REMINDER_TONE_LABELS,
   TIMELINE_KINDS,
   TIMELINE_KIND_LABELS,
} from '../constants';
import type { Invoice, StoreState } from '../types';
import { outstandingOf } from './chasePriority';
import { formatINR } from './formatINR';

export type TimelineKind = (typeof TIMELINE_KINDS)[number];

/** One line on the invoice timeline; `detail` is already human text. */
export interface TimelineEvent {
   kind: TimelineKind;
   date: string;
   label: string;
   detail: string;
}

/** Why: ties on the same day keep the natural story order (raised, reminder, payment, paid). */
function kindRank(kind: TimelineKind): number {
   return TIMELINE_KINDS.indexOf(kind);
}

/** Why: the paid-in-full line is dated on the latest payment, the day the balance hit zero. */
function paidEvent(invoice: Invoice, state: StoreState): TimelineEvent[] {
   const mine = state.payments.filter((p) => p.invoiceId === invoice.id);
   if (mine.length === 0 || outstandingOf(invoice, state.payments) > 0) return [];
   const latest = mine.reduce((a, b) => (b.date > a.date ? b : a));
   return [
      {
         kind: 'paid',
         date: latest.date,
         label: TIMELINE_KIND_LABELS.paid,
         detail: formatINR(invoice.amount),
      },
   ];
}

/** Why: every fact about one invoice in date order, so the timeline reads like the khata. */
export function invoiceTimeline(
   state: StoreState,
   invoice: Invoice,
): TimelineEvent[] {
   const raised: TimelineEvent = {
      kind: 'raised',
      date: invoice.raisedOn,
      label: TIMELINE_KIND_LABELS.raised,
      detail: `Due ${invoice.dueDate}`,
   };
   const reminders: TimelineEvent[] = state.reminders
      .filter((r) => r.invoiceId === invoice.id)
      .map((r) => ({
         kind: 'reminder' as const,
         date: r.sentOn,
         label: TIMELINE_KIND_LABELS.reminder,
         detail: `${REMINDER_TONE_LABELS[r.tone]} · ${REMINDER_CHANNEL_LABELS[r.channel]}`,
      }));
   const payments: TimelineEvent[] = state.payments
      .filter((p) => p.invoiceId === invoice.id)
      .map((p) => ({
         kind: 'payment' as const,
         date: p.date,
         label: TIMELINE_KIND_LABELS.payment,
         detail: `${formatINR(p.amount)} by ${PAYMENT_METHOD_LABELS[p.method]}`,
      }));
   return [raised, ...reminders, ...payments, ...paidEvent(invoice, state)].sort(
      (a, b) =>
         a.date === b.date
            ? kindRank(a.kind) - kindRank(b.kind)
            : a.date < b.date
              ? -1
              : 1,
   );
}
