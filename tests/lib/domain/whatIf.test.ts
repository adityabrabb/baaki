// Purpose: checks the four what-if scenarios on the seed and on an empty store.
import { describe, expect, it } from 'vitest';
import {
   FORECAST_HORIZON_DAYS,
   OPENING_BALANCE,
   WHATIF_SCENARIOS,
} from '../../../src/lib/constants';
import { whatIf } from '../../../src/lib/domain/whatIf';
import { buildSeedState } from '../../../src/lib/store/seed';
import { TODAY, makeState } from '../../fixtures/state';

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

   it('adds a 10% fee rise from next month for each active student', () => {
      const scenarios = whatIf(makeState({ students: [student] }), TODAY);
      const raise = scenarios.find((s) => s.id === 'raise_fees');
      expect(raise?.affectedCount).toBe(1);
      expect(raise?.endDelta).toBe(200);
   });
});
