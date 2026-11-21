// Purpose: fixed `today` and small StoreState builders shared by the Vitest suites.
import {
   BUSINESS_NAME,
   DEFAULT_BUFFER,
   DEFAULT_LANGUAGE,
   DEFAULT_TONE,
   OPENING_BALANCE,
   SCHEMA_VERSION,
   UPI_ID,
} from '../../src/lib/constants';
import { monthKeyOf, monthStart } from '../../src/lib/dates';
import type {
   Bill,
   Invoice,
   Payment,
   Reminder,
   StoreState,
} from '../../src/lib/types';

/** Why: tests never read the real clock; every suite uses this fixed day. */
export const TODAY = '2025-03-15';

/** Why: an invoice whose month and raised-on date follow from its due date. */
export function invoice(
   id: string,
   familyId: string,
   dueDate: string,
   amount = 1500,
): Invoice {
   return {
      id,
      studentId: `s-${familyId}`,
      familyId,
      month: monthKeyOf(dueDate),
      amount,
      raisedOn: monthStart(dueDate),
      dueDate,
   };
}

/** Why: a single UPI or cash payment against one invoice. */
export function payment(
   id: string,
   invoiceId: string,
   familyId: string,
   amount: number,
   date: string,
   method: Payment['method'] = 'upi',
): Payment {
   return { id, invoiceId, familyId, amount, method, date };
}

/** Why: a logged chase message for one invoice. */
export function reminder(id: string, invoiceId: string, sentOn: string): Reminder {
   return {
      id,
      invoiceId,
      sentOn,
      tone: DEFAULT_TONE,
      language: DEFAULT_LANGUAGE,
      channel: 'whatsapp',
   };
}

/** Why: a recurring bill with an explicit due day. */
export function bill(
   id: string,
   name: string,
   amount: number,
   dayOfMonth: number,
): Bill {
   return { id, name, amount, dayOfMonth, active: true };
}

/** Why: an empty store with the seed's business settings, overridable per test. */
export function makeState(parts: Partial<StoreState> = {}): StoreState {
   return {
      version: SCHEMA_VERSION,
      business: {
         name: BUSINESS_NAME,
         openingBalance: OPENING_BALANCE,
         buffer: DEFAULT_BUFFER,
         upiId: UPI_ID,
      },
      families: [],
      students: [],
      invoices: [],
      payments: [],
      reminders: [],
      bills: [],
      settings: { defaultTone: DEFAULT_TONE, defaultLanguage: DEFAULT_LANGUAGE },
      ...parts,
   };
}
