// Purpose: Vitest cases for the invoice CSV: header row, normal rows, empty list, RFC 4180 escaping, and paid vs status.
import { describe, expect, it } from 'vitest';
import { buildInvoiceCsv, csvCell } from '../../../src/lib/domain/invoiceCsv';
import type { Invoice, Payment, StoreState } from '../../../src/lib/types';

const TODAY = '2025-06-03';
const HEADER = 'family,student,month,amount,paid,status\r\n';

/** Why: a complete store with only the invoice tables filled in, so each test states its own facts. */
function stateWith(parts: {
   families?: StoreState['families'];
   students?: StoreState['students'];
   invoices?: Invoice[];
   payments?: Payment[];
}): StoreState {
   return {
      version: 1,
      business: { name: 'Test Tutor', openingBalance: 0, buffer: 0, upiId: 'test@upi' },
      families: parts.families ?? [],
      students: parts.students ?? [],
      invoices: parts.invoices ?? [],
      payments: parts.payments ?? [],
      reminders: [],
      bills: [],
      settings: { defaultTone: 'gentle', defaultLanguage: 'hinglish' },
   };
}

const FAMILY = { id: 'fam-1', name: 'Kulkarni family', phone: '' };
const STUDENT = {
   id: 'stu-1',
   name: 'Aarav',
   familyId: 'fam-1',
   batch: 'Batch A',
   classLevel: 8,
   feeAmount: 1500,
   active: true,
};

/** Why: an invoice due after TODAY is RAISED unless paid; a due date before TODAY is OVERDUE. */
function invoice(overrides: Partial<Invoice> = {}): Invoice {
   return {
      id: 'inv-1',
      studentId: 'stu-1',
      familyId: 'fam-1',
      month: '2025-06',
      amount: 1500,
      raisedOn: '2025-06-01',
      dueDate: '2025-06-05',
      ...overrides,
   };
}

function payment(amount: number, invoiceId = 'inv-1'): Payment {
   return {
      id: `pay-${amount}`,
      invoiceId,
      familyId: 'fam-1',
      amount,
      method: 'upi',
      date: '2025-06-02',
   };
}

describe('buildInvoiceCsv', () => {
   it('writes the header row first', () => {
      const csv = buildInvoiceCsv(stateWith({}), TODAY);
      expect(csv.startsWith(HEADER)).toBe(true);
   });

   it('writes a normal row with plain integer money', () => {
      const csv = buildInvoiceCsv(
         stateWith({ families: [FAMILY], students: [STUDENT], invoices: [invoice({ amount: 12000 })] }),
         TODAY,
      );
      expect(csv).toBe(`${HEADER}Kulkarni family,Aarav,2025-06,12000,0,RAISED\r\n`);
   });

   it('returns only the header for an empty list', () => {
      expect(buildInvoiceCsv(stateWith({}), TODAY)).toBe(HEADER);
   });

   it('quotes a cell that contains a comma', () => {
      expect(csvCell('Mehta, Rao')).toBe('"Mehta, Rao"');
      const csv = buildInvoiceCsv(
         stateWith({
            families: [{ ...FAMILY, name: 'Mehta, Rao' }],
            students: [STUDENT],
            invoices: [invoice()],
         }),
         TODAY,
      );
      expect(csv).toContain('"Mehta, Rao",Aarav,');
   });

   it('doubles quotes inside a quoted cell', () => {
      expect(csvCell('Say "hi"')).toBe('"Say ""hi"""');
   });

   it('quotes a cell that contains a line break', () => {
      expect(csvCell('line one\nline two')).toBe('"line one\nline two"');
      expect(csvCell('line one\r\nline two')).toBe('"line one\r\nline two"');
   });

   it('leaves a plain cell unquoted', () => {
      expect(csvCell('Aarav')).toBe('Aarav');
      expect(csvCell(1500)).toBe('1500');
   });

   it('shows paid as money received and status as the stamp word', () => {
      const partial = buildInvoiceCsv(
         stateWith({
            families: [FAMILY],
            students: [STUDENT],
            invoices: [invoice()],
            payments: [payment(500)],
         }),
         TODAY,
      );
      expect(partial).toContain('Kulkarni family,Aarav,2025-06,1500,500,PART-PAID\r\n');

      const paid = buildInvoiceCsv(
         stateWith({
            families: [FAMILY],
            students: [STUDENT],
            invoices: [invoice()],
            payments: [payment(1500)],
         }),
         TODAY,
      );
      expect(paid).toContain('Kulkarni family,Aarav,2025-06,1500,1500,PAID\r\n');
   });

   it('marks an unpaid invoice past its due date as OVERDUE', () => {
      const csv = buildInvoiceCsv(
         stateWith({
            families: [FAMILY],
            students: [STUDENT],
            invoices: [invoice({ dueDate: '2025-06-01' })],
         }),
         TODAY,
      );
      expect(csv).toContain('Kulkarni family,Aarav,2025-06,1500,0,OVERDUE\r\n');
   });
});
