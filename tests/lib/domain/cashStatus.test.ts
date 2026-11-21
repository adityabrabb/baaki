// Purpose: Vitest cases for cashStatus: cash in hand, owed this month, empty khata and bad input.
import { describe, expect, it } from 'vitest';
import { cashStatus } from '../../../src/lib/domain/cashStatus';
import type { Invoice, Payment, StoreState } from '../../../src/lib/types';

const TODAY = '2025-03-14';

function makeState(invoices: Invoice[] = [], payments: Payment[] = []): StoreState {
   return {
      version: 1,
      business: { name: 'Test Classes', openingBalance: 10000, buffer: 0, upiId: 'test@upi' },
      families: [],
      students: [],
      invoices,
      payments,
      reminders: [],
      bills: [],
      settings: { defaultTone: 'gentle', defaultLanguage: 'hinglish' },
   };
}

const march: Invoice = {
   id: 'inv-2025-03-stu-01',
   studentId: 'stu-01',
   familyId: 'fam-01',
   month: '2025-03',
   amount: 2000,
   raisedOn: '2025-03-01',
   dueDate: '2025-03-05',
};

describe('cashStatus', () => {
   it('adds recorded payments to the opening balance and counts open fees this month', () => {
      const payment: Payment = {
         id: 'pay-1',
         invoiceId: march.id,
         familyId: 'fam-01',
         amount: 500,
         method: 'upi',
         date: '2025-03-10',
      };
      expect(cashStatus(makeState([march], [payment]), TODAY)).toEqual({
         balance: 10500,
         owedThisMonth: 1500,
      });
   });

   it('reports zero owed when the khata is empty', () => {
      expect(cashStatus(makeState(), TODAY)).toEqual({
         balance: 10000,
         owedThisMonth: 0,
      });
   });

   it('ignores last month invoices in the owed figure', () => {
      const february: Invoice = { ...march, id: 'inv-2025-02-stu-01', month: '2025-02' };
      expect(cashStatus(makeState([february]), TODAY).owedThisMonth).toBe(0);
   });

   it('rejects a today that is not YYYY-MM-DD', () => {
      expect(() => cashStatus(makeState(), '14/03/2025')).toThrow(RangeError);
   });
});
