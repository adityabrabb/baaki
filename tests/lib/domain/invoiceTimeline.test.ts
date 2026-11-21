// Purpose: Vitest cases for invoiceTimeline: raised, reminders, payments, paid-in-full ordering and empty history.
import { describe, expect, it } from 'vitest';
import { invoiceTimeline } from '../../../src/lib/domain/invoiceTimeline';
import type { Invoice, StoreState } from '../../../src/lib/types';

const invoice: Invoice = {
   id: 'inv-1',
   studentId: 'stu-1',
   familyId: 'fam-1',
   month: '2025-06',
   amount: 2000,
   raisedOn: '2025-06-01',
   dueDate: '2025-06-05',
};

function stateWith(overrides: Partial<StoreState>): StoreState {
   return {
      version: 1,
      business: { name: 'Test', openingBalance: 0, buffer: 0, upiId: 'a@upi' },
      families: [],
      students: [],
      invoices: [invoice],
      payments: [],
      reminders: [],
      bills: [],
      settings: { defaultTone: 'gentle', defaultLanguage: 'hinglish' },
      ...overrides,
   };
}

describe('invoiceTimeline', () => {
   it('shows only the raised event when nothing has happened', () => {
      const events = invoiceTimeline(stateWith({}), invoice);
      expect(events.map((e) => e.kind)).toEqual(['raised']);
      expect(events[0]).toMatchObject({ date: '2025-06-01', detail: 'Due 2025-06-05' });
   });

   it('orders reminders and payments by date and ends with paid in full', () => {
      const state = stateWith({
         reminders: [
            { id: 'r1', invoiceId: 'inv-1', sentOn: '2025-06-06', tone: 'firm', language: 'english', channel: 'whatsapp' },
         ],
         payments: [
            { id: 'p1', invoiceId: 'inv-1', familyId: 'fam-1', amount: 500, method: 'cash', date: '2025-06-03' },
            { id: 'p2', invoiceId: 'inv-1', familyId: 'fam-1', amount: 1500, method: 'upi', date: '2025-06-08' },
         ],
      });
      const events = invoiceTimeline(state, invoice);
      expect(events.map((e) => e.kind)).toEqual([
         'raised',
         'payment',
         'reminder',
         'payment',
         'paid',
      ]);
      expect(events[1].detail).toBe('₹500 by Cash');
      expect(events[4]).toMatchObject({ date: '2025-06-08', detail: '₹2,000' });
   });

   it('does not add a paid line while money is still due', () => {
      const state = stateWith({
         payments: [
            { id: 'p1', invoiceId: 'inv-1', familyId: 'fam-1', amount: 500, method: 'upi', date: '2025-06-03' },
         ],
      });
      expect(invoiceTimeline(state, invoice).map((e) => e.kind)).toEqual([
         'raised',
         'payment',
      ]);
   });

   it('ignores reminders and payments for other invoices', () => {
      const state = stateWith({
         payments: [
            { id: 'p1', invoiceId: 'inv-9', familyId: 'fam-2', amount: 2000, method: 'upi', date: '2025-06-03' },
         ],
      });
      expect(invoiceTimeline(state, invoice).map((e) => e.kind)).toEqual(['raised']);
   });
});
