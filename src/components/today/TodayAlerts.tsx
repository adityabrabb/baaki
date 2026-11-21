// Purpose: Today alerts for bills cash will not cover, nearest first; each names its action and links to the Owed board.
import Link from 'next/link';
import { FOCUS_RING_CLASS, OWED_HREF, TODAY_COPY } from '../../lib/constants';
import type { Alert } from '../../lib/domain/alerts';
import { EmptyNote } from '../khata/EmptyNote';

export interface TodayAlertsProps {
   alerts: Alert[];
}

/** Why: every alert carries a working link, so no alert is a dead end. */
export function TodayAlerts({ alerts }: TodayAlertsProps) {
   return (
      <section className="flex flex-col gap-3">
         <h2 className="font-display text-2xl text-ink uppercase">
            {TODAY_COPY.alertsTitle}
         </h2>
         {alerts.length === 0 ? (
            <EmptyNote text={TODAY_COPY.alertsEmpty} />
         ) : (
            <ul className="flex flex-col gap-3">
               {alerts.map((alert) => (
                  <li
                     key={alert.id}
                     className="min-w-0 border-2 border-margin-red bg-chalk p-4"
                  >
                     <p className="font-body text-base break-words text-ink">
                        {alert.text}
                     </p>
                     <Link
                        href={OWED_HREF}
                        className={`mt-3 inline-flex min-h-11 min-w-11 items-center justify-center border-2 border-ink bg-ink px-4 font-body font-bold text-chalk ${FOCUS_RING_CLASS}`}
                     >
                        {TODAY_COPY.alertAction}
                     </Link>
                  </li>
               ))}
            </ul>
         )}
      </section>
   );
}

