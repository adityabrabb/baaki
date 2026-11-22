'use client';
// Purpose: the Today chase queue: the top families as ChaseCards; Chase opens the reminder sheet, which logs the send.
import { useState } from 'react';
import type { ChaseItem } from '../../lib/domain/chasePriority';
import { ChaseCard } from '../khata/ChaseCard';
import { ChaseSheet } from '../owed/ChaseSheet';

export interface TodayChaseQueueProps {
   items: ChaseItem[];
}

/** Why: the same chase sheet as the Owed board, so a reminder sent here is logged there too. */
export function TodayChaseQueue({ items }: TodayChaseQueueProps) {
   const [chasing, setChasing] = useState<ChaseItem | null>(null);

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
               item={chasing}
               onClose={() => setChasing(null)}
            />
         )}
      </>
   );
}
