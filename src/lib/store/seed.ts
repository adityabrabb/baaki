// Purpose: the single entry point that builds the full demo store for a given `today`.
// Same `today` in, identical StoreState out (seeded RNG, PRD §8).
import type { StoreState } from '../types';
import {
   BUSINESS_NAME,
   DEFAULT_BUFFER,
   DEFAULT_LANGUAGE,
   DEFAULT_TONE,
   OPENING_BALANCE,
   RNG_SEED,
   SCHEMA_VERSION,
   UPI_ID,
} from '../constants';
import { isDateOnly } from '../dates';
import { buildBills, buildMoney } from './seed-money';
import { buildRoster } from './seed-people';
import { createRng } from './rng';

/** Why: `today` must be passed in so tests and the UI agree on the same day. */
export function buildSeedState(today: string): StoreState {
   if (!isDateOnly(today)) {
      throw new RangeError(`Seed needs a YYYY-MM-DD today, got: ${today}`);
   }
   const rng = createRng(RNG_SEED);
   const roster = buildRoster(rng);
   const money = buildMoney(roster, today, rng);
   return {
      version: SCHEMA_VERSION,
      business: {
         name: BUSINESS_NAME,
         openingBalance: OPENING_BALANCE,
         buffer: DEFAULT_BUFFER,
         upiId: UPI_ID,
      },
      families: roster.families,
      students: roster.students,
      invoices: money.invoices,
      payments: money.payments,
      reminders: money.reminders,
      bills: buildBills(),
      settings: { defaultTone: DEFAULT_TONE, defaultLanguage: DEFAULT_LANGUAGE },
   };
}
