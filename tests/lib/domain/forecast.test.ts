// Purpose: checks the 90-day forecast: horizon, scenario ordering, outstanding money and bills.
import { describe, expect, it } from 'vitest';
import { FORECAST_ASSUMPTIONS, FORECAST_HORIZON_DAYS, OPENING_BALANCE } from '../../../src/lib/constants';
import { forecast } from '../../../src/lib/domain/forecast';
import { buildSeedState } from '../../../src/lib/store/seed';
import { TODAY, bill, invoice, makeState, payment } from '../../fixtures/state';

describe('forecast', () => {
   it('returns one row per horizon day starting today', () => {
      const result = forecast(makeState(), TODAY);
      expect(result.days).toHaveLength(FORECAST_HORIZON_DAYS);
      expect(result.days[0].date).toBe(TODAY);
      expect(result.days[FORECAST_HORIZON_DAYS - 1].date).toBe('2025-06-12');
   });

   it('keeps optimistic >= expected >= pessimistic on every day (seed)', () => {
      const { days } = forecast(buildSeedState(TODAY), TODAY);
      for (const day of days) {
         expect(day.optimistic).toBeGreaterThanOrEqual(day.expected);
         expect(day.expected).toBeGreaterThanOrEqual(day.pessimistic);
      }
   });

   it('keeps the balance flat with no invoices and no bills', () => {
      const { days, bills } = forecast(makeState(), TODAY);
      expect(bills).toEqual([]);
      expect(days.every((day) => day.expected === OPENING_BALANCE)).toBe(true);
   });

   it('counts only the outstanding part of a partly paid invoice', () => {
      const state = makeState({
         invoices: [invoice('p1', 'fp', '2025-03-20', 1500)],
         payments: [payment('pp1', 'p1', 'fp', 500, '2025-03-10')],
      });
      const { days } = forecast(state, TODAY);
      // The 500 already received is cash on hand from day one.
      // Due 20 March is offset 5; the remaining 1000 lands then, not 1500.
      expect(days[4].optimistic).toBe(OPENING_BALANCE + 500);
      expect(days[5].optimistic).toBe(OPENING_BALANCE + 1500);
      expect(days[89].expected).toBe(OPENING_BALANCE + 1500);
      // Pessimistic slips 15 days: 4 April is offset 20.
      expect(days[19].pessimistic).toBe(OPENING_BALANCE + 500);
      expect(days[20].pessimistic).toBe(OPENING_BALANCE + 1500);
   });

   it('raises expected by a recorded payment on an overdue invoice', () => {
      const overdue = invoice('o1', 'fp', '2025-03-01', 1500);
      const unpaid = forecast(makeState({ invoices: [overdue] }), TODAY);
      const paid = forecast(
         makeState({
            invoices: [overdue],
            payments: [payment('po1', 'o1', 'fp', 1500, '2025-03-10')],
         }),
         TODAY,
      );
      // Overdue fees add nothing until paid, so the payment is pure cash.
      unpaid.days.forEach((day, i) => {
         expect(paid.days[i].expected - day.expected).toBe(1500);
      });
   });

   it('counts a partial payment on an overdue invoice; the rest adds 0', () => {
      const overdue = invoice('o1', 'fp', '2025-03-01', 1500);
      const unpaid = forecast(makeState({ invoices: [overdue] }), TODAY);
      const partly = forecast(
         makeState({
            invoices: [overdue],
            payments: [payment('po1', 'o1', 'fp', 500, '2025-03-10')],
         }),
         TODAY,
      );
      unpaid.days.forEach((day, i) => {
         expect(partly.days[i].expected - day.expected).toBe(500);
      });
      expect(partly.days[89].expected).toBe(OPENING_BALANCE + 500);
   });

   it('keeps optimistic >= expected >= pessimistic on every day (mixed)', () => {
      const state = makeState({
         invoices: [
            invoice('o1', 'fp', '2025-03-01', 1500),
            invoice('n1', 'fq', '2025-03-25', 1500),
            invoice('n2', 'fr', '2025-04-05', 2000),
         ],
         payments: [payment('po1', 'o1', 'fp', 500, '2025-03-10')],
         bills: [bill('bill-rent', 'Rent', 12000, 1)],
      });
      const { days } = forecast(state, TODAY);
      for (const day of days) {
         expect(day.optimistic).toBeGreaterThanOrEqual(day.expected);
         expect(day.expected).toBeGreaterThanOrEqual(day.pessimistic);
      }
   });

   it('takes bills out on their day of the month within the horizon', () => {
      const state = makeState({
         bills: [bill('bill-printing', 'Printing', 1500, 20)],
      });
      const { days, bills } = forecast(state, TODAY);
      expect(bills.map((b) => b.date)).toEqual([
         '2025-03-20',
         '2025-04-20',
         '2025-05-20',
      ]);
      expect(days[5].expected).toBe(OPENING_BALANCE - 1500);
   });

   it('always returns the assumptions the UI must show', () => {
      const { assumptions } = forecast(makeState(), TODAY);
      expect(assumptions.length).toBeGreaterThan(0);
      expect(assumptions).toEqual([...FORECAST_ASSUMPTIONS]);
   });
});
