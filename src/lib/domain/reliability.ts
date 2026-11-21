// Purpose: per-family payment reliability over the recent window (PRD §6).
// Pure: callers pass `today`; nothing here reads the clock or storage.
import {
   NO_HISTORY_BADGE,
   ON_TIME_MAX_DELAY_DAYS,
   PERCENT_SCALE,
   RELIABILITY_LABELS,
   RELIABILITY_WINDOW_MONTHS,
   RELIABLE_MAX_AVG_DELAY,
   USUALLY_LATE_MAX_AVG_DELAY,
} from '../constants';
import { addMonths, diffDays, isAfterDate, isBeforeDate } from '../dates';
import type { Invoice, Payment, RiskBadge, StoreState } from '../types';

/** A family's track record: score is on-time % (null with no history). */
export interface Reliability {
   familyId: string;
   sampleSize: number;
   score: number | null;
   avgDelayDays: number;
   badge: RiskBadge;
   label: string;
}

/** Why: the badge follows average lateness, so one slip does not brand a family. */
export function badgeForDelay(avgDelayDays: number): RiskBadge {
   if (avgDelayDays <= RELIABLE_MAX_AVG_DELAY) return 'reliable';
   if (avgDelayDays <= USUALLY_LATE_MAX_AVG_DELAY) return 'usually_late';
   return 'risky';
}

/** Why: an invoice is history only once payments up to `today` cover it. */
function settledOn(
   invoice: Invoice,
   payments: Payment[],
   today: string,
): string | null {
   const mine = payments.filter(
      (payment) =>
         payment.invoiceId === invoice.id && !isAfterDate(payment.date, today),
   );
   const paid = mine.reduce((sum, payment) => sum + payment.amount, 0);
   if (mine.length === 0 || paid < invoice.amount) return null;
   return mine.reduce(
      (latest, payment) =>
         isAfterDate(payment.date, latest) ? payment.date : latest,
      mine[0].date,
   );
}

/**
 * Why: lateness is judged on invoices raised in the window and fully settled,
 * so an unpaid invoice is not counted as a delay until it is paid.
 */
export function reliability(
   state: StoreState,
   familyId: string,
   today: string,
): Reliability {
   const windowStart = addMonths(today, -RELIABILITY_WINDOW_MONTHS);
   const delays: number[] = [];
   for (const invoice of state.invoices) {
      if (invoice.familyId !== familyId) continue;
      if (isBeforeDate(invoice.raisedOn, windowStart)) continue;
      if (isAfterDate(invoice.raisedOn, today)) continue;
      const settled = settledOn(invoice, state.payments, today);
      if (settled !== null) delays.push(diffDays(settled, invoice.dueDate));
   }

   if (delays.length === 0) {
      return {
         familyId,
         sampleSize: 0,
         score: null,
         avgDelayDays: 0,
         badge: NO_HISTORY_BADGE,
         label: RELIABILITY_LABELS[NO_HISTORY_BADGE],
      };
   }

   const onTime = delays.filter((d) => d <= ON_TIME_MAX_DELAY_DAYS).length;
   const total = delays.reduce((sum, d) => sum + d, 0);
   const avgDelayDays = Math.max(0, Math.round(total / delays.length));
   const badge = badgeForDelay(avgDelayDays);
   return {
      familyId,
      sampleSize: delays.length,
      score: Math.round((onTime / delays.length) * PERCENT_SCALE),
      avgDelayDays,
      badge,
      label: RELIABILITY_LABELS[badge],
   };
}
