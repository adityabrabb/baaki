// Purpose: derives the seed's opening balance from `today` so the demo has a bad day (PRD §8, §12).
// Seed only: the forecast itself is never changed here.
import {
   BAD_DAY_SHORTFALL,
   BILL_PRESETS,
   DEFAULT_BUFFER,
   RENT_BILL_ID,
} from '../constants';
import { forecast } from '../domain/forecast';
import {
   addMonths,
   dateInMonth,
   isAfterDate,
   monthKeyOf,
   monthStart,
} from '../dates';
import type { StoreState } from '../types';

/** Why: the rent is the first big outflow, so its date is where the bad day lands. */
export function nextRentDate(today: string): string {
   const rent = BILL_PRESETS.find((bill) => bill.id === RENT_BILL_ID);
   if (!rent) {
      throw new RangeError(`No rent bill preset with id ${RENT_BILL_ID}`);
   }
   const thisMonthRent = dateInMonth(monthKeyOf(today), rent.dayOfMonth);
   if (isAfterDate(thisMonthRent, today)) {
      return thisMonthRent;
   }
   const nextMonthKey = monthKeyOf(addMonths(monthStart(today), 1));
   return dateInMonth(nextMonthKey, rent.dayOfMonth);
}

/**
 * Why: the opening balance is set so expected cash on the next rent date sits
 * BAD_DAY_SHORTFALL under the buffer; state0 must be the seed with balance 0.
 */
export function openingBalanceFor(state0: StoreState, today: string): number {
   const target = nextRentDate(today);
   const { days } = forecast(state0, today);
   const entry = days.find((day) => day.date === target);
   if (!entry) {
      throw new RangeError(`Forecast has no day for rent date ${target}`);
   }
   return DEFAULT_BUFFER - BAD_DAY_SHORTFALL - entry.expected;
}
