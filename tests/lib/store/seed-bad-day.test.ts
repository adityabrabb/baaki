// Purpose: checks the seeded bad day: expected cash on the next rent dips under the buffer and recovers when the top overdue families pay.
import { describe, expect, it } from 'vitest';
import {
   DEFAULT_BUFFER,
   OVERDUE_MAX,
   OVERDUE_MIN,
   RENT_BILL_ID,
} from '../../../src/lib/constants';
import { isAfterDate } from '../../../src/lib/dates';
import { alerts } from '../../../src/lib/domain/alerts';
import { forecast } from '../../../src/lib/domain/forecast';
import { buildSeedState } from '../../../src/lib/store/seed';
import { nextRentDate } from '../../../src/lib/store/seed-opening';
import type { Invoice, Payment, StoreState } from '../../../src/lib/types';

const BAD_DAY_DATES = [
   '2026-11-22',
   '2026-11-30',
   '2026-12-03',
   '2027-01-15',
] as const;
const TOP_PAYER_COUNT = 3;
const PAYMENT_METHOD = 'upi' as const;
const PAYMENT_ID_PREFIX = 'pay-bad-day-';

/** Why: partial payments count, so an invoice owes its amount minus what was paid. */
function outstandingOf(invoice: Invoice, payments: Payment[]): number {
   const paid = payments
      .filter((payment) => payment.invoiceId === invoice.id)
      .reduce((sum, payment) => sum + payment.amount, 0);
   return Math.max(0, invoice.amount - paid);
}

/** Why: the overdue set is every open invoice whose due date is before today. */
function overdueOf(state: StoreState, today: string): Invoice[] {
   return state.invoices.filter(
      (invoice) =>
         outstandingOf(invoice, state.payments) > 0 &&
         isAfterDate(today, invoice.dueDate),
   );
}

/** Why: the bad-day fix assumes the largest overdue families pay first; ties go by id. */
function topOverdueOf(state: StoreState, today: string): Invoice[] {
   const owed = (invoice: Invoice): number =>
      outstandingOf(invoice, state.payments);
   return overdueOf(state, today)
      .sort((a, b) => owed(b) - owed(a) || a.id.localeCompare(b.id))
      .slice(0, TOP_PAYER_COUNT);
}

/** Why: each top payer settles their full outstanding amount today by UPI. */
function paymentsFor(state: StoreState, today: string): Payment[] {
   return topOverdueOf(state, today).map((invoice) => ({
      id: `${PAYMENT_ID_PREFIX}${invoice.id}`,
      invoiceId: invoice.id,
      familyId: invoice.familyId,
      amount: outstandingOf(invoice, state.payments),
      method: PAYMENT_METHOD,
      date: today,
   }));
}

describe.each(BAD_DAY_DATES)('seeded bad day on %s', (today) => {
   // Why: the demo needs overdue families, a dip on rent day and a recovery path.
   it('has between OVERDUE_MIN and OVERDUE_MAX overdue invoices', () => {
      const state = buildSeedState(today);
      const count = overdueOf(state, today).length;
      expect(count).toBeGreaterThanOrEqual(OVERDUE_MIN);
      expect(count).toBeLessThanOrEqual(OVERDUE_MAX);
   });

   // Why: expected cash on the next rent date must sit under the buffer.
   it('forecasts expected cash under the buffer on the next rent date', () => {
      const state = buildSeedState(today);
      const rent = nextRentDate(today);
      const entry = forecast(state, today).days.find(
         (day) => day.date === rent,
      );
      expect(entry).toBeDefined();
      expect(entry?.expected).toBeLessThan(DEFAULT_BUFFER);
   });

   // Why: the first alert is the rent, so Today points at the bad day.
   it('raises the rent alert first, on the next rent date', () => {
      const state = buildSeedState(today);
      const rent = nextRentDate(today);
      const first = alerts(state, today)[0];
      expect(first).toBeDefined();
      expect(first?.billId).toBe(RENT_BILL_ID);
      expect(first?.date).toBe(rent);
   });

   // Why: the top overdue families paying clears the rent-day alert and restores the buffer.
   it('recovers above the buffer when the top overdue families pay', () => {
      const state = buildSeedState(today);
      const rent = nextRentDate(today);
      const paidState: StoreState = {
         ...state,
         payments: [...state.payments, ...paymentsFor(state, today)],
      };
      const entry = forecast(paidState, today).days.find(
         (day) => day.date === rent,
      );
      expect(entry?.expected).toBeGreaterThanOrEqual(DEFAULT_BUFFER);
      const rentAlert = alerts(paidState, today).some(
         (alert) => alert.billId === RENT_BILL_ID && alert.date === rent,
      );
      expect(rentAlert).toBe(false);
   });
});
