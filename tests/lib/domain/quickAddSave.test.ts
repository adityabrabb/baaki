// Purpose: checks quick-add name resolution (surname or first name), oldest-first split payments, and the no-match and ambiguous errors.
import { describe, expect, it } from 'vitest';
import { QUICK_ADD_ERRORS } from '../../../src/lib/constants';
import { applyQuickAdd } from '../../../src/lib/domain/quickAddSave';
import type { PaymentIntent } from '../../../src/lib/domain/parseQuickAdd';
import { TODAY, invoice, makeState } from '../../fixtures/state';

const iyerFamily = { id: 'fam-iyer', name: 'Iyer family', phone: '' };
const meera = {
   id: 'stu-meera',
   name: 'Meera Iyer',
   familyId: 'fam-iyer',
   batch: 'Batch A',
   classLevel: 8,
   feeAmount: 2500,
   active: true,
};

function intentFor(name: string, amount: number): PaymentIntent {
   return { kind: 'payment', name, amount, method: 'upi', dayOffset: 0 };
}

describe('applyQuickAdd', () => {
   it('resolves a family surname and records the payment', () => {
      const state = makeState({
         families: [iyerFamily],
         students: [meera],
         invoices: [invoice('inv-1', 'fam-iyer', '2025-03-05', 2500)],
      });
      const outcome = applyQuickAdd(state, intentFor('Iyer', 2500), 'upi', TODAY);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) return;
      expect(outcome.state.payments).toHaveLength(1);
      expect(outcome.state.payments[0]).toMatchObject({
         invoiceId: 'inv-1',
         familyId: 'fam-iyer',
         amount: 2500,
      });
   });

   it('splits the amount across the two oldest unpaid invoices', () => {
      const state = makeState({
         families: [iyerFamily],
         students: [meera],
         invoices: [
            invoice('inv-feb', 'fam-iyer', '2025-02-05', 1500),
            invoice('inv-mar', 'fam-iyer', '2025-03-05', 2000),
         ],
      });
      const outcome = applyQuickAdd(state, intentFor('Iyer', 2500), 'upi', TODAY);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) return;
      const amounts = outcome.state.payments.map((payment) => [
         payment.invoiceId,
         payment.amount,
      ]);
      expect(amounts).toEqual([
         ['inv-feb', 1500],
         ['inv-mar', 1000],
      ]);
   });

   it('returns the no-match error and writes nothing for an unknown name', () => {
      const state = makeState({
         families: [iyerFamily],
         students: [meera],
         invoices: [invoice('inv-1', 'fam-iyer', '2025-03-05', 2500)],
      });
      const outcome = applyQuickAdd(state, intentFor('Kapoor', 2500), 'upi', TODAY);
      expect(outcome).toEqual({ ok: false, error: QUICK_ADD_ERRORS.unknownFamily });
      expect(state.payments).toHaveLength(0);
   });

   it('resolves a shared surname to the only family still owing fees', () => {
      const state = makeState({
         families: [iyerFamily, { id: 'fam-iyer-2', name: 'Iyer family', phone: '' }],
         invoices: [invoice('inv-1', 'fam-iyer', '2025-03-05', 2500)],
      });
      const outcome = applyQuickAdd(state, intentFor('iyer', 2500), 'upi', TODAY);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) return;
      expect(outcome.state.payments[0]).toMatchObject({ familyId: 'fam-iyer' });
   });

   it('returns the ambiguity error with candidates when several families owe fees', () => {
      const state = makeState({
         families: [iyerFamily, { id: 'fam-iyer-2', name: 'Iyer family', phone: '' }],
         invoices: [
            invoice('inv-1', 'fam-iyer', '2025-03-05', 2500),
            invoice('inv-2', 'fam-iyer-2', '2025-03-05', 2500),
         ],
      });
      const outcome = applyQuickAdd(state, intentFor('iyer', 2500), 'upi', TODAY);
      expect(outcome).toEqual({
         ok: false,
         error: QUICK_ADD_ERRORS.ambiguous,
         candidates: [
            { familyId: 'fam-iyer', label: 'Iyer family' },
            { familyId: 'fam-iyer-2', label: 'Iyer family' },
         ],
      });
   });
});
