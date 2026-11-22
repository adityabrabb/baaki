// Purpose: picks the next recurring bill due on or after today and its stamp status from the expected balance that day (PRD §6).
// Pure: callers pass `today`; nothing here reads the clock or storage.
import { BILL_STATUSES, NEXT_MONTH_OFFSET } from '../constants';
import {
   addMonths,
   dateInMonth,
   dayLabel,
   diffDays,
   isBeforeDate,
   monthKeyOf,
} from '../dates';
import type { StoreState } from '../types';
import { forecast } from './forecast';

export type BillStatus = (typeof BILL_STATUSES)[number];

/** The bill the Today card shows, with its date, stamp status and expected balance after it. */
export interface NextBill {
   id: string;
   name: string;
   amount: number;
   date: string;
   dateLabel: string;
   daysAway: number;
   expectedAfter: number;
   status: BillStatus;
   /** True only when status is COVERED (expected balance stays at or above the buffer). */
   covered: boolean;
}

/** Why: a bill due today still counts as next; only a day already past rolls to next month. */
export function dueDateOnOrAfter(dayOfMonth: number, today: string): string {
   const thisMonth = dateInMonth(monthKeyOf(today), dayOfMonth);
   if (!isBeforeDate(thisMonth, today)) return thisMonth;
   const nextMonth = monthKeyOf(addMonths(today, NEXT_MONTH_OFFSET));
   return dateInMonth(nextMonth, dayOfMonth);
}

/**
 * Why: the stamp reads the expected balance left after the bill is paid, so
 * "tight" means the bill is paid but cash drops under the buffer.
 */
export function billStatusOf(balanceAfter: number, buffer: number): BillStatus {
   if (balanceAfter < 0) return 'not_covered';
   if (balanceAfter < buffer) return 'tight';
   return 'covered';
}

/**
 * Why: the verdict uses the expected balance on the bill date (not today's cash),
 * so it matches the forecast. Returns null when no bill is active.
 */
export function nextBill(state: StoreState, today: string): NextBill | null {
   const due = state.bills
      .filter((bill) => bill.active)
      .map((bill) => ({ bill, date: dueDateOnOrAfter(bill.dayOfMonth, today) }))
      .sort((a, b) => a.date.localeCompare(b.date) || a.bill.id.localeCompare(b.bill.id));
   const first = due[0];
   if (!first) return null;
   const daysAway = diffDays(first.date, today);
   const expectedAfter = forecast(state, today).days[daysAway]?.expected;
   if (expectedAfter === undefined) return null;
   return {
      id: first.bill.id,
      name: first.bill.name,
      amount: first.bill.amount,
      date: first.date,
      dateLabel: dayLabel(first.date, today),
      daysAway,
      expectedAfter,
      status: billStatusOf(expectedAfter, state.business.buffer),
      covered: billStatusOf(expectedAfter, state.business.buffer) === 'covered',
   };
}
