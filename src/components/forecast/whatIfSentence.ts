// Purpose: the one sentence under the chart that compares a what-if with the normal forecast.
// Names the bill whose due-day balance drops most; status words come from billStatusOf() and BILL_STATUS_WORDS.
import {
   BILL_STATUS_WORDS,
   WHATIF_BILL_COPY,
   WHATIF_COMPARE_COPY,
} from '../../lib/constants';
import { dayLabel } from '../../lib/dates';
import type { BillOccurrence } from '../../lib/domain/forecast';
import { formatINR } from '../../lib/domain/formatINR';
import { billStatusOf } from '../../lib/domain/nextBill';
import type { WhatIfPoint } from '../../lib/domain/whatIf';

/** The bill that drops most on its due day, with both balances. */
interface BillDrop {
   bill: BillOccurrence;
   normal: number;
   scenario: number;
}

/** Why: the lowest point is the fallback balance the tutor must plan around. */
function lowestOf(points: WhatIfPoint[]): number {
   if (points.length === 0) return 0;
   return Math.min(...points.map((point) => point.balance));
}

/** Why: a bill is judged on its own due day, where the forecast decides its stamp. */
function balanceOn(points: WhatIfPoint[], date: string): number | undefined {
   return points.find((point) => point.date === date)?.balance;
}

/** Why: the biggest drop shows which bill the what-if hurts most; bills outside the window are skipped. */
function biggestDrop(
   bills: BillOccurrence[],
   normal: WhatIfPoint[],
   scenario: WhatIfPoint[],
): BillDrop | null {
   let worst: BillDrop | null = null;
   for (const bill of bills) {
      const before = balanceOn(normal, bill.date);
      const after = balanceOn(scenario, bill.date);
      if (before === undefined || after === undefined) continue;
      const drop = before - after;
      if (drop <= 0) continue;
      if (worst === null || drop > worst.normal - worst.scenario) {
         worst = { bill, normal: before, scenario: after };
      }
   }
   return worst;
}

/** Why: states the scenario and normal balance on the bill day, and adds the new status word when it changes. */
function billSentence(drop: BillDrop, buffer: number, today: string): string {
   const { bill, normal, scenario } = drop;
   const less = normal - scenario;
   const head = `${bill.name} ${WHATIF_BILL_COPY.on} ${dayLabel(bill.date, today)}: ${formatINR(scenario)} ${WHATIF_BILL_COPY.instead} ${formatINR(normal)} (${formatINR(less)} ${WHATIF_BILL_COPY.less})`;
   const fromStatus = billStatusOf(normal, buffer);
   const toStatus = billStatusOf(scenario, buffer);
   if (fromStatus === toStatus) return head;
   return `${head}; ${WHATIF_BILL_COPY.now} ${BILL_STATUS_WORDS[toStatus]}`;
}

/**
 * Why: the scenario sentence compares each bill day; with no bill dropping it
 * keeps the lowest-balance wording, so the sentence never goes blank.
 */
export function comparisonSentence(
   label: string,
   normal: WhatIfPoint[],
   scenario: WhatIfPoint[],
   buffer: number,
   bills: BillOccurrence[],
   today: string,
): string {
   const drop = biggestDrop(bills, normal, scenario);
   if (drop) return billSentence(drop, buffer, today);
   const before = lowestOf(normal);
   const after = lowestOf(scenario);
   if (before === after) return `${label}: ${WHATIF_COMPARE_COPY.same}`;
   const from = BILL_STATUS_WORDS[billStatusOf(before, buffer)];
   const to = BILL_STATUS_WORDS[billStatusOf(after, buffer)];
   return `${label}: ${WHATIF_COMPARE_COPY.lead} ${formatINR(before)} (${from}) ${WHATIF_COMPARE_COPY.middle} ${formatINR(after)} (${to}).`;
}
