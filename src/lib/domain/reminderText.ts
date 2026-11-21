// Purpose: fills the template reminder shown in the Chase sheet (PRD §5 /owed); no AI and no sending.
// Pure: every fact is passed in; the wording is the one template in constants.
import { REMINDER_TEMPLATE, REMINDER_TOKEN_PATTERN } from '../constants';
import { formatINR } from './formatINR';

export interface ReminderFacts {
   familyName: string;
   amount: number;
   daysLate: number;
   businessName: string;
}

/**
 * Why: one fixed template keeps the wording the same for every family until an
 * AI draft exists; a replacer function keeps `$` in names literal.
 */
export function reminderText(facts: ReminderFacts): string {
   const values: Record<string, string> = {
      family: facts.familyName,
      amount: formatINR(facts.amount),
      days: String(facts.daysLate),
      business: facts.businessName,
   };
   return REMINDER_TEMPLATE.replace(
      REMINDER_TOKEN_PATTERN,
      (_token, key: string) => values[key] ?? '',
   );
}
