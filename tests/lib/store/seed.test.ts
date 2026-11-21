// Purpose: checks the seeded demo store: determinism, roster sizes, history, overdue set and bad-day payments.
import { describe, expect, it } from 'vitest';
import {
   FAMILY_COUNT,
   HISTORY_MONTHS,
   OVERDUE_INVOICE_COUNT,
   OVERDUE_MAX,
   OVERDUE_MIN,
   STUDENT_COUNT,
} from '../../../src/lib/constants';
import { isAfterDate } from '../../../src/lib/dates';
import { buildSeedState } from '../../../src/lib/store/seed';
import { TODAY } from '../../fixtures/state';

const LAST_MONTH = '2025-02';

describe('buildSeedState', () => {
   it('gives deep-equal output for the same today', () => {
      expect(buildSeedState(TODAY)).toEqual(buildSeedState(TODAY));
   });

   it('rejects a today that is not YYYY-MM-DD', () => {
      expect(() => buildSeedState('15-03-2025')).toThrow(RangeError);
   });

   it('builds the configured roster of students and families', () => {
      const state = buildSeedState(TODAY);
      expect(state.students).toHaveLength(STUDENT_COUNT);
      expect(new Set(state.families.map((f) => f.id)).size).toBe(FAMILY_COUNT);
   });

   it('holds about six months of payment history', () => {
      const { payments } = buildSeedState(TODAY);
      const months = new Set(payments.map((p) => p.date.slice(0, 7)));
      expect(months.size).toBeGreaterThanOrEqual(HISTORY_MONTHS);
   });

   it('has the configured overdue set from last month still owing', () => {
      const state = buildSeedState(TODAY);
      const owing = state.invoices.filter((inv) => {
         if (inv.month !== LAST_MONTH) return false;
         const paid = state.payments
            .filter((p) => p.invoiceId === inv.id)
            .reduce((sum, p) => sum + p.amount, 0);
         return paid < inv.amount;
      });
      expect(owing).toHaveLength(OVERDUE_INVOICE_COUNT);
   });

   it('counts 8-10 overdue invoices as of the fixed today', () => {
      const state = buildSeedState(TODAY);
      const overdue = state.invoices.filter((inv) => {
         if (!isAfterDate(TODAY, inv.dueDate)) return false;
         const paid = state.payments
            .filter((p) => p.invoiceId === inv.id)
            .reduce((sum, p) => sum + p.amount, 0);
         return paid < inv.amount;
      });
      expect(overdue.length).toBeGreaterThanOrEqual(OVERDUE_MIN);
      expect(overdue.length).toBeLessThanOrEqual(OVERDUE_MAX);
   });

   it('includes several late or missed payments (bad-day scenario)', () => {
      const state = buildSeedState(TODAY);
      const dueById = new Map(state.invoices.map((i) => [i.id, i.dueDate]));
      const late = state.payments.filter(
         (p) => p.date > (dueById.get(p.invoiceId) ?? p.date),
      );
      expect(late.length).toBeGreaterThanOrEqual(3);
      expect(state.invoices.length).toBeGreaterThan(state.payments.length);
   });
});
