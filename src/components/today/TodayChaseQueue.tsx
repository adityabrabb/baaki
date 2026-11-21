'use client';
// Purpose: the Today chase queue: the top families as ChaseCards; Chase opens the copy-only reminder sheet and logs it.
import { useState } from 'react';
import type { ChaseItem } from '../../lib/domain/chasePriority';
import { logChaseReminders } from '../../lib/domain/reminderLog';
import { reminderText } from '../../lib/domain/reminderText';
import { commitState } from '../../lib/store/clientStore';
import type { StoreState } from '../../lib/types';
import { ChaseCard } from '../khata/ChaseCard';
import { ChaseSheet } from '../owed/ChaseSheet';

export interface TodayChaseQueueProps {
   state: StoreState;
   today: string;
   items: ChaseItem[];
}

/** Why: the same chase rule as the Owed board, so a reminder copied here is logged there too. */
export function TodayChaseQueue({ state, today, items }: TodayChaseQueueProps) {
   const [chasing, setChasing] = useState<ChaseItem | null>(null);

   /** Why: copying the reminder is what counts as a chase, so it is logged here. */
   const handleCopied = () => {
      if (!chasing) return;
      commitState(logChaseReminders(state, chasing.invoiceIds, today));
   };

   return (
      <>
         <ul className="flex flex-col gap-4">
            {items.map((item) => (
               <li key={item.familyId}>
                  <ChaseCard
                     familyName={item.familyName}
                     amount={item.owed}
                     daysLate={item.daysLate}
                     reliability={item.badge}
                     onChase={() => setChasing(item)}
                  />
               </li>
            ))}
         </ul>
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
      </>
   );
}

