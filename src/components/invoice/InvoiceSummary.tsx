// Purpose: invoice header: student and family in handwriting, the status stamp, the balance still due, and the Chase link.
import Link from 'next/link';
import {
   CHASE_LABEL,
   FOCUS_RING_CLASS,
   INVOICE_COPY,
   OWED_FAMILY_QUERY,
   OWED_HREF,
} from '../../lib/constants';
import { formatINR } from '../../lib/domain/formatINR';
import type { InvoiceStatus } from '../../lib/domain/recordPayment';
import type { Invoice } from '../../lib/types';
import { Stamp } from '../khata/Stamp';

export interface InvoiceSummaryProps {
   invoice: Invoice;
   studentName: string;
   familyName: string;
   balance: number;
   status: InvoiceStatus;
}

/** Why: the Chase link opens the Owed board filtered to this family; the sheet lives there. */
export function InvoiceSummary({
   invoice,
   studentName,
   familyName,
   balance,
   status,
}: InvoiceSummaryProps) {
   return (
      <section className="flex flex-col gap-4">
         <div className="flex flex-wrap items-center gap-3">
            <Stamp variant={status} />
            <span className="font-body text-sm text-ink-soft">
               {INVOICE_COPY.monthLabel}: {invoice.month}
            </span>
         </div>
         <div className="flex flex-col gap-1">
            <p className="font-hand text-2xl text-ink">{studentName}</p>
            <p className="font-body text-base text-ink-soft">
               {INVOICE_COPY.familyLabel}: {familyName}
            </p>
            <p className="font-body text-base text-ink-soft">
               {INVOICE_COPY.dueLabel}: {invoice.dueDate}
            </p>
         </div>
         <p className="font-display text-5xl leading-none text-ink underline decoration-marigold decoration-4 underline-offset-4">
            {formatINR(balance)}
         </p>
         <p className="font-body text-sm text-ink-soft">
            {INVOICE_COPY.stillDue} of {formatINR(invoice.amount)}
         </p>
         {balance > 0 && (
            <Link
               href={`${OWED_HREF}?${OWED_FAMILY_QUERY}=${invoice.familyId}`}
               className={`inline-flex min-h-11 min-w-11 items-center justify-center border-2 border-ink bg-ink px-4 font-body text-base font-bold text-chalk shadow-[4px_4px_0_var(--color-ink)] ${FOCUS_RING_CLASS}`}
            >
               {CHASE_LABEL}
            </Link>
         )}
      </section>
   );
}
