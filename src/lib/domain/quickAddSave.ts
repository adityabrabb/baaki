// Purpose: saves a confirmed quick-add payment: finds the student or family, applies it to the oldest open invoices, and describes it for the chip (PRD §6).
// Pure: returns a new state or a friendly error; the caller commits the result and passes `today` in.
import {
   PAYMENT_ID_PREFIX,
   PAYMENT_METHOD_LABELS,
   QUICK_ADD_ERRORS,
   ROW_SEPARATOR,
} from '../constants';
import { addDays, dayLabel } from '../dates';
import type { PaymentMethod, StoreState } from '../types';
import { outstandingOf } from './chasePriority';
import { formatINR } from './formatINR';
import type { PaymentIntent, QuickAddIntent } from './parseQuickAdd';
import { nextId } from './roster';

export type SaveOutcome = { ok: true; state: StoreState } | { ok: false; error: string };

/** Why: a quick-add name may be a student or a family; a case-insensitive match on either finds it. */
export function familyIdByName(state: StoreState, name: string): string | null {
   const wanted = name.trim().toLowerCase();
   const student = state.students.find(
      (candidate) => candidate.active && candidate.name.trim().toLowerCase() === wanted,
   );
   if (student) return student.familyId;
   const family = state.families.find(
      (candidate) => candidate.name.trim().toLowerCase() === wanted,
   );
   return family?.id ?? null;
}

/**
 * Why: the payment goes to the oldest open invoices first, the same order the
 * chase uses, so owed totals and Today drop at once.
 */
export function applyQuickAdd(
   state: StoreState,
   intent: PaymentIntent,
   method: PaymentMethod,
   today: string,
): SaveOutcome {
   const familyId = familyIdByName(state, intent.name);
   if (familyId === null) return { ok: false, error: QUICK_ADD_ERRORS.unknownFamily };

   const open = state.invoices
      .filter((invoice) => invoice.familyId === familyId)
      .map((invoice) => ({ invoice, owed: outstandingOf(invoice, state.payments) }))
      .filter((entry) => entry.owed > 0)
      .sort(
         (a, b) =>
            a.invoice.dueDate.localeCompare(b.invoice.dueDate) ||
            a.invoice.id.localeCompare(b.invoice.id),
      );
   const totalOwed = open.reduce((sum, entry) => sum + entry.owed, 0);
   if (open.length === 0) return { ok: false, error: QUICK_ADD_ERRORS.nothingOwed };
   if (intent.amount > totalOwed) return { ok: false, error: QUICK_ADD_ERRORS.tooMuch };

   const date = addDays(today, intent.dayOffset);
   const payments = [...state.payments];
   let remaining = intent.amount;
   for (const { invoice, owed } of open) {
      if (remaining === 0) break;
      const amount = Math.min(owed, remaining);
      payments.push({
         id: nextId(PAYMENT_ID_PREFIX, payments.map((payment) => payment.id)),
         invoiceId: invoice.id,
         familyId,
         amount,
         method,
         date,
      });
      remaining -= amount;
   }
   return { ok: true, state: { ...state, payments } };
}

/** Why: the chip repeats what will be saved in plain words, so the tutor can check it before confirming. */
export function describeIntent(
   intent: QuickAddIntent,
   method: PaymentMethod | null,
   today: string,
): string {
   if (intent.kind === 'bill_paid') {
      return `${intent.billName}${ROW_SEPARATOR}${dayLabel(addDays(today, intent.dayOffset), today)}`;
   }
   const methodText = method === null ? '' : `${ROW_SEPARATOR}${PAYMENT_METHOD_LABELS[method]}`;
   const day = dayLabel(addDays(today, intent.dayOffset), today);
   return `${intent.name}${ROW_SEPARATOR}${formatINR(intent.amount)}${methodText}${ROW_SEPARATOR}${day}`;
}
