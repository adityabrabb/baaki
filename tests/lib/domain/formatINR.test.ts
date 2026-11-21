// Purpose: checks Indian digit grouping, the rupee sign, and the non-finite guard in formatINR.
import { describe, expect, it } from 'vitest';
import { formatINR } from '../../../src/lib/domain/formatINR';

describe('formatINR', () => {
   it('groups thousands and lakhs the Indian way', () => {
      expect(formatINR(1000)).toBe('₹1,000');
      expect(formatINR(1500)).toBe('₹1,500');
      expect(formatINR(100000)).toBe('₹1,00,000');
      expect(formatINR(12345678)).toBe('₹1,23,45,678');
   });

   it('formats zero without a sign', () => {
      expect(formatINR(0)).toBe('₹0');
   });

   it('puts the minus sign before the symbol for negatives', () => {
      expect(formatINR(-1500)).toBe('-₹1,500');
   });

   it('rounds fractional rupees to whole rupees', () => {
      expect(formatINR(1500.6)).toBe('₹1,501');
   });

   it('throws a RangeError for non-finite amounts', () => {
      expect(() => formatINR(Number.NaN)).toThrow(RangeError);
      expect(() => formatINR(Number.POSITIVE_INFINITY)).toThrow(RangeError);
   });
});
