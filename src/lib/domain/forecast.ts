// Purpose: 90-day cash forecast with optimistic, expected and pessimistic balances (PRD §6).
// Pure: takes the store state and `today`; the caller passes the clock in.
import {
   FORECAST_ASSUMPTIONS,
   FORECAST_HORIZON_DAYS,
   PESSIMISTIC_EXTRA_DELAY_DAYS,
} from '../constants';
import { addDays, dateInMonth, diffDays, isAfterDate, monthKeyOf } from '../dates';
import type { Bill, Invoice, Payment, StoreState } from '../types';
import { expectedPayDate } from './expectedPayDate';
import { reliability, type Reliability } from './reliability';

/** Running cash balance on one day under each scenario. */
export interface ForecastDay {
   date: string;
   optimistic: number;
   expected: number;
   pessimistic: number;
}

/** A recurring bill falling due inside the horizon. */
export interface BillOccurrence {
   billId: string;
   name: string;
   amount: number;
   date: string;
}

/** The forecast plus the assumptions the UI must show (it is an estimate). */
export interface ForecastResult {
   days: ForecastDay[];
   bills: BillOccurrence[];
   assumptions: string[];
}

type Scenario = 'optimistic' | 'expected' | 'pessimistic';
type Flows = Record<Scenario, number[]>;

/** Why: each scenario is a net flow per horizon day; balances are running sums. */
function emptyFlows(): Flows {
   const zeros = (): number[] => new Array<number>(FORECAST_HORIZON_DAYS).fill(0);
   return { optimistic: zeros(), expected: zeros(), pessimistic: zeros() };
}

/** Why: adds an amount to a horizon day, ignoring dates outside the window. */
function addAt(flow: number[], offset: number, amount: number): void {
   if (offset >= 0 && offset < flow.length) flow[offset] += amount;
}

/** Why: an overdue invoice can only be collected from today onward. */
function notBefore(date: string, today: string): string {
   return isAfterDate(today, date) ? today : date;
}

/** Why: partial payments reduce what an invoice still owes. */
function outstandingOf(invoice: Invoice, payments: Payment[]): number {
   const paid = payments
      .filter((payment) => payment.invoiceId === invoice.id)
      .reduce((sum, payment) => sum + payment.amount, 0);
   return Math.max(0, invoice.amount - paid);
}

/** Why: reliability is computed once per family, not once per invoice. */
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

/** Why: cash on hand is the opening balance plus every payment already received. */
function cashOnHand(state: StoreState): number {
   const received = state.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
   );
   return state.business.openingBalance + received;
}

/** Why: open invoices land on their due or expected dates; overdue ones only count optimistically. */
function addInflows(
   flows: Flows,
   state: StoreState,
   today: string,
): void {
   const historyOf = memoReliability(state, today);
   for (const invoice of state.invoices) {
      const owed = outstandingOf(invoice, state.payments);
      if (owed === 0) continue;
      const history = historyOf(invoice.familyId);
      const avg = history.avgDelayDays;
      const at = (date: string): number =>
         diffDays(notBefore(date, today), today);
      addAt(flows.optimistic, at(invoice.dueDate), owed);
      if (isAfterDate(today, invoice.dueDate)) continue;
      addAt(flows.expected, at(expectedPayDate(invoice.dueDate, avg)), owed);
      if (history.badge !== 'risky') {
         const slipped = expectedPayDate(
            invoice.dueDate,
            avg + PESSIMISTIC_EXTRA_DELAY_DAYS,
         );
         addAt(flows.pessimistic, at(slipped), owed);
      }
   }
}

/** Why: bills leave on their day of the month in every scenario alike. */
function addOutflows(
   flows: Flows,
   bills: Bill[],
   dates: string[],
   today: string,
): BillOccurrence[] {
   const occurrences: BillOccurrence[] = [];
   const active = bills.filter((bill) => bill.active);
   for (const date of dates) {
      const offset = diffDays(date, today);
      for (const bill of active) {
         if (dateInMonth(monthKeyOf(date), bill.dayOfMonth) !== date) continue;
         occurrences.push({
            billId: bill.id,
            name: bill.name,
            amount: bill.amount,
            date,
         });
         for (const scenario of Object.keys(flows) as Scenario[]) {
            addAt(flows[scenario], offset, -bill.amount);
         }
      }
   }
   return occurrences;
}

/** Why: the forecast is an estimate, so its assumptions travel with it. */
export function forecast(state: StoreState, today: string): ForecastResult {
   const flows = emptyFlows();
   const dates = Array.from({ length: FORECAST_HORIZON_DAYS }, (_, i) =>
      addDays(today, i),
   );
   addInflows(flows, state, today);
   const bills = addOutflows(flows, state.bills, dates, today);

   const opening = cashOnHand(state);
   const running: Record<Scenario, number> = {
      optimistic: opening,
      expected: opening,
      pessimistic: opening,
   };
   const days: ForecastDay[] = dates.map((date, i) => {
      for (const scenario of Object.keys(running) as Scenario[]) {
         running[scenario] += flows[scenario][i];
      }
      return { date, ...running };
   });

   return { days, bills, assumptions: [...FORECAST_ASSUMPTIONS] };
}
