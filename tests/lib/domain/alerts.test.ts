// Purpose: checks the alerts for an uncovered bill, a dip under the buffer, and a healthy month.
import { describe, expect, it } from 'vitest';
import { alerts } from '../../../src/lib/domain/alerts';
import { TODAY, bill, makeState } from '../../fixtures/state';

describe('alerts', () => {
   it('flags a bill that expected cash does not cover', () => {
      const state = makeState({
         business: {
            name: 'Test',
            openingBalance: 1000,
            buffer: 500,
            upiId: 'x@upi',
         },
         bills: [bill('bill-rent', 'Rent', 1500, 1)],
      });
      const [first] = alerts(state, TODAY);
      expect(first.kind).toBe('uncovered_bill');
      expect(first.billId).toBe('bill-rent');
      expect(first.date).toBe('2025-04-01');
      expect(first.daysAway).toBe(17);
      expect(first.text).toContain('is not covered by expected cash.');
   });

   it('flags a bill that leaves cash under the buffer', () => {
      const state = makeState({
         business: {
            name: 'Test',
            openingBalance: 5000,
            buffer: 6000,
            upiId: 'x@upi',
         },
         bills: [bill('bill-phone', 'Phone and internet', 800, 12)],
      });
      const [first] = alerts(state, TODAY);
      expect(first.kind).toBe('below_buffer');
      expect(first.date).toBe('2025-04-12');
   });

   it('is empty when cash stays above the buffer', () => {
      const state = makeState({
         business: {
            name: 'Test',
            openingBalance: 100000,
            buffer: 5000,
            upiId: 'x@upi',
         },
         bills: [bill('bill-phone', 'Phone and internet', 800, 12)],
      });
      expect(alerts(state, TODAY)).toEqual([]);
   });
});
