// Purpose: deterministic regex parser for quick-add lines such as "Rohan paid 1500 upi" (PRD §6).
// Pure: returns an intent or null; never throws; the caller shows a confirm chip.
import {
   QUICK_ADD_BILL_PATTERN,
   QUICK_ADD_DAY_OFFSETS,
   QUICK_ADD_MAX_LENGTH,
   QUICK_ADD_PAYMENT_PATTERN,
} from '../constants';
import type { PaymentMethod } from '../types';

/** A payment typed as one line; dayOffset is 0 (today) or -1 (yesterday). */
export interface PaymentIntent {
   kind: 'payment';
   name: string;
   amount: number;
   method: PaymentMethod | null;
   dayOffset: number;
}

/** A recurring bill marked paid, e.g. "rent paid". */
export interface BillPaidIntent {
   kind: 'bill_paid';
   billName: string;
   dayOffset: number;
}

export type QuickAddIntent = PaymentIntent | BillPaidIntent;

/** Why: collapses spacing so the patterns see one canonical form. */
function normalise(text: string): string {
   return text.trim().replace(/\s+/g, ' ');
}

/** Why: day words map to offsets here so the caller does the date maths. */
function dayOffsetOf(word: string | undefined): number {
   if (word === undefined) return QUICK_ADD_DAY_OFFSETS.today;
   const key = word.toLowerCase() as keyof typeof QUICK_ADD_DAY_OFFSETS;
   return QUICK_ADD_DAY_OFFSETS[key];
}

/** Why: the method is optional on the line; the confirm chip asks when absent. */
function methodOf(word: string | undefined): PaymentMethod | null {
   return word === undefined ? null : (word.toLowerCase() as PaymentMethod);
}

/**
 * Why: free text from a tutor must never crash the Today screen, so anything
 * the patterns do not recognise (or a zero amount) returns null instead.
 */
export function parseQuickAdd(text: string): QuickAddIntent | null {
   if (typeof text !== 'string') return null;
   const line = normalise(text);
   if (line.length === 0 || line.length > QUICK_ADD_MAX_LENGTH) return null;

   const payment = QUICK_ADD_PAYMENT_PATTERN.exec(line);
   if (payment !== null) {
      const amount = Number(payment[2]);
      if (!Number.isInteger(amount) || amount <= 0) return null;
      return {
         kind: 'payment',
         name: payment[1].trim(),
         amount,
         method: methodOf(payment[3]),
         dayOffset: dayOffsetOf(payment[4]),
      };
   }

   const bill = QUICK_ADD_BILL_PATTERN.exec(line);
   if (bill !== null) {
      return {
         kind: 'bill_paid',
         billName: bill[1].toLowerCase(),
         dayOffset: dayOffsetOf(bill[2]),
      };
   }
   return null;
}
