// Purpose: the one-sentence Today verdict for the next bill, e.g. "Rent ₹12,000 in 9 days: tight. Chase 3 families (₹6,100)."
// Pure: every fact is passed in (today included); the wording comes from constants.
import {
   BILL_HEADLINE_CHASE_PREFIX,
   BILL_STATUS_WORDS,
   FAMILY_WORDS,
} from '../constants';
import { relativeDays } from '../dates';
import type { ChaseTargets } from './chaseTargets';
import { formatINR } from './formatINR';
import type { NextBill } from './nextBill';

/**
 * Why: the headline says the verdict in words and, when cash is short, names how
 * much to chase, so the tutor knows the next action from one sentence.
 */
export function billHeadline(
   bill: NextBill,
   targets: ChaseTargets,
   today: string,
): string {
   const head = `${bill.name} ${formatINR(bill.amount)} ${relativeDays(bill.date, today)}: ${BILL_STATUS_WORDS[bill.status]}.`;
   if (bill.status === 'covered' || targets.items.length === 0) return head;
   const count = targets.items.length;
   const noun = count === 1 ? FAMILY_WORDS.one : FAMILY_WORDS.many;
   return `${head} ${BILL_HEADLINE_CHASE_PREFIX} ${count} ${noun} (${formatINR(targets.total)}).`;
}
