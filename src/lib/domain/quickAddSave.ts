// Purpose: saves a confirmed quick-add payment: finds the student or family, applies it to the oldest open invoices, and describes it for the chip (PRD §6).
// Pure: returns a new state or a friendly error; the caller commits the result and passes `today` in.
import {
   FAMILY_SUFFIX,
   NAME_WORD_PATTERN,
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
export type FamilyMatch = { ok: true; familyId: string } | { ok: false; error: string };

/** Why: a family is named "<surname> family", so the surname is the name without that suffix. */
function surnameOf(familyName: string): string {
   const trimmed = familyName.trim();
   return trimmed.toLowerCase().endsWith(FAMILY_SUFFIX)
      ? trimmed.slice(0, -FAMILY_SUFFIX.length).trim()
      : trimmed;
}

/** Why: a quick-add name is a student's first name or a family surname; exactly one family must match. */
export function familyIdByName(state: StoreState, name: string): FamilyMatch {
   const wanted = name.trim().toLowerCase();
   const familyIds = new Set<string>();
   for (const student of state.students) {
      if (!student.active) continue;
      const firstName = student.name.trim().split(NAME_WORD_PATTERN)[0] ?? '';
      if (firstName.toLowerCase() === wanted) familyIds.add(student.familyId);
   }
   for (const family of state.families) {
      if (surnameOf(family.name).toLowerCase() === wanted) familyIds.add(family.id);
   }
   if (familyIds.size > 1) return { ok: false, error: QUICK_ADD_ERRORS.ambiguous };
   const [familyId] = [...familyIds];
   if (familyId === undefined) return { ok: false, error: QUICK_ADD_ERRORS.unknownFamily };
   return { ok: true, familyId };
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
   const match = familyIdByName(state, intent.name);
   if (!match.ok) return match;
   const familyId = match.familyId;

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
