// Purpose: checks the four what-if scenarios on the seed and on an empty store.
import { describe, expect, it } from 'vitest';
import {
   FORECAST_HORIZON_DAYS,
   OPENING_BALANCE,
   WHATIF_SCENARIOS,
} from '../../../src/lib/constants';
import { forecast } from '../../../src/lib/domain/forecast';
import { whatIf } from '../../../src/lib/domain/whatIf';
import { buildSeedState } from '../../../src/lib/store/seed';
import { TODAY, bill, invoice, makeState } from '../../fixtures/state';

const student = {
   id: 's1',
   name: 'Aarav',
   familyId: 'fa',
   batch: 'Batch A',
   classLevel: 9,
   feeAmount: 2000,
   active: true,
};

describe('whatIf', () => {
   it('returns exactly the four scenarios with day and balance fields', () => {
      const scenarios = whatIf(buildSeedState(TODAY), TODAY);
      expect(scenarios.map((s) => s.id)).toEqual([...WHATIF_SCENARIOS]);
      for (const s of scenarios) {
         expect(s.days).toHaveLength(FORECAST_HORIZON_DAYS);
         expect(typeof s.endBalance).toBe('number');
         expect(s.label.length).toBeGreaterThan(0);
      }
   });

   it('shows no change when the store is empty', () => {
      const [familyLate, , loseStudents] = whatIf(makeState(), TODAY);
      expect(familyLate.affectedCount).toBe(0);
      expect(familyLate.endDelta).toBe(0);
      expect(familyLate.endBalance).toBe(OPENING_BALANCE);
      expect(loseStudents.endDelta).toBe(0);
   });

   it('adds a 10% rise to each projected fee from next month (Apr, May, Jun)', () => {
      const scenarios = whatIf(makeState({ students: [student] }), TODAY);
      const raise = scenarios.find((s) => s.id === 'raise_fees');
      expect(raise?.affectedCount).toBe(1);
      expect(raise?.endDelta).toBe(600);
   });

   it('takes the fee-rise percent from options', () => {
      const scenarios = whatIf(makeState({ students: [student] }), TODAY, {
         feeRisePercent: 20,
      });
      const raise = scenarios.find((s) => s.id === 'raise_fees');
      expect(raise?.endDelta).toBe(1200);
   });

   it('applies zero late days, zero leavers and zero rise as no change', () => {
      const state = makeState({ students: [student] });
      const scenarios = whatIf(state, TODAY, {
         lateDays: 0,
         lostCount: 0,
         feeRisePercent: 0,
      });
      expect(scenarios.find((s) => s.id === 'family_late')?.endDelta).toBe(0);
      expect(scenarios.find((s) => s.id === 'lose_students')?.endDelta).toBe(0);
      expect(scenarios.find((s) => s.id === 'raise_fees')?.endDelta).toBe(0);
   });

   it('takes the leaver count from options', () => {
      const scenarios = whatIf(makeState({ students: [student] }), TODAY, {
         lostCount: 1,
      });
      const lost = scenarios.find((s) => s.id === 'lose_students');
      expect(lost?.affectedCount).toBe(1);
      expect(lost?.endDelta).toBe(-6000);
   });

   it('keeps day 0 equal to normal in every scenario', () => {
      const state = makeState({
         students: [student],
         invoices: [invoice('t1', 'fa', TODAY, 1500)],
      });
      const normal = forecast(state, TODAY).days[0].expected;
      for (const scenario of whatIf(state, TODAY)) {
         expect(scenario.days[0].balance).toBe(normal);
      }
   });

   it('lowers the balance on the first bill after the fee day for top 5 late', () => {
      const families = ['f1', 'f2', 'f3', 'f4', 'f5'];
      const students = families.map((familyId, i) => ({
         ...student,
         id: `s${i + 1}`,
         familyId,
      }));
      const state = makeState({
         students,
         bills: [bill('bill-helper', 'Helper salary', 6000, 7)],
      });
      const billDate = '2025-04-07';
      const normal = forecast(state, TODAY).days.find((d) => d.date === billDate);
      const late = whatIf(state, TODAY).find((s) => s.id === 'top_families_late');
      const lateDay = late?.days.find((d) => d.date === billDate);
      expect(normal?.expected).toBe(OPENING_BALANCE + 5 * 2000 - 6000);
      expect(lateDay?.balance).toBe(OPENING_BALANCE - 6000);
      expect(lateDay?.balance).toBeLessThan(normal?.expected ?? 0);
   });
});
