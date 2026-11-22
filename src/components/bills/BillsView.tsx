'use client';
// Purpose: client view for /bills: the active recurring bills, read-only, each with its next due date.
import { BILLS_COPY, PAGE_COPY } from '../../lib/constants';
import { dayLabel } from '../../lib/dates';
import { formatINR } from '../../lib/domain/formatINR';
import { dueDateOnOrAfter } from '../../lib/domain/nextBill';
import { useStore } from '../../lib/store/useStore';
import { EmptyNote } from '../khata/EmptyNote';

/** Why: bills are read-only here; the due date comes from the same rule Today uses. */
export function BillsView() {
   const { state, today } = useStore();

   if (!state || !today) {
      return <EmptyNote text={BILLS_COPY.errorCopy} role="alert" />;
   }
   const active = state.bills.filter((bill) => bill.active);
   if (active.length === 0) {
      return <EmptyNote text={PAGE_COPY.bills.empty} />;
   }

   return (
      <section className="mt-6 flex flex-col gap-4">
         <h2 className="font-display text-2xl text-ink uppercase">
            {BILLS_COPY.title}
         </h2>
         <p className="font-body text-sm text-ink-soft">{BILLS_COPY.note}</p>
         <ul className="flex flex-col gap-4">
            {active.map((bill) => (
               <li
                  key={bill.id}
                  className="flex flex-col gap-2 border-2 border-ink bg-chalk p-4 shadow-[4px_4px_0_var(--ink)]"
               >
                  <h3 className="font-hand text-2xl text-ink">{bill.name}</h3>
                  <p className="font-display text-4xl text-ink">
                     {formatINR(bill.amount)}
                     <span className="font-body text-base">
                        {BILLS_COPY.monthlyLabel}
                     </span>
                  </p>
                  <p className="font-body text-base text-ink">
                     <span className="font-bold">{BILLS_COPY.dueLabel}: </span>
                     {dayLabel(dueDateOnOrAfter(bill.dayOfMonth, today), today)}
                  </p>
               </li>
            ))}
         </ul>
      </section>
   );
}
