// Purpose: Today alerts for bills cash will not cover, nearest first; each names its action and links to the first family's Chase.
import Link from 'next/link';
import {
   CHASE_LABEL,
   FOCUS_RING_CLASS,
   OWED_FAMILY_QUERY,
   OWED_HREF,
   TODAY_COPY,
} from '../../lib/constants';
import type { Alert } from '../../lib/domain/alerts';
import { EmptyNote } from '../khata/EmptyNote';

export interface TodayAlertsProps {
   alerts: Alert[];
}

/** Why: the link opens the Owed board with the first family's Chase sheet, so the alert is one tap from the action. */
function chaseHrefFor(familyId: string | null): string {
   if (familyId === null) return OWED_HREF;
   return `${OWED_HREF}?${OWED_FAMILY_QUERY}=${encodeURIComponent(familyId)}`;
}

/** Why: the button names the family it opens, so the tutor knows whose Chase sheet is next. */
function chaseLabelFor(familyName: string | null): string {
   return familyName === null ? TODAY_COPY.alertAction : `${CHASE_LABEL} ${familyName}`;
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
                        href={chaseHrefFor(alert.chaseFamilyId)}
                        className={`mt-3 inline-flex min-h-11 min-w-11 items-center justify-center border-2 border-ink bg-ink px-4 font-body font-bold text-chalk ${FOCUS_RING_CLASS}`}
                     >
                        {chaseLabelFor(alert.chaseFamilyName)}
                     </Link>
                  </li>
               ))}
            </ul>
         )}
      </section>
   );
}

