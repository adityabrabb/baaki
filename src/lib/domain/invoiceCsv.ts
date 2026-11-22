// Purpose: builds the invoice CSV for the /settings export: one row per invoice, RFC 4180 layout.
// Pure: the store state and today are passed in; no download or formatting happens here.
import {
   CSV_DELIMITER,
   CSV_HEADER,
   CSV_LINE_END,
   CSV_NEEDS_QUOTES_PATTERN,
   CSV_QUOTE,
   CSV_QUOTE_ESCAPE,
   CSV_QUOTE_PATTERN,
   STAMP_LABELS,
} from '../constants';
import type { Invoice, Payment, StoreState } from '../types';
import { invoiceStatus } from './recordPayment';

/** Why: RFC 4180 wraps a cell in quotes when it holds a comma, quote or line break, and doubles inner quotes. */
export function csvCell(value: string | number): string {
   const text = String(value);
   if (!CSV_NEEDS_QUOTES_PATTERN.test(text)) return text;
   const escaped = text.replace(CSV_QUOTE_PATTERN, CSV_QUOTE_ESCAPE);
   return `${CSV_QUOTE}${escaped}${CSV_QUOTE}`;
}

/** Why: one record is its cells joined by the delimiter, each escaped on its own. */
function csvRow(cells: Array<string | number>): string {
   return cells.map(csvCell).join(CSV_DELIMITER);
}

/** Why: "paid" is money received so far, summed from this invoice's payments. */
function paidOf(invoice: Invoice, payments: Payment[]): number {
   return payments
      .filter((payment) => payment.invoiceId === invoice.id)
      .reduce((sum, payment) => sum + payment.amount, 0);
}

/** Why: the status column reuses the stamp words the invoice page shows, so both read the same. */
function invoiceRow(invoice: Invoice, state: StoreState, today: string): string {
   const family = state.families.find((item) => item.id === invoice.familyId);
   const student = state.students.find((item) => item.id === invoice.studentId);
   const status = invoiceStatus(invoice, state.payments, today);
   return csvRow([
      family?.name ?? '',
      student?.name ?? '',
      invoice.month,
      invoice.amount,
      paidOf(invoice, state.payments),
      STAMP_LABELS[status],
   ]);
}

/** Why: the header always comes first, so an empty khata still exports a valid file. */
export function buildInvoiceCsv(state: StoreState, today: string): string {
   const lines = [
      csvRow([...CSV_HEADER]),
      ...state.invoices.map((invoice) => invoiceRow(invoice, state, today)),
   ];
   return `${lines.join(CSV_LINE_END)}${CSV_LINE_END}`;
}
