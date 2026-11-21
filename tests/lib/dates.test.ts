// Purpose: checks the date-only helpers on YYYY-MM-DD strings (Asia/Kolkata rules).
import { describe, expect, it } from 'vitest';
import {
   addDays,
   addMonths,
   dateInMonth,
   diffDays,
   isAfterDate,
   isBeforeDate,
   isDateOnly,
   kolkataDateOf,
   monthEnd,
   monthKeyOf,
   monthStart,
   parseDateOnly,
   toDateOnly,
} from '../../src/lib/dates';
import { TODAY } from '../fixtures/state';

describe('parseDateOnly / toDateOnly', () => {
   it('round-trips a YYYY-MM-DD string', () => {
      expect(toDateOnly(parseDateOnly(TODAY))).toBe(TODAY);
   });

   it('rejects a non-ISO date with a RangeError', () => {
      expect(() => parseDateOnly('15/03/2025')).toThrow(RangeError);
      expect(isDateOnly('2025-3-5')).toBe(false);
   });
});

describe('addDays', () => {
   it('crosses a month end forwards and backwards', () => {
      expect(addDays('2025-01-31', 1)).toBe('2025-02-01');
      expect(addDays('2025-03-01', -1)).toBe('2025-02-28');
   });

   it('handles the leap day 2024-02-29', () => {
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
      expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
   });

   it('does not treat 2025 as a leap year', () => {
      expect(addDays('2025-02-28', 1)).toBe('2025-03-01');
   });
});

describe('monthEnd / monthStart', () => {
   it('gives 29 February in a leap year and 28 in a common year', () => {
      expect(monthEnd('2024-02-10')).toBe('2024-02-29');
      expect(monthEnd('2025-02-10')).toBe('2025-02-28');
   });

   it('gives 31 March for a mid-March date', () => {
      expect(monthEnd(TODAY)).toBe('2025-03-31');
   });

   it('gives the first day of the month', () => {
      expect(monthStart(TODAY)).toBe('2025-03-01');
      expect(monthKeyOf(TODAY)).toBe('2025-03');
   });
});

describe('diffDays', () => {
   it('returns later minus earlier in whole days', () => {
      expect(diffDays(TODAY, '2025-03-01')).toBe(14);
      expect(diffDays('2025-03-01', TODAY)).toBe(-14);
      expect(diffDays(TODAY, TODAY)).toBe(0);
   });

   it('counts across the leap day', () => {
      expect(diffDays('2024-03-01', '2024-02-28')).toBe(2);
   });
});

describe('addMonths and dateInMonth', () => {
   it('clamps the day when a month is shorter', () => {
      expect(addMonths('2025-01-31', 1)).toBe('2025-02-28');
      expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
   });

   it('builds a due date and clamps 31 in February', () => {
      expect(dateInMonth('2025-03', 5)).toBe('2025-03-05');
      expect(dateInMonth('2025-02', 31)).toBe('2025-02-28');
      expect(dateInMonth('2024-02', 31)).toBe('2024-02-29');
   });

   it('rejects a malformed month key', () => {
      expect(() => dateInMonth('2025-3', 5)).toThrow(RangeError);
   });
});

describe('ordering and Kolkata day', () => {
   it('compares date-only strings by calendar day', () => {
      expect(isBeforeDate('2025-03-14', TODAY)).toBe(true);
      expect(isAfterDate('2025-03-14', TODAY)).toBe(false);
   });

   it('maps an instant to the Kolkata calendar day', () => {
      // 20:00 UTC on 14 March is 01:30 IST on 15 March.
      expect(kolkataDateOf(new Date('2025-03-14T20:00:00Z'))).toBe(TODAY);
   });
});
