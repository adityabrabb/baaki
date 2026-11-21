'use client';
// Purpose: client view for /owed: total owed, ageing buckets, and overdue families ranked for chasing.
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
   OWED_COPY,
   OWED_FAMILY_QUERY,
   PAGE_COPY,
   STORE_ERROR_COPY,
} from '../../lib/constants';
import { ageingBuckets, totalOwed } from '../../lib/domain/ageing';
import { chasePriority, type ChaseItem } from '../../lib/domain/chasePriority';
import { logChaseReminders } from '../../lib/domain/reminderLog';
import { reminderText } from '../../lib/domain/reminderText';
import { commitState } from '../../lib/store/clientStore';
import { useStore } from '../../lib/store/useStore';
import { BigRupee } from '../khata/BigRupee';
import { EmptyNote } from '../khata/EmptyNote';
import { AgeingPanel } from './AgeingPanel';
import { ChaseSheet } from './ChaseSheet';
import { FamilyRow } from './FamilyRow';

/** Why: one board reads the store only, so the totals always agree with the invoices. */
export function OwedView() {
   const { state, today } = useStore();
   const searchParams = useSearchParams();
   const [chasing, setChasing] = useState<ChaseItem | null>(null);

   if (!state || !today) {
      return <EmptyNote text={STORE_ERROR_COPY} role="alert" />;
   }

   const owed = totalOwed(state);
   if (owed === 0) {
      return <EmptyNote text={PAGE_COPY.owed.empty} />;
   }

   const buckets = ageingBuckets(state, today);
   const items = chasePriority(state, today);
   const highlightId = searchParams.get(OWED_FAMILY_QUERY);

   /** Why: copying the reminder is what counts as a chase, so it is logged here. */
   const handleCopied = () => {
      if (!chasing) return;
      commitState(logChaseReminders(state, chasing.invoiceIds, today));
   };

   return (
      <div className="mt-6 flex flex-col gap-6">
         <BigRupee amount={owed} label={OWED_COPY.totalLabel} />
         <AgeingPanel buckets={buckets} />
         <section className="flex flex-col gap-3">
            <h2 className="font-display text-2xl text-ink uppercase">
               {OWED_COPY.rowsTitle}
            </h2>
            {items.length === 0 ? (
               <EmptyNote text={OWED_COPY.noOverdue} />
            ) : (
               <ul className="flex flex-col gap-4">
                  {items.map((item) => (
                     <li key={item.familyId}>
                        <FamilyRow
                           item={item}
                           highlighted={item.familyId === highlightId}
                           onChase={setChasing}
                        />
                     </li>
                  ))}
               </ul>
            )}
         </section>
         {chasing && (
            <ChaseSheet
               key={chasing.familyId}
               familyName={chasing.familyName}
               text={reminderText({
                  familyName: chasing.familyName,
                  amount: chasing.owed,
                  daysLate: chasing.daysLate,
                  businessName: state.business.name,
               })}
               onClose={() => setChasing(null)}
               onCopied={handleCopied}
            />
         )}
      </div>
   );
}
