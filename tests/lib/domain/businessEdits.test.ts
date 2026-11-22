// Purpose: Vitest cases for openingFromCash: the typed cash in hand must equal what cashStatus shows after saving.
import { describe, expect, it } from 'vitest';
import { openingFromCash, setBalances } from '../../../src/lib/domain/businessEdits';
import { cashStatus } from '../../../src/lib/domain/cashStatus';
import type { Payment, StoreState } from '../../../src/lib/types';

const TODAY = '2025-03-14';

const payment: Payment = {
   id: 'pay-1',
   invoiceId: 'inv-2025-03-stu-01',
   familyId: 'fam-01',
   amount: 500,
   method: 'upi',
   date: '2025-03-10',
};

function makeState(payments: Payment[] = []): StoreState {
   return {
      version: 1,
      business: { name: 'Test Classes', openingBalance: 10000, buffer: 0, upiId: 'test@upi' },
      families: [],
      students: [],
      invoices: [],
      payments,
      reminders: [],
      bills: [],
      settings: { defaultTone: 'gentle', defaultLanguage: 'hinglish' },
   };
}

describe('openingFromCash', () => {
   it('makes cash in hand equal the typed amount when payments are recorded', () => {
      const state = makeState([payment]);
      const next = setBalances(state, openingFromCash(state, 20000), 0);
      expect(cashStatus(next, TODAY).balance).toBe(20000);
   });

   it('stores the cash minus payments as the opening balance', () => {
      expect(openingFromCash(makeState([payment]), 16000)).toBe(15500);
   });

   it('equals the typed amount when no payments are recorded', () => {
      expect(openingFromCash(makeState(), 16000)).toBe(16000);
   });
});
