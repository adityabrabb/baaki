// Purpose: the one sentence under the chart that compares a what-if with the normal forecast.
// Status words come from the existing billStatusOf() and BILL_STATUS_WORDS, not new logic.
import { BILL_STATUS_WORDS, WHATIF_COMPARE_COPY } from '../../lib/constants';
import { formatINR } from '../../lib/domain/formatINR';
import { billStatusOf } from '../../lib/domain/nextBill';
import type { WhatIfPoint } from '../../lib/domain/whatIf';

/** Why: the lowest point is the balance the tutor must plan around, so only it is compared. */
function lowestOf(points: WhatIfPoint[]): number {
   if (points.length === 0) return 0;
   return Math.min(...points.map((point) => point.balance));
}

/** Why: one sentence states how the lowest balance moves, using the stamp words the app already uses. */
export function comparisonSentence(
   label: string,
   normal: WhatIfPoint[],
   scenario: WhatIfPoint[],
   buffer: number,
): string {
   const before = lowestOf(normal);
   const after = lowestOf(scenario);
   if (before === after) return `${label}: ${WHATIF_COMPARE_COPY.same}`;
   const from = BILL_STATUS_WORDS[billStatusOf(before, buffer)];
   const to = BILL_STATUS_WORDS[billStatusOf(after, buffer)];
   return `${label}: ${WHATIF_COMPARE_COPY.lead} ${formatINR(before)} (${from}) ${WHATIF_COMPARE_COPY.middle} ${formatINR(after)} (${to}).`;
}
