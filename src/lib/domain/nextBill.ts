// Purpose: picks the next recurring bill due on or after today and says whether cash covers it (PRD §5 /).
// Pure: callers pass `today`; nothing here reads the clock or storage.
import { NEXT_MONTH_OFFSET } from '../constants';
import {
   addMonths,
   dateInMonth,
   isBeforeDate,
   monthKeyOf,
} from '../dates';
import type { StoreState } from '../types';
import { cashStatus } from './cashStatus';

/** The bill the Today card shows, with its due date and the covered verdict. */
export interface NextBill {
   id: string;
   name: string;
   amount: number;
   date: string;
   covered: boolean;
}

/** Why: a bill due today still counts as next; only a day already past rolls to next month. */
function dueDateOnOrAfter(dayOfMonth: number, today: string): string {
   const thisMonth = dateInMonth(monthKeyOf(today), dayOfMonth);
   if (!isBeforeDate(thisMonth, today)) return thisMonth;
   const nextMonth = monthKeyOf(addMonths(today, NEXT_MONTH_OFFSET));
   return dateInMonth(nextMonth, dayOfMonth);
}

/**
 * Why: "covered" compares cash in hand with the bill amount, so the Today stamp
 * answers the tutor's question directly. Returns null when no bill is active.
 */
export function nextBill(state: StoreState, today: string): NextBill | null {
   const due = state.bills
      .filter((bill) => bill.active)
      .map((bill) => ({ bill, date: dueDateOnOrAfter(bill.dayOfMonth, today) }))
      .sort((a, b) => a.date.localeCompare(b.date) || a.bill.id.localeCompare(b.bill.id));
   const first = due[0];
   if (!first) return null;
   const { balance } = cashStatus(state, today);
   return {
      id: first.bill.id,
      name: first.bill.name,
      amount: first.bill.amount,
      date: first.date,
      covered: balance >= first.bill.amount,
   };
}
