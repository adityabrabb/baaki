// Purpose: checks the expected pay date = due date + average delay, floored at zero.
import { describe, expect, it } from 'vitest';
import { expectedPayDate } from '../../../src/lib/domain/expectedPayDate';

describe('expectedPayDate', () => {
   it('returns the due date when the average delay is zero', () => {
      expect(expectedPayDate('2025-03-05', 0)).toBe('2025-03-05');
   });

   it('shifts the due date by a positive average delay', () => {
      expect(expectedPayDate('2025-03-05', 4)).toBe('2025-03-09');
   });

   it('never pulls the date earlier than the due date', () => {
      expect(expectedPayDate('2025-03-05', -2)).toBe('2025-03-05');
   });

   it('crosses a month end', () => {
      expect(expectedPayDate('2025-01-28', 5)).toBe('2025-02-02');
   });

   it('crosses February in a leap year', () => {
      expect(expectedPayDate('2024-02-25', 5)).toBe('2024-03-01');
   });
});
