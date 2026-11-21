// Purpose: Vitest cases for recordPayment and invoiceStatus: full, partial, zero, over-amount and bad input.
import { describe, expect, it } from 'vitest';
import {
   invoiceStatus,
   recordPayment,
} from '../../../src/lib/domain/recordPayment';
import type { Invoice, StoreState } from '../../../src/lib/types';

const TODAY = '2025-06-10';

const invoice: Invoice = {
   id: 'inv-1',
   studentId: 'stu-1',
   familyId: 'fam-1',
   month: '2025-06',
   amount: 2000,
   raisedOn: '2025-06-01',
   dueDate: '2025-06-05',
};

function stateWith(): StoreState {
   return {
      version: 1,
      business: {
         name: 'Test Classes',
         openingBalance: 0,
         buffer: 0,
         upiId: 'test@upi',
      },
      families: [],
      students: [],
      invoices: [invoice],
      payments: [],
      reminders: [],
      bills: [],
      settings: { defaultTone: 'gentle', defaultLanguage: 'hinglish' },
   };
}

function draft(amount: unknown, method: unknown = 'upi', date = TODAY) {
   return { amount, method, date };
}

describe('recordPayment', () => {
   it('accepts a full payment equal to the balance', () => {
      const result = recordPayment(stateWith(), 'inv-1', draft(2000), TODAY);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.state.payments).toHaveLength(1);
      expect(result.state.payments[0]).toMatchObject({
         id: 'pay-1',
         invoiceId: 'inv-1',
         familyId: 'fam-1',
         amount: 2000,
         method: 'upi',
         date: TODAY,
      });
   });

   it('accepts a partial payment and leaves the rest due', () => {
      const result = recordPayment(stateWith(), 'inv-1', draft(500, 'cash'), TODAY);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(invoiceStatus(invoice, result.state.payments, TODAY)).toBe(
         'overdue',
      );
   });

   it('takes a second payment on the remaining balance to a paid status', () => {
      const first = recordPayment(stateWith(), 'inv-1', draft(500), TODAY);
      if (!first.ok) throw new Error('first payment should be accepted');
      const second = recordPayment(first.state, 'inv-1', draft(1500), TODAY);
      expect(second.ok).toBe(true);
      if (!second.ok) return;
      expect(second.state.payments.map((p) => p.id)).toEqual(['pay-1', 'pay-2']);
      expect(invoiceStatus(invoice, second.state.payments, TODAY)).toBe('paid');
   });

   it('rejects a zero amount', () => {
      const result = recordPayment(stateWith(), 'inv-1', draft(0), TODAY);
      expect(result.ok).toBe(false);
   });

   it('rejects a negative amount', () => {
      const result = recordPayment(stateWith(), 'inv-1', draft(-100), TODAY);
      expect(result.ok).toBe(false);
   });

   it('rejects an amount above the balance still due', () => {
      const result = recordPayment(stateWith(), 'inv-1', draft(2001), TODAY);
      expect(result).toEqual({
         ok: false,
         error: 'Amount cannot be more than the balance still due.',
      });
   });

   it('rejects a fraction of a rupee, NaN and missing amounts', () => {
      expect(recordPayment(stateWith(), 'inv-1', draft(10.5), TODAY).ok).toBe(
         false,
      );
      expect(recordPayment(stateWith(), 'inv-1', draft(NaN), TODAY).ok).toBe(
         false,
      );
      expect(
         recordPayment(stateWith(), 'inv-1', draft(undefined), TODAY).ok,
      ).toBe(false);
   });

   it('rejects a method other than upi or cash', () => {
      const result = recordPayment(stateWith(), 'inv-1', draft(100, 'card'), TODAY);
      expect(result.ok).toBe(false);
   });

   it('rejects an impossible date and a future date', () => {
      expect(
         recordPayment(stateWith(), 'inv-1', draft(100, 'upi', '2025-02-30'), TODAY)
            .ok,
      ).toBe(false);
      expect(
         recordPayment(stateWith(), 'inv-1', draft(100, 'upi', '2025-06-11'), TODAY)
            .ok,
      ).toBe(false);
   });

   it('accepts a payment dated today', () => {
      expect(recordPayment(stateWith(), 'inv-1', draft(100), TODAY).ok).toBe(true);
   });

   it('rejects non-object input without throwing', () => {
      expect(recordPayment(stateWith(), 'inv-1', null, TODAY).ok).toBe(false);
      expect(recordPayment(stateWith(), 'inv-1', 'abc', TODAY).ok).toBe(false);
   });

   it('rejects an unknown invoice id', () => {
      const result = recordPayment(stateWith(), 'inv-404', draft(100), TODAY);
      expect(result).toEqual({
         ok: false,
         error: 'That invoice is no longer in the khata.',
      });
   });

   it('rejects a payment on an invoice that is already paid', () => {
      const paid = recordPayment(stateWith(), 'inv-1', draft(2000), TODAY);
      if (!paid.ok) throw new Error('full payment should be accepted');
      const again = recordPayment(paid.state, 'inv-1', draft(1), TODAY);
      expect(again).toEqual({
         ok: false,
         error: 'This invoice is already paid in full.',
      });
   });

   it('never mutates the state it was given', () => {
      const before = stateWith();
      recordPayment(before, 'inv-1', draft(2000), TODAY);
      expect(before.payments).toHaveLength(0);
   });
});

describe('invoiceStatus', () => {
   it('is raised before the due date with nothing paid', () => {
      expect(invoiceStatus(invoice, [], '2025-06-04')).toBe('raised');
   });

   it('is overdue after the due date with nothing paid', () => {
      expect(invoiceStatus(invoice, [], TODAY)).toBe('overdue');
   });

   it('is overdue, not part-paid, when a partial payment is past due', () => {
      const payments = [
         { id: 'pay-1', invoiceId: 'inv-1', familyId: 'fam-1', amount: 500, method: 'cash' as const, date: '2025-06-06' },
      ];
      expect(invoiceStatus(invoice, payments, TODAY)).toBe('overdue');
   });

   it('is part-paid before the due date once some money has come in', () => {
      const payments = [
         { id: 'pay-1', invoiceId: 'inv-1', familyId: 'fam-1', amount: 500, method: 'upi' as const, date: '2025-06-02' },
      ];
      expect(invoiceStatus(invoice, payments, '2025-06-04')).toBe('part_paid');
   });
});
