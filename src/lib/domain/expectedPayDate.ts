// Purpose: expected pay date of an open invoice = due date + family average delay (PRD §6).
// Pure: the caller supplies the family's average delay from reliability().
import { addDays } from '../dates';

/**
 * Why: a family with no history has avgDelayDays 0, so the estimate falls back
 * to the due date itself.
 */
export function expectedPayDate(dueDate: string, avgDelayDays: number): string {
   return addDays(dueDate, Math.max(0, avgDelayDays));
}
