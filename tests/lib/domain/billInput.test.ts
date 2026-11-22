// Purpose: Vitest cases for the /bills zod rules: bill fields, opening balance and buffer, and bad input.
import { describe, expect, it } from 'vitest';
import {
   BILL_DAY_MAX,
   BILL_DAY_MIN,
   BILL_ERRORS,
   NAME_MAX_LENGTH,
} from '../../../src/lib/constants';
import {
   parseBalanceDraft,
   parseBillDraft,
} from '../../../src/lib/domain/billInput';

const VALID = { name: 'Rent', amount: 12000, dayOfMonth: 1 };

describe('parseBillDraft', () => {
   it('accepts a valid bill and trims the name', () => {
      const result = parseBillDraft({ ...VALID, name: '  Rent  ' });
      expect(result).toEqual({
         success: true,
         data: { name: 'Rent', amount: 12000, dayOfMonth: 1 },
      });
   });

   it('rejects an empty or spaces-only name', () => {
      for (const name of ['', '   ']) {
         const result = parseBillDraft({ ...VALID, name });
         expect(result).toEqual({
            success: false,
            errors: { name: BILL_ERRORS.nameRequired },
         });
      }
   });

   it('rejects a name longer than the limit', () => {
      const name = 'x'.repeat(NAME_MAX_LENGTH + 1);
      const result = parseBillDraft({ ...VALID, name });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.errors.name).toBe(BILL_ERRORS.nameTooLong);
   });

   it('rejects a zero or negative amount', () => {
      for (const amount of [0, -1500]) {
         const result = parseBillDraft({ ...VALID, amount });
         expect(result.success).toBe(false);
         if (!result.success) expect(result.errors.amount).toBe(BILL_ERRORS.amountPositive);
      }
   });

   it('rejects a decimal amount', () => {
      const result = parseBillDraft({ ...VALID, amount: 99.5 });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.errors.amount).toBe(BILL_ERRORS.wholeRupees);
   });

   it('rejects day 0 and day 29, and accepts day 1 and day 28', () => {
      for (const dayOfMonth of [0, BILL_DAY_MAX + 1]) {
         const result = parseBillDraft({ ...VALID, dayOfMonth });
         expect(result.success).toBe(false);
         if (!result.success) expect(result.errors.dayOfMonth).toBe(BILL_ERRORS.dayRange);
      }
      expect(parseBillDraft({ ...VALID, dayOfMonth: BILL_DAY_MIN }).success).toBe(true);
      expect(parseBillDraft({ ...VALID, dayOfMonth: BILL_DAY_MAX }).success).toBe(true);
   });

   it('rejects a non-integer day', () => {
      const result = parseBillDraft({ ...VALID, dayOfMonth: 12.5 });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.errors.dayOfMonth).toBe(BILL_ERRORS.dayRange);
   });

   it('gives one friendly message per field for bad types', () => {
      const result = parseBillDraft({ name: 42, amount: '1500', dayOfMonth: '5' });
      expect(result).toEqual({
         success: false,
         errors: {
            name: BILL_ERRORS.nameRequired,
            amount: BILL_ERRORS.wholeRupees,
            dayOfMonth: BILL_ERRORS.dayRange,
         },
      });
   });

   it('rejects a missing value (null from an empty box)', () => {
      const result = parseBillDraft({ ...VALID, amount: null });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.errors.amount).toBe(BILL_ERRORS.wholeRupees);
   });
});

describe('parseBalanceDraft', () => {
   it('accepts zero and positive whole rupees', () => {
      expect(parseBalanceDraft({ openingBalance: 0, buffer: 5000 })).toEqual({
         success: true,
         data: { openingBalance: 0, buffer: 5000 },
      });
   });

   it('rejects a negative buffer', () => {
      const result = parseBalanceDraft({ openingBalance: 18000, buffer: -1 });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.errors.buffer).toBe(BILL_ERRORS.balanceNegative);
   });

   it('rejects a decimal or non-number opening balance', () => {
      const decimal = parseBalanceDraft({ openingBalance: 100.5, buffer: 0 });
      expect(decimal.success).toBe(false);
      if (!decimal.success) expect(decimal.errors.openingBalance).toBe(BILL_ERRORS.wholeRupees);
      const text = parseBalanceDraft({ openingBalance: '18000', buffer: 0 });
      expect(text.success).toBe(false);
      if (!text.success) expect(text.errors.openingBalance).toBe(BILL_ERRORS.wholeRupees);
   });
});
