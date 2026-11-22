// Purpose: every fee still expected: open invoices plus fees projected for future months (PRD §6).
// Pure: callers pass `today`; nothing here reads the clock or storage.
import {
   FEE_DUE_DAY,
   FORECAST_HORIZON_DAYS,
   ID_STEP,
   NEXT_MONTH_OFFSET,
   RISKY_BADGE,
} from '../constants';
import { addDays, addMonths, dateInMonth, monthKeyOf } from '../dates';
import type { RiskBadge, StoreState } from '../types';
import { outstandingOf } from './chasePriority';
import { reliability, type Reliability } from './reliability';

/** One fee that may still arrive: an open invoice, or a projected fee for a future month. */
export interface PendingFee {
   studentId: string;
   familyId: string;
   amount: number;
   dueDate: string;
   avgDelayDays: number;
   badge: RiskBadge;
   projected: boolean;
}

/** Why: reliability is computed once per family, not once per fee. */
function memoReliability(
   state: StoreState,
   today: string,
): (familyId: string) => Reliability {
   const cache = new Map<string, Reliability>();
   return (familyId) => {
      const cached = cache.get(familyId);
      if (cached !== undefined) return cached;
      const fresh = reliability(state, familyId, today);
      cache.set(familyId, fresh);
      return fresh;
   };
}

/** Why: open invoices are fees already raised; overdue ones are kept so forecast can count them when paid. */
function openFees(
   state: StoreState,
   historyOf: (familyId: string) => Reliability,
): PendingFee[] {
   const fees: PendingFee[] = [];
   for (const invoice of state.invoices) {
      const amount = outstandingOf(invoice, state.payments);
      if (amount === 0) continue;
      const history = historyOf(invoice.familyId);
      fees.push({
         studentId: invoice.studentId,
         familyId: invoice.familyId,
         amount,
         dueDate: invoice.dueDate,
         avgDelayDays: history.avgDelayDays,
         badge: history.badge,
         projected: false,
      });
   }
   return fees;
}

/** Why: the months after the current one that fall inside the forecast horizon. */
function futureMonthKeys(today: string): string[] {
   const lastMonth = monthKeyOf(addDays(today, FORECAST_HORIZON_DAYS - 1));
   const keys: string[] = [];
   let offset = NEXT_MONTH_OFFSET;
   let key = monthKeyOf(addMonths(today, offset));
   while (key <= lastMonth) {
      keys.push(key);
      offset += ID_STEP;
      key = monthKeyOf(addMonths(today, offset));
   }
   return keys;
}

/**
 * Why: an active student's fee for a future month is expected on the fee day,
 * unless that month is already invoiced. Risky families never produce projections.
 */
function projectedFees(
   state: StoreState,
   today: string,
   historyOf: (familyId: string) => Reliability,
): PendingFee[] {
   const fees: PendingFee[] = [];
   const months = futureMonthKeys(today);
   for (const student of state.students) {
      if (!student.active) continue;
      const history = historyOf(student.familyId);
      if (history.badge === RISKY_BADGE) continue;
      for (const month of months) {
         const invoiced = state.invoices.some(
            (invoice) =>
               invoice.studentId === student.id && invoice.month === month,
         );
         if (invoiced) continue;
         fees.push({
            studentId: student.id,
            familyId: student.familyId,
            amount: student.feeAmount,
            dueDate: dateInMonth(month, FEE_DUE_DAY),
            avgDelayDays: history.avgDelayDays,
            badge: history.badge,
            projected: true,
         });
      }
   }
   return fees;
}

/**
 * Why: forecast and what-if read the same list, so a scenario can only move
 * money that the forecast already counts.
 */
export function pendingFees(state: StoreState, today: string): PendingFee[] {
   const historyOf = memoReliability(state, today);
   return [
      ...openFees(state, historyOf),
      ...projectedFees(state, today, historyOf),
   ];
}
