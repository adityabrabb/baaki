// Purpose: four what-if scenarios laid over the expected forecast (PRD §6).
// Pure: never mutates state; each scenario is a delta on forecast().days expected.
import {
   FEE_DUE_DAY,
   FORECAST_HORIZON_DAYS,
   NEXT_MONTH_OFFSET,
   PERCENT_SCALE,
   WHATIF_FEE_RISE_PERCENT,
   WHATIF_LABELS,
   WHATIF_LATE_DAYS,
   WHATIF_LOST_STUDENT_COUNT,
   WHATIF_SCENARIOS,
   WHATIF_TOP_FAMILY_COUNT,
} from '../constants';
import {
   addMonths,
   dateInMonth,
   diffDays,
   isAfterDate,
   monthKeyOf,
} from '../dates';
import type { StoreState, Student } from '../types';
import { outstandingOf } from './chasePriority';
import { expectedPayDate } from './expectedPayDate';
import { forecast, type ForecastDay } from './forecast';
import { reliability } from './reliability';

export type WhatIfId = (typeof WHATIF_SCENARIOS)[number];

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

/** Why: a flow array holds one net amount per horizon day, zero by default. */
function zeros(): number[] {
   return new Array<number>(FORECAST_HORIZON_DAYS).fill(0);
}

/** Why: adds to a horizon day only; dates outside the window are ignored. */
function addAt(flow: number[], offset: number, amount: number): void {
   if (offset >= 0 && offset < flow.length) flow[offset] += amount;
}

/** Why: forecast never books money in the past, so offsets clamp to today. */
function offsetFrom(date: string, today: string): number {
   return diffDays(isAfterDate(today, date) ? today : date, today);
}

/** Why: families are ranked by open money, the basis for "top 5 by amount". */
function familiesByOpenBalance(state: StoreState): string[] {
   const totals = new Map<string, number>();
   for (const invoice of state.invoices) {
      const owed = outstandingOf(invoice, state.payments);
      if (owed === 0) continue;
      totals.set(invoice.familyId, (totals.get(invoice.familyId) ?? 0) + owed);
   }
   return [...totals.entries()]
      .sort(([idA, a], [idB, b]) => b - a || idA.localeCompare(idB))
      .map(([id]) => id);
}

/** Why: students leaving or re-priced are the highest fees first (worst case). */
function activeByFeeDesc(state: StoreState): Student[] {
   return state.students
      .filter((student) => student.active)
      .sort((a, b) => b.feeAmount - a.feeAmount || a.id.localeCompare(b.id));
}

/** Why: fee changes and leavers hit from the next month's fee due date. */
function nextFeeOffset(today: string): number {
   const monthKey = monthKeyOf(addMonths(today, NEXT_MONTH_OFFSET));
   return diffDays(dateInMonth(monthKey, FEE_DUE_DAY), today);
}

/**
 * Why: a late family moves each open invoice's expected inflow by extra days:
 * the old expected day loses the owed amount, the later day gains it.
 */
function lateFlows(
   state: StoreState,
   today: string,
   familyIds: string[],
   extraDays: number,
): number[] {
   const flows = zeros();
   const targets = new Set(familyIds);
   for (const invoice of state.invoices) {
      if (!targets.has(invoice.familyId)) continue;
      const owed = outstandingOf(invoice, state.payments);
      if (owed === 0) continue;
      const avg = reliability(state, invoice.familyId, today).avgDelayDays;
      const now = expectedPayDate(invoice.dueDate, avg);
      const later = expectedPayDate(invoice.dueDate, avg + extraDays);
      addAt(flows, offsetFrom(now, today), -owed);
      addAt(flows, offsetFrom(later, today), owed);
   }
   return flows;
}

/** Why: leavers' fees stop being collected from next month's due date. */
function lostFlows(state: StoreState, today: string): {
   flows: number[];
   count: number;
} {
   const leavers = activeByFeeDesc(state).slice(0, WHATIF_LOST_STUDENT_COUNT);
   const lost = leavers.reduce((sum, student) => sum + student.feeAmount, 0);
   const flows = zeros();
   addAt(flows, nextFeeOffset(today), -lost);
   return { flows, count: leavers.length };
}

/** Why: a fee rise is rounded per student to whole rupees, from next month. */
function raiseFlows(state: StoreState, today: string): {
   flows: number[];
   count: number;
} {
   const active = activeByFeeDesc(state);
   const rise = active.reduce(
      (sum, student) =>
         sum +
         Math.round((student.feeAmount * WHATIF_FEE_RISE_PERCENT) / PERCENT_SCALE),
      0,
   );
   const flows = zeros();
   addAt(flows, nextFeeOffset(today), rise);
   return { flows, count: active.length };
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
 * most money open, the top five by open money, the two highest-fee leavers, and
 * a fee rise on every active student.
 */
export function whatIf(state: StoreState, today: string): WhatIfScenario[] {
   const base = forecast(state, today).days;
   const buffer = state.business.buffer;
   const ranked = familiesByOpenBalance(state);
   const chosen = ranked.slice(0, 1);
   const top = ranked.slice(0, WHATIF_TOP_FAMILY_COUNT);
   const lost = lostFlows(state, today);
   const raised = raiseFlows(state, today);

   return [
      buildScenario(
         'family_late',
         base,
         lateFlows(state, today, chosen, WHATIF_LATE_DAYS),
         buffer,
         chosen.length,
      ),
      buildScenario(
         'top_families_late',
         base,
         lateFlows(state, today, top, WHATIF_LATE_DAYS),
         buffer,
         top.length,
      ),
      buildScenario('lose_students', base, lost.flows, buffer, lost.count),
      buildScenario('raise_fees', base, raised.flows, buffer, raised.count),
   ];
}
