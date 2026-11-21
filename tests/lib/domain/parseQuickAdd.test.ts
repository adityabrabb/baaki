// Purpose: checks the quick-add parser: valid lines parse, anything else returns null without throwing.
import { describe, expect, it } from 'vitest';
import { parseQuickAdd } from '../../../src/lib/domain/parseQuickAdd';

describe('parseQuickAdd', () => {
   it('parses a payment line with a method', () => {
      expect(parseQuickAdd('Rohan paid 1500 upi')).toEqual({
         kind: 'payment',
         name: 'Rohan',
         amount: 1500,
         method: 'upi',
         dayOffset: 0,
      });
   });

   it('parses a cash payment dated yesterday', () => {
      expect(parseQuickAdd('Asha 2000 cash yesterday')).toEqual({
         kind: 'payment',
         name: 'Asha',
         amount: 2000,
         method: 'cash',
         dayOffset: -1,
      });
   });

   it('leaves the method null when the line does not name one', () => {
      const intent = parseQuickAdd('Rohan paid 1500');
      expect(intent?.kind).toBe('payment');
      expect(intent?.kind === 'payment' ? intent.method : undefined).toBeNull();
   });

   it('parses a recurring bill marked paid', () => {
      expect(parseQuickAdd('rent paid')).toEqual({
         kind: 'bill_paid',
         billName: 'rent',
         dayOffset: 0,
      });
   });

   it('returns null for bad input and never throws', () => {
      expect(parseQuickAdd('hello world')).toBeNull();
      expect(parseQuickAdd('')).toBeNull();
      expect(parseQuickAdd('   ')).toBeNull();
      expect(parseQuickAdd('1500')).toBeNull();
      expect(parseQuickAdd('Rohan paid 0 upi')).toBeNull();
      expect(parseQuickAdd('Rohan paid 99999999 upi')).toBeNull();
      expect(parseQuickAdd('x'.repeat(200))).toBeNull();
      expect(parseQuickAdd(42 as unknown as string)).toBeNull();
   });
});
