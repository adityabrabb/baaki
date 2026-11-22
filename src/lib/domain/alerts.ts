// Purpose: Today alerts for bills due within the window that cash will not cover or leaves under the buffer (PRD §6).
// Pure: derives everything from forecast() and chaseTargets(); every alert names an action.
import {
   ALERT_ACTIONS,
   ALERT_KINDS,
   ALERT_MAX_COUNT,
   ALERT_MESSAGES,
   ALERT_WINDOW_DAYS,
   BILL_HEADLINE_CHASE_PREFIX,
   NAME_LIST_JOIN,
} from '../constants';
import { dayLabel, diffDays } from '../dates';
import type { StoreState } from '../types';
import { type ChaseTargets, chaseTargets } from './chaseTargets';
import { forecast } from './forecast';
import { formatINR } from './formatINR';

export type AlertKind = (typeof ALERT_KINDS)[number];

/** One alert per bill; chaseFamilyId is the first family to chase, for the link. */
export interface Alert {
   id: string;
   kind: AlertKind;
   billId: string;
   date: string;
   daysAway: number;
   text: string;
   chaseFamilyId: string | null;
}

/** Why: a bill day is the point the PRD tests; negative cash is uncovered. */
function alertKindFor(balance: number, buffer: number): AlertKind | null {
   if (balance < 0) return 'uncovered_bill';
   if (balance < buffer) return 'below_buffer';
   return null;
}

/** Why: the action names the families and the amount to chase, or falls back to the generic action. */
function actionFor(kind: AlertKind, targets: ChaseTargets): string {
   if (targets.items.length === 0) return ALERT_ACTIONS[kind];
   const names = targets.items.map((item) => item.familyName).join(NAME_LIST_JOIN);
   return `${BILL_HEADLINE_CHASE_PREFIX} ${names} (${formatINR(targets.total)}).`;
}

/**
 * Why: alerts sit on bill days only, one per bill, nearest first, at most a few,
 * so Today never floods the tutor; each names the bill and what to chase.
 */
export function alerts(state: StoreState, today: string): Alert[] {
   const result = forecast(state, today);
   const buffer = state.business.buffer;
   const targets = chaseTargets(state, today);
   const seen = new Set<string>();
   const out: Alert[] = [];
   for (const bill of result.bills) {
      if (seen.has(bill.billId)) continue;
      const daysAway = diffDays(bill.date, today);
      if (daysAway > ALERT_WINDOW_DAYS) continue;
      const balance = result.days[daysAway]?.expected;
      if (balance === undefined) continue;
      const kind = alertKindFor(balance, buffer);
      if (kind === null) continue;
      seen.add(bill.billId);
      out.push({
         id: `${kind}:${bill.billId}:${bill.date}`,
         kind,
         billId: bill.billId,
         date: bill.date,
         daysAway,
         text: `${bill.name} due ${dayLabel(bill.date, today)}. ${ALERT_MESSAGES[kind]} ${actionFor(kind, targets)}`,
         chaseFamilyId: targets.items[0]?.familyId ?? null,
      });
   }
   return out
      .sort((a, b) => a.daysAway - b.daysAway || a.billId.localeCompare(b.billId))
      .slice(0, ALERT_MAX_COUNT);
}
