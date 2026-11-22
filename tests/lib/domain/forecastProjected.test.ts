// Purpose: checks projected future-month fees in the forecast: timing per scenario, Risky exclusion, no double count and month-end/leap-day dates.
import { describe, expect, it } from 'vitest';
import { OPENING_BALANCE } from '../../../src/lib/constants';
import { forecast } from '../../../src/lib/domain/forecast';
import { TODAY, invoice, makeState, payment } from '../../fixtures/state';

const FEE = 2000;
const END_INDEX = 89;

const student = {
   id: 's-fa',
   name: 'Aarav',
   familyId: 'fa',
   batch: 'Batch A',
   classLevel: 9,
   feeAmount: FEE,
   active: true,
};

describe('forecast projected fees', () => {
   it('projects each future month on the fee day, optimistic and expected (normal)', () => {
      const { days } = forecast(makeState({ students: [student] }), TODAY);
      // No history: delay 0. Fees land 5 Apr, 5 May and 5 Jun (offsets 21, 51, 82).
      expect(days[20].expected).toBe(OPENING_BALANCE);
      expect(days[21].expected).toBe(OPENING_BALANCE + FEE);
      expect(days[82].optimistic).toBe(OPENING_BALANCE + 3 * FEE);
      expect(days[END_INDEX].expected).toBe(OPENING_BALANCE + 3 * FEE);
   });

   it('optimistic lands on the due day while expected waits for the family delay', () => {
      // History: paid 10 days late, so the average delay is 10 (usually late).
      const { days } = forecast(
         makeState({
            students: [student],
            invoices: [invoice('h1', 'fa', '2025-02-05', FEE)],
            payments: [payment('ph1', 'h1', 'fa', FEE, '2025-02-15')],
         }),
         TODAY,
      );
      const base = OPENING_BALANCE + FEE;
      // Optimistic 5 Apr (offset 21); expected 15 Apr (offset 31).
      expect(days[20].optimistic).toBe(base);
      expect(days[21].optimistic).toBe(base + FEE);
      expect(days[21].expected).toBe(base);
      expect(days[30].expected).toBe(base);
      expect(days[31].expected).toBe(base + FEE);
   });

   it('pessimistic adds 15 days to the expected pay date', () => {
      const { days } = forecast(makeState({ students: [student] }), TODAY);
      // Pessimistic 5 Apr is 20 Apr (offset 36); 5 May is 20 May (offset 66).
      expect(days[35].pessimistic).toBe(OPENING_BALANCE);
      expect(days[36].pessimistic).toBe(OPENING_BALANCE + FEE);
      expect(days[66].pessimistic).toBe(OPENING_BALANCE + 2 * FEE);
      // The June fee arrives 20 Jun, beyond the 90-day horizon.
      expect(days[END_INDEX].pessimistic).toBe(OPENING_BALANCE + 2 * FEE);
   });

   it('never projects fees for a Risky family', () => {
      const risky = {
         ...student,
         id: 's-fr',
         familyId: 'fr',
      };
      const state = makeState({
         students: [risky],
         invoices: [invoice('h2', 'fr', '2024-12-05', FEE)],
         payments: [payment('ph2', 'h2', 'fr', FEE, '2025-03-01')],
      });
      const { days } = forecast(state, TODAY);
      // Only the cash already received is counted; nothing is projected.
      for (const day of days) {
         expect(day.expected).toBe(OPENING_BALANCE + FEE);
         expect(day.optimistic).toBe(OPENING_BALANCE + FEE);
         expect(day.pessimistic).toBe(OPENING_BALANCE + FEE);
      }
   });

   it('does not double count a month that is already invoiced', () => {
      const state = makeState({
         students: [student],
         invoices: [invoice('apr', 'fa', '2025-04-05', FEE)],
      });
      const { days } = forecast(state, TODAY);
      // April is an open invoice; May and June are projected. Three fees in all.
      expect(days[END_INDEX].expected).toBe(OPENING_BALANCE + 3 * FEE);
   });

   it('returns the same balances as no students when there are none', () => {
      const { days } = forecast(makeState(), TODAY);
      expect(days.every((day) => day.expected === OPENING_BALANCE)).toBe(true);
   });

   it('projects a month-end start through February of a leap year', () => {
      const { days } = forecast(makeState({ students: [student] }), '2024-01-31');
      // Feb 2024 has 29 days; the fee day is still the 5th, offset 5 from 31 Jan.
      expect(days[4].expected).toBe(OPENING_BALANCE);
      expect(days[5].expected).toBe(OPENING_BALANCE + FEE);
      expect(days[5].date).toBe('2024-02-05');
   });
});
