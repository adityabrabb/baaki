'use client';
// Purpose: client view for /invoice/[id]: status and balance, timeline, and record-payment form; every write goes through the store.
import { useState } from 'react';
import {
   INVOICE_COPY,
   STORE_ERROR_COPY,
} from '../../lib/constants';
import { outstandingOf } from '../../lib/domain/chasePriority';
import { invoiceTimeline } from '../../lib/domain/invoiceTimeline';
import { invoiceStatus, recordPayment } from '../../lib/domain/recordPayment';
import { commitState } from '../../lib/store/clientStore';
import { useStore } from '../../lib/store/useStore';
import { EmptyNote } from '../khata/EmptyNote';
import { InvoiceSummary } from './InvoiceSummary';
import { InvoiceTimeline } from './InvoiceTimeline';
import { RecordPaymentForm } from './RecordPaymentForm';

/** Why: an unknown id is a friendly empty state, never a crash; a write failure says so in the note. */
export function InvoiceView({ invoiceId }: { invoiceId: string }) {
   const { state, today } = useStore();
   const [notice, setNotice] = useState<string | null>(null);

   if (!state || !today) {
      return <EmptyNote text={STORE_ERROR_COPY} role="alert" />;
   }

   const invoice = state.invoices.find((item) => item.id === invoiceId);
   if (!invoice) {
      return <EmptyNote text={INVOICE_COPY.notFound} role="alert" />;
   }

   const balance = outstandingOf(invoice, state.payments);
   const status = invoiceStatus(invoice, state.payments, today);
   const studentName =
      state.students.find((s) => s.id === invoice.studentId)?.name ?? '';
   const familyName =
      state.families.find((f) => f.id === invoice.familyId)?.name ?? '';

   const handleRecord = (input: unknown): string | null => {
      const result = recordPayment(state, invoice.id, input, today);
      if (!result.ok) return result.error;
      const saved = commitState(result.state);
      setNotice(saved ? INVOICE_COPY.savedNote : INVOICE_COPY.saveError);
      return null;
   };

   return (
      <div className="mt-6 flex flex-col gap-8">
         <InvoiceSummary
            invoice={invoice}
            studentName={studentName}
            familyName={familyName}
            balance={balance}
            status={status}
         />
         {notice && <EmptyNote text={notice} role="status" />}
         {balance > 0 ? (
            <RecordPaymentForm
               balance={balance}
               today={today}
               onRecord={handleRecord}
            />
         ) : (
            <EmptyNote text={INVOICE_COPY.paidNote} />
         )}
         <section className="flex flex-col gap-3">
            <h2 className="font-display text-2xl text-ink uppercase">
               {INVOICE_COPY.timelineTitle}
            </h2>
            <InvoiceTimeline
               events={invoiceTimeline(state, invoice)}
            />
         </section>
      </div>
   );
}
