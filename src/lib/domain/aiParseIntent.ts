// Purpose: maps a validated AI parse result onto the same intent shape the regex parser returns, so one save path serves both (PRD §6).
// Pure: the caller passes `today`; returns null when the reply lacks what a save needs.
import type { ParseResult } from '../ai/schemas';
import { diffDays } from '../dates';
import type { QuickAddIntent } from './parseQuickAdd';

/** Why: the AI date is an absolute day; a save needs it as an offset from today (0 or earlier). */
function offsetOf(date: string | null, today: string): number {
   if (date === null) return 0;
   const diff = diffDays(date, today);
   return diff <= 0 ? diff : 0;
}

/** Why: a payment needs a name and an amount; a bill line needs a name. Anything less is unreadable. */
export function intentFromParse(result: ParseResult, today: string): QuickAddIntent | null {
   if (result.type === 'payment') {
      if (result.student === null || result.amount === null) return null;
      return {
         kind: 'payment',
         name: result.student,
         amount: result.amount,
         method: result.method,
         dayOffset: offsetOf(result.date, today),
      };
   }
   if (result.type === 'bill_paid') {
      if (result.student === null) return null;
      return {
         kind: 'bill_paid',
         billName: result.student.toLowerCase(),
         dayOffset: offsetOf(result.date, today),
      };
   }
   return null;
}
