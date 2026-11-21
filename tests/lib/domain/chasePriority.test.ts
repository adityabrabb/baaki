// Purpose: checks the chase queue: overdue families only, ordering, and partial payments.
import { describe, expect, it } from 'vitest';
import { chasePriority } from '../../../src/lib/domain/chasePriority';
import { TODAY, invoice, makeState, payment, reminder } from '../../fixtures/state';

const families = [
   { id: 'fa', name: 'Kulkarni', phone: '+91 90000 00001' },
   { id: 'fb', name: 'Joshi', phone: '+91 90000 00002' },
   { id: 'fc', name: 'Patil', phone: '+91 90000 00003' },
   { id: 'fd', name: 'Mehta', phone: '+91 90000 00004' },
];

describe('chasePriority', () => {
   it('lists only overdue families, biggest open money first', () => {
      const state = makeState({
         families,
         invoices: [
            invoice('ia', 'fa', '2025-03-05'),
            invoice('ib', 'fb', '2025-03-05'),
            invoice('ic', 'fb', '2025-03-05'),
            invoice('ifc', 'fc', '2025-03-20'),
            invoice('ifd', 'fd', '2025-03-05'),
         ],
         payments: [payment('pd', 'ifd', 'fd', 1500, '2025-03-06')],
      });
      const items = chasePriority(state, TODAY);
      expect(items.map((i) => i.familyId)).toEqual(['fb', 'fa']);
      expect(items[0].owed).toBe(3000);
      expect(items[0].daysLate).toBe(10);
      expect(items[0].invoiceIds).toEqual(['ib', 'ic']);
   });

   it('keeps a part-paid invoice in the queue with only the balance owed', () => {
      const state = makeState({
         families,
         invoices: [invoice('ie', 'fa', '2025-03-05', 1500)],
         payments: [payment('pe', 'ie', 'fa', 500, '2025-03-06')],
      });
      const [only] = chasePriority(state, TODAY);
      expect(only.familyId).toBe('fa');
      expect(only.owed).toBe(1000);
      expect(only.daysLate).toBe(10);
   });

   it('lowers the score by one for each reminder sent in the last 3 days', () => {
      const state = makeState({
         families,
         invoices: [invoice('ia', 'fa', '2025-03-05')],
         reminders: [reminder('r1', 'ia', '2025-03-13')],
      });
      const [only] = chasePriority(state, TODAY);
      expect(only.recentReminders).toBe(1);
      expect(only.score).toBe(1500 * 10 - 1);
   });

   it('is empty when nothing is past due', () => {
      expect(chasePriority(makeState({ families }), TODAY)).toEqual([]);
   });
});
