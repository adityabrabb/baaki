// Purpose: records a manual payment against one invoice and derives its balance and status (PRD §5, §6).
// Pure: callers pass `today`; nothing here reads the clock or storage.
import { z } from 'zod';
import {
   FIRST_NEW_ID_NUMBER,
   ID_SEPARATOR,
   ID_STEP,
   MIN_PAYMENT_AMOUNT,
   PAYMENT_ERRORS,
   PAYMENT_ID_PREFIX,
   PAYMENT_METHODS,
   type STAMP_VARIANTS,
} from '../constants';
import { isAfterDate, isBeforeDate, isDateOnly } from '../dates';
import type { Invoice, Payment, StoreState } from '../types';
import { outstandingOf } from './chasePriority';

/** Why: the four stamp states an invoice can show (PAID, OVERDUE, PART-PAID, RAISED). */
export type InvoiceStatus = (typeof STAMP_VARIANTS)[number];

/** Outcome of a payment attempt: the next state, or a friendly message. */
export type RecordResult =
   | { ok: true; state: StoreState }
   | { ok: false; error: string };

/**
 * Why: one schema per invoice balance, so an over-amount payment is rejected
 * by the same rule that shows the message. Date must be a real day, not future.
 */
export function paymentInputSchema(balance: number, today: string) {
   return z.object({
      amount: z
         .number({ message: PAYMENT_ERRORS.amountRequired })
         .int({ message: PAYMENT_ERRORS.amountRequired })
         .min(MIN_PAYMENT_AMOUNT, { message: PAYMENT_ERRORS.amountMin })
         .max(balance, { message: PAYMENT_ERRORS.amountTooHigh }),
      method: z.enum(PAYMENT_METHODS, { message: PAYMENT_ERRORS.methodRequired }),
      date: z.string().refine(
         (value) => isDateOnly(value) && !isAfterDate(value, today),
         { message: PAYMENT_ERRORS.dateInvalid },
      ),
   });
}

/**
 * Why: the status shown as a stamp. Any money received with a balance left is
 * PART-PAID, even when past due; OVERDUE is only for an invoice with nothing paid.
 */
export function invoiceStatus(
   invoice: Invoice,
   payments: Payment[],
   today: string,
): InvoiceStatus {
   const balance = outstandingOf(invoice, payments);
   if (balance === 0) return 'paid';
   if (isBeforeDate(invoice.dueDate, today)) return 'overdue';
   if (balance < invoice.amount) return 'part_paid';
   return 'raised';
}

/** Why: payment ids are sequential per store; skip any id already taken. */
function paymentIdAt(n: number): string {
   return `${PAYMENT_ID_PREFIX}${ID_SEPARATOR}${n}`;
}

/** Why: a new id never collides with an existing payment, even after seeding. */
function nextPaymentId(payments: Payment[]): string {
   const taken = new Set(payments.map((payment) => payment.id));
   let n = payments.length + FIRST_NEW_ID_NUMBER;
   while (taken.has(paymentIdAt(n))) n += ID_STEP;
   return paymentIdAt(n);
}

/**
 * Why: the single rule for taking money: validated input, balance checked
 * against the invoice, and the new payment appended without touching others.
 */
export function recordPayment(
   state: StoreState,
   invoiceId: string,
   input: unknown,
   today: string,
): RecordResult {
   const invoice = state.invoices.find((item) => item.id === invoiceId);
   if (!invoice) return { ok: false, error: PAYMENT_ERRORS.invoiceMissing };

   const balance = outstandingOf(invoice, state.payments);
   if (balance === 0) return { ok: false, error: PAYMENT_ERRORS.alreadyPaid };

   const parsed = paymentInputSchema(balance, today).safeParse(input);
   if (!parsed.success) {
      const message =
         parsed.error.issues[0]?.message ?? PAYMENT_ERRORS.amountRequired;
      return { ok: false, error: message };
   }

   const payment: Payment = {
      id: nextPaymentId(state.payments),
      invoiceId: invoice.id,
      familyId: invoice.familyId,
      amount: parsed.data.amount,
      method: parsed.data.method,
      date: parsed.data.date,
   };
   return {
      ok: true,
      state: { ...state, payments: [...state.payments, payment] },
   };
}
