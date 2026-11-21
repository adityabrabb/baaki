// Purpose: Vitest cases for nextBill: covered and not covered, rollover to next month, leap day, no bills and bad input.
import { describe, expect, it } from 'vitest';
import type { Bill, StoreState } from '../../../src/lib/types';
import { nextBill } from '../../../src/lib/domain/nextBill';

const TODAY = '2025-03-14';

function bill(id: string, dayOfMonth: number, amount: number, active = true): Bill {
   return { id, name: `Bill ${id}`, amount, dayOfMonth, active };
}

function makeState(bills: Bill[], openingBalance = 10000): StoreState {
   return {
      version: 1,
      business: { name: 'Test Classes', openingBalance, buffer: 0, upiId: 'test@upi' },
      families: [],
      students: [],
      invoices: [],
      payments: [],
      reminders: [],
      bills,
      settings: { defaultTone: 'gentle', defaultLanguage: 'hinglish' },
   };
}

describe('nextBill', () => {
   it('picks the nearest active bill and marks it covered when cash is enough', () => {
      const state = makeState([bill('rent', 20, 8000), bill('phone', 25, 800)]);
      expect(nextBill(state, TODAY)).toEqual({
         id: 'rent',
         name: 'Bill rent',
         amount: 8000,
         date: '2025-03-20',
         covered: true,
      });
   });

   it('marks the bill not covered when cash is below the amount', () => {
      const state = makeState([bill('rent', 20, 12000)], 10000);
      expect(nextBill(state, TODAY)?.covered).toBe(false);
   });

   it('treats a bill due today as the next bill', () => {
      expect(nextBill(makeState([bill('rent', 14, 100)]), TODAY)?.date).toBe('2025-03-14');
   });

   it('rolls a bill whose day has passed to next month', () => {
      expect(nextBill(makeState([bill('rent', 1, 100)]), TODAY)?.date).toBe('2025-04-01');
   });

   it('clamps a day 31 bill to the end of a short month, leap day included', () => {
      const result = nextBill(makeState([bill('rent', 31, 100)]), '2024-02-10');
      expect(result?.date).toBe('2024-02-29');
   });

   it('ignores inactive bills', () => {
      expect(nextBill(makeState([bill('old', 20, 100, false)]), TODAY)).toBeNull();
   });

   it('returns null when there are no bills', () => {
      expect(nextBill(makeState([]), TODAY)).toBeNull();
   });

   it('rejects a today that is not YYYY-MM-DD', () => {
      expect(() => nextBill(makeState([bill('rent', 1, 100)]), 'today')).toThrow(RangeError);
   });
});
