// Purpose: template reminders for every tone x language, used when there is no key or the AI fails (PRD §7).
// Pure: every fact is passed in; amounts go through formatINR and the UPI link through paymentLinks.
import {
   AI_MAX_REMINDER_CHARS,
   REMINDER_FALLBACK_TEMPLATES,
   REMINDER_TOKEN_PATTERN,
} from '../constants';
import { formatINR } from '../domain/formatINR';
import { upiLink } from '../domain/paymentLinks';
import type { ReminderRequest } from './schemas';

/** Why: the template works with no key, so the Chase sheet always has a usable draft. */
export function templateReminder(input: ReminderRequest): string {
   const values: Record<string, string> = {
      family: input.familyName,
      child: input.childName,
      amount: formatINR(input.amount),
      days: String(input.daysLate),
      business: input.businessName,
      upi: upiLink(input.upiId, input.businessName, input.amount),
   };
   const template = REMINDER_FALLBACK_TEMPLATES[input.tone][input.language];
   const text = template.replace(
      REMINDER_TOKEN_PATTERN,
      (_token, key: string) => values[key] ?? '',
   );
   return text.slice(0, AI_MAX_REMINDER_CHARS);
}
