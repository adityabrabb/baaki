// Purpose: four what-if scenarios laid over the expected forecast (PRD §6).
// Pure: never mutates state; each scenario is a delta on forecast().days expected.
import {
   FORECAST_HORIZON_DAYS,
   WHATIF_FEE_RISE_PERCENT,
   WHATIF_LABELS,
   WHATIF_LATE_DAYS,
   WHATIF_LOST_STUDENT_COUNT,
   WHATIF_SCENARIOS,
   WHATIF_TOP_FAMILY_COUNT,
} from '../constants';
import { isAfterDate } from '../dates';
import type { StoreState } from '../types';
import { forecast, type ForecastDay } from './forecast';
import { type PendingFee, pendingFees } from './pendingFees';
import { lateFlows, lostFlows, raiseFlows } from './whatIfFlows';

export type WhatIfId = (typeof WHATIF_SCENARIOS)[number];

/** Optional slider values; omitted fields use the PRD defaults, so existing calls are unchanged. */
export interface WhatIfOptions {
   familyId?: string;
   lateDays?: number;
   lostCount?: number;
   feeRisePercent?: number;
}

/** One day of the adjusted expected balance. */
export interface WhatIfPoint {
   date: string;
   balance: number;
}

/** A scenario's effect on the expected forecast; the data is never changed. */
export interface WhatIfScenario {
   id: WhatIfId;
   label: string;
   affectedCount: number;
   days: WhatIfPoint[];
   endBalance: number;
   endDelta: number;
   lowestBalance: number;
   dipsBelowBuffer: boolean;
}

/**
 * Why: only fees still expected can move. Overdue fees are not in the expected
 * forecast, so a what-if never touches them.
 */
function expectedFees(state: StoreState, today: string): PendingFee[] {
   return pendingFees(state, today).filter(
      (fee) => !isAfterDate(today, fee.dueDate),
   );
}

/** Why: families are ranked by their upcoming expected fees, the basis for "top 5". */
function familiesByUpcomingFees(fees: PendingFee[]): string[] {
   const totals = new Map<string, number>();
   for (const fee of fees) {
      totals.set(fee.familyId, (totals.get(fee.familyId) ?? 0) + fee.amount);
   }
   return [...totals.entries()]
      .sort(([idA, a], [idB, b]) => b - a || idA.localeCompare(idB))
      .map(([id]) => id);
}

/**
 * Why: turns one set of net flows into balances and the effect the UI shows:
 * the end balance, the change it causes, and whether cash dips under buffer.
 */
function buildScenario(
   id: WhatIfId,
   base: ForecastDay[],
   flows: number[],
   buffer: number,
   affectedCount: number,
): WhatIfScenario {
   let running = 0;
   const days = base.map((day, i) => {
      running += flows[i];
      return { date: day.date, balance: day.expected + running };
   });
   const lowestBalance = Math.min(...days.map((day) => day.balance));
   return {
      id,
      label: WHATIF_LABELS[id],
      affectedCount,
      days,
      endBalance: days[days.length - 1]?.balance ?? 0,
      endDelta: running,
      lowestBalance,
      dipsBelowBuffer: lowestBalance < buffer,
   };
}

/**
 * Why: the four PRD scenarios, all defaulted from the data: the family with the
 * most upcoming fees, the top five by upcoming fees, the two highest-fee leavers,
 * and a fee rise on every projected fee.
 */
export function whatIf(
   state: StoreState,
   today: string,
   options: WhatIfOptions = {},
): WhatIfScenario[] {
   const base = forecast(state, today).days;
   const buffer = state.business.buffer;
   const fees = expectedFees(state, today);
   const ranked = familiesByUpcomingFees(fees);
   const chosen =
      options.familyId === undefined
         ? ranked.slice(0, 1)
         : ranked.filter((id) => id === options.familyId);
   const top = ranked.slice(0, WHATIF_TOP_FAMILY_COUNT);
   const lost = lostFlows(
      fees,
      today,
      options.lostCount ?? WHATIF_LOST_STUDENT_COUNT,
      FORECAST_HORIZON_DAYS,
   );
   const raised = raiseFlows(
      fees,
      today,
      options.feeRisePercent ?? WHATIF_FEE_RISE_PERCENT,
      FORECAST_HORIZON_DAYS,
   );

   return [
      buildScenario(
         'family_late',
         base,
         lateFlows(
            fees,
            today,
            chosen,
            options.lateDays ?? WHATIF_LATE_DAYS,
            FORECAST_HORIZON_DAYS,
         ),
         buffer,
         chosen.length,
      ),
      buildScenario(
         'top_families_late',
         base,
         lateFlows(fees, today, top, WHATIF_LATE_DAYS, FORECAST_HORIZON_DAYS),
         buffer,
         top.length,
      ),
      buildScenario('lose_students', base, lost.flows, buffer, lost.count),
      buildScenario('raise_fees', base, raised.flows, buffer, raised.count),
   ];
}
