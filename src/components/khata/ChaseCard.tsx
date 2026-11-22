'use client';
// Purpose: one family's overdue line on the chase queue: name, amount, lateness, reliability and Chase.
import {
   CHASE_LABEL,
   DAYS_LATE_LABEL,
   FOCUS_RING_CLASS,
   PRIMARY_BUTTON_CLASS,
   RELIABILITY_LABELS,
} from '../../lib/constants';
import { formatINR } from '../../lib/domain/formatINR';
import type { RiskBadge } from '../../lib/types';

// Why: the badge and left border share one colour per reliability, so the stamp and card agree.
const RELIABILITY_STYLE: Record<RiskBadge, { stamp: string; edge: string }> = {
   reliable: {
      stamp: 'border-stamp-green text-stamp-green',
      edge: 'border-l-stamp-green',
   },
   usually_late: {
      stamp: 'border-ink bg-mustard text-ink',
      edge: 'border-l-mustard',
   },
   risky: {
      stamp: 'border-stamp-red text-stamp-red',
      edge: 'border-l-stamp-red',
   },
};

export interface ChaseCardProps {
   familyName: string;
   amount: number;
   daysLate: number;
   reliability: RiskBadge;
   onChase: () => void;
}

/** Why: the Chase button is the demo's core action, so it is a full 44px tap target. */
export function ChaseCard({
   familyName,
   amount,
   daysLate,
   reliability,
   onChase,
}: ChaseCardProps) {
   return (
      <article
         className={`min-w-0 border-2 border-ink border-l-6 bg-chalk p-4 shadow-[4px_4px_0_var(--ink)] ${RELIABILITY_STYLE[reliability].edge}`}
      >
         <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 font-hand text-2xl font-bold break-words text-ink">
               {familyName}
            </h3>
            <span
               className={`inline-block -rotate-3 border-2 bg-chalk px-2 py-0.5 text-xs font-bold tracking-wider uppercase ${RELIABILITY_STYLE[reliability].stamp}`}
            >
               {RELIABILITY_LABELS[reliability]}
            </span>
         </div>
         <p className="mt-2 font-display text-3xl leading-none text-ink">
            {formatINR(amount)}
         </p>
         <p className="font-body text-sm text-ink-soft">
            {daysLate} {DAYS_LATE_LABEL}
         </p>
         <button
            type="button"
            onClick={onChase}
            aria-label={`${CHASE_LABEL} ${familyName}`}
            className={`mt-3 min-h-11 min-w-11 border-2 border-ink px-4 font-body font-semibold ${PRIMARY_BUTTON_CLASS} ${FOCUS_RING_CLASS}`}
         >
            {CHASE_LABEL}
         </button>
      </article>
   );
}

