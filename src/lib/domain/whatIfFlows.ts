// Purpose: net cash flows for each what-if scenario, moving only fees the forecast already counts (PRD §6).
// Pure: takes pending fees and `today`; never mutates state, cash on hand or payments.
import { PERCENT_SCALE } from '../constants';
import { diffDays } from '../dates';
import { expectedPayDate } from './expectedPayDate';
import type { PendingFee } from './pendingFees';

/** A scenario's net flow per horizon day, and how many families or students it touches. */
export interface ScenarioFlow {
   flows: number[];
   count: number;
}

/** Why: a flow array holds one net amount per horizon day, zero by default. */
function zeros(horizonDays: number): number[] {
   return new Array<number>(horizonDays).fill(0);
}

/** Why: adds to a horizon day only; dates outside the window are ignored. */
function addAt(flow: number[], offset: number, amount: number): void {
   if (offset >= 0 && offset < flow.length) flow[offset] += amount;
}

/** Why: a fee lands on its expected pay date, `extraDays` later; the result is days after today. */
function landingDay(fee: PendingFee, today: string, extraDays: number): number {
   const date = expectedPayDate(fee.dueDate, fee.avgDelayDays + extraDays);
   return diffDays(date, today);
}

/**
 * Why: a late family moves each expected fee by extra days: the old landing
 * day loses the amount, the later day gains it. Money due today is already on
 * day 0 in every scenario, so it is left alone.
 */
export function lateFlows(
   fees: PendingFee[],
   today: string,
   familyIds: string[],
   extraDays: number,
   horizonDays: number,
): number[] {
   const flows = zeros(horizonDays);
   const targets = new Set(familyIds);
   for (const fee of fees) {
      if (!targets.has(fee.familyId)) continue;
      const now = landingDay(fee, today, 0);
      if (now <= 0) continue;
      addAt(flows, now, -fee.amount);
      addAt(flows, landingDay(fee, today, extraDays), fee.amount);
   }
   return flows;
}

/**
 * Why: the students with the highest projected fees leave first (worst case);
 * only students with a projected fee can leave, since Risky ones have none.
 */
function leaverIds(fees: PendingFee[], count: number): string[] {
   return fees
      .filter((fee) => fee.projected)
      .sort((a, b) => b.amount - a.amount || a.studentId.localeCompare(b.studentId))
      .map((fee) => fee.studentId)
      .filter((id, i, all) => all.indexOf(id) === i)
      .slice(0, count);
}

/** Why: leavers' projected fees stop arriving from next month onward. */
export function lostFlows(
   fees: PendingFee[],
   today: string,
   lostCount: number,
   horizonDays: number,
): ScenarioFlow {
   const leavers = leaverIds(fees, lostCount);
   const flows = zeros(horizonDays);
   for (const fee of fees) {
      if (!fee.projected || !leavers.includes(fee.studentId)) continue;
      addAt(flows, landingDay(fee, today, 0), -fee.amount);
   }
   return { flows, count: leavers.length };
}

/** Why: a fee rise is rounded per projected fee to whole rupees, from next month. */
export function raiseFlows(
   fees: PendingFee[],
   today: string,
   feeRisePercent: number,
   horizonDays: number,
): ScenarioFlow {
   const projected = fees.filter((fee) => fee.projected);
   const flows = zeros(horizonDays);
   for (const fee of projected) {
      const rise = Math.round((fee.amount * feeRisePercent) / PERCENT_SCALE);
      addAt(flows, landingDay(fee, today, 0), rise);
   }
   const count = new Set(projected.map((fee) => fee.studentId)).size;
   return { flows, count };
}
