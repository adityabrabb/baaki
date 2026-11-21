// Purpose: ageing of overdue fees into 0-7 / 8-30 / 30+ day buckets, plus the total owed (PRD §5 /owed).
// Pure: callers pass `today`; nothing here reads the clock or storage.
import { AGEING_BUCKETS } from '../constants';
import { diffDays, isBeforeDate } from '../dates';
import type { StoreState } from '../types';
import { outstandingOf } from './chasePriority';

export type AgeingBucketId = (typeof AGEING_BUCKETS)[number]['id'];

/** One ageing bucket: how many overdue invoices and how much they still owe. */
export interface AgeingBucket {
   id: AgeingBucketId;
   label: string;
   count: number;
   total: number;
}

/**
 * Why: an invoice falls in the first bucket whose upper day limit covers its
 * days late, so 7 days late is still 0-7 and 8 days late is 8-30.
 */
export function bucketIdFor(daysLate: number): AgeingBucketId {
   const found = AGEING_BUCKETS.find((bucket) => daysLate <= bucket.maxDays);
   return (found ?? AGEING_BUCKETS[AGEING_BUCKETS.length - 1]).id;
}

/**
 * Why: the header shows what the tutor is owed across every open invoice,
 * overdue or not, so it always agrees with the balances on the invoices.
 */
export function totalOwed(state: StoreState): number {
   return state.invoices.reduce(
      (sum, invoice) => sum + outstandingOf(invoice, state.payments),
      0,
   );
}

/**
 * Why: only invoices past their due date are ageing; each bucket keeps its
 * count and total so the board can show both without re-summing.
 */
export function ageingBuckets(state: StoreState, today: string): AgeingBucket[] {
   const buckets = AGEING_BUCKETS.map((bucket) => ({
      id: bucket.id,
      label: bucket.label,
      count: 0,
      total: 0,
   }));
   for (const invoice of state.invoices) {
      if (!isBeforeDate(invoice.dueDate, today)) continue;
      const owed = outstandingOf(invoice, state.payments);
      if (owed === 0) continue;
      const id = bucketIdFor(diffDays(today, invoice.dueDate));
      const bucket = buckets.find((item) => item.id === id);
      if (bucket) {
         bucket.count += 1;
         bucket.total += owed;
      }
   }
   return buckets;
}
