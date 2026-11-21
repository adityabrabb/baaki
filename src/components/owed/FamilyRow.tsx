// Purpose: one overdue family on /owed: name, amount owed, days late, reliability, and the Chase button.
import {
   CHASE_LABEL,
   DAYS_LATE_LABEL,
   FOCUS_RING_CLASS,
   OWED_FAMILY_ROW_PREFIX,
   OWED_HIGHLIGHT_CLASS,
   RELIABILITY_LABELS,
   ROW_SEPARATOR,
} from '../../lib/constants';
import type { ChaseItem } from '../../lib/domain/chasePriority';
import { formatINR } from '../../lib/domain/formatINR';
import { Stamp } from '../khata/Stamp';

export interface FamilyRowProps {
   item: ChaseItem;
   highlighted: boolean;
   onChase: (item: ChaseItem) => void;
}

/** Why: one row is one family's whole overdue position, so the tutor chases a family at a time. */
export function FamilyRow({ item, highlighted, onChase }: FamilyRowProps) {
   const highlight = highlighted ? ` ${OWED_HIGHLIGHT_CLASS}` : '';
   return (
      <article
         id={`${OWED_FAMILY_ROW_PREFIX}-${item.familyId}`}
         className={`min-w-0 border-2 border-ink bg-chalk p-4 shadow-[4px_4px_0_var(--ink)]${highlight}`}
      >
         <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="min-w-0 font-hand text-2xl font-bold break-words text-ink">
               {item.familyName}
            </h3>
            <Stamp variant="overdue" />
         </div>
         <p className="mt-2 font-display text-3xl leading-none text-ink">
            {formatINR(item.owed)}
         </p>
         <p className="font-body text-sm text-ink-soft">
            {item.daysLate} {DAYS_LATE_LABEL}
            {ROW_SEPARATOR}
            {RELIABILITY_LABELS[item.badge]}
         </p>
         <button
            type="button"
            onClick={() => onChase(item)}
            aria-label={`${CHASE_LABEL} ${item.familyName}`}
            className={`mt-3 min-h-11 min-w-11 border-2 border-ink bg-ink px-4 font-body font-semibold text-chalk shadow-[4px_4px_0_var(--ink)] ${FOCUS_RING_CLASS}`}
         >
            {CHASE_LABEL}
         </button>
      </article>
   );
}
