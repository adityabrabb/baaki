// Purpose: checks the scenario line names the active what-if and its parameters, and says Normal when none is picked.
import { describe, expect, it } from 'vitest';
import { WHATIF_LATE_DAYS } from '../../../src/lib/constants';
import { scenarioLine } from '../../../src/lib/domain/scenarioLine';

const none = { id: null, lateDays: 15, lostCount: 2, feeRisePercent: 10 } as const;

describe('scenarioLine', () => {
   it('says Normal when no what-if is picked', () => {
      expect(scenarioLine(none)).toBe(
         'Scenario: Normal. No what-if picked; this is the expected forecast.',
      );
   });

   it('names one family late with its number of days', () => {
      const line = scenarioLine({ ...none, id: 'family_late', lateDays: 7 });
      expect(line).toContain('One family pays late');
      expect(line).toContain('7 days later');
   });

   it('names the top five families at the fixed late days', () => {
      const line = scenarioLine({ ...none, id: 'top_families_late' });
      expect(line).toContain('Top families pay late');
      expect(line).toContain('5 largest families');
      expect(line).toContain(`${WHATIF_LATE_DAYS} days later`);
   });

   it('names the leaver count', () => {
      const line = scenarioLine({ ...none, id: 'lose_students', lostCount: 3 });
      expect(line).toContain('Students leave next month');
      expect(line).toContain('Removes 3 students');
   });

   it('names the fee rise percent', () => {
      const line = scenarioLine({ ...none, id: 'raise_fees', feeRisePercent: 12 });
      expect(line).toContain('Fees rise next month');
      expect(line).toContain('Raises projected fees 12%');
   });
});
