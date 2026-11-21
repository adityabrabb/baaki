// Purpose: raises one fee invoice per active student for a month, skipping students already invoiced (PRD §4 step 1).
import { format } from 'date-fns';
import {
   FEE_DUE_DAY,
   ID_SEPARATOR,
   INVOICE_ID_PREFIX,
   NEXT_MONTH_OFFSET,
   RAISE_MONTH_FORMAT,
} from '../constants';
import {
   addMonths,
   dateInMonth,
   monthKeyOf,
   monthStart,
   parseDateOnly,
} from '../dates';
import type { Invoice, StoreState } from '../types';

export interface RaiseResult {
   state: StoreState;
   raised: number;
}

/** Why: the invoice id embeds the month and student, so a repeat press cannot add the same fee twice. */
function invoiceIdFor(month: string, studentId: string): string {
   return `${INVOICE_ID_PREFIX}${ID_SEPARATOR}${month}${ID_SEPARATOR}${studentId}`;
}

/** Why: fees are raised in advance, so the button offers the month after today. */
export function raiseTargetMonth(today: string): string {
   return monthKeyOf(addMonths(monthStart(today), NEXT_MONTH_OFFSET));
}

/**
 * Why: pure and idempotent. Pressing "Raise fees" twice leaves the second press
 * with nothing to add, because each active student is checked for the target month first.
 */
export function raiseMonthlyFees(state: StoreState, today: string): RaiseResult {
   const month = raiseTargetMonth(today);
   const invoiced = new Set(
      state.invoices
         .filter((invoice) => invoice.month === month)
         .map((invoice) => invoice.studentId),
   );
   const raisedOn = monthStart(today);
   const dueDate = dateInMonth(month, FEE_DUE_DAY);
   const fresh: Invoice[] = state.students
      .filter((student) => student.active && !invoiced.has(student.id))
      .map((student) => ({
         id: invoiceIdFor(month, student.id),
         studentId: student.id,
         familyId: student.familyId,
         month,
         amount: student.feeAmount,
         raisedOn,
         dueDate,
      }));
   if (fresh.length === 0) return { state, raised: 0 };
   return {
      state: { ...state, invoices: [...state.invoices, ...fresh] },
      raised: fresh.length,
   };
}

/** Why: the button label names the month being raised, e.g. "April 2025". */
export function raiseMonthLabel(today: string): string {
   const target = addMonths(monthStart(today), NEXT_MONTH_OFFSET);
   return format(parseDateOnly(target), RAISE_MONTH_FORMAT);
}
