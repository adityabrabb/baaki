'use client';
// Purpose: client view for /owed: total owed, ageing buckets, and overdue families ranked for chasing; ?family= opens that family's Chase sheet.
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
   OWED_COPY,
   OWED_FAMILY_QUERY,
   PAGE_COPY,
   STORE_ERROR_COPY,
} from '../../lib/constants';
import { ageingBuckets, totalOwed } from '../../lib/domain/ageing';
import { chasePriority } from '../../lib/domain/chasePriority';
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
   const highlightId = searchParams.get(OWED_FAMILY_QUERY);
   const [chasingId, setChasingId] = useState<string | null>(highlightId);

   if (!state || !today) {
      return <EmptyNote text={STORE_ERROR_COPY} role="alert" />;
   }

   const owed = totalOwed(state);
   if (owed === 0) {
      return <EmptyNote text={PAGE_COPY.owed.empty} />;
   }

   const buckets = ageingBuckets(state, today);
   const items = chasePriority(state, today);
   const chasing = items.find((item) => item.familyId === chasingId) ?? null;

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
                           onChase={(picked) => setChasingId(picked.familyId)}
                        />
                     </li>
                  ))}
               </ul>
            )}
         </section>
         {chasing && (
            <ChaseSheet
               key={chasing.familyId}
               item={chasing}
               onClose={() => setChasingId(null)}
            />
         )}
      </div>
   );
}
