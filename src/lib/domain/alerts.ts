// Purpose: Today alerts when a bill is uncovered or cash dips under the buffer (PRD §6).
// Pure: derives everything from forecast(); every alert text names an action.
import { ALERT_ACTIONS, ALERT_KINDS, ALERT_MESSAGES } from '../constants';
import { diffDays } from '../dates';
import type { StoreState } from '../types';
import { forecast } from './forecast';

export type AlertKind = (typeof ALERT_KINDS)[number];

/** One alert tied to a bill falling due inside the forecast horizon. */
export interface Alert {
   id: string;
   kind: AlertKind;
   billId: string;
   date: string;
   daysAway: number;
   text: string;
}

/** Why: a bill day is the point the PRD tests; negative cash is uncovered. */
function alertKindFor(balance: number, buffer: number): AlertKind | null {
   if (balance < 0) return 'uncovered_bill';
   if (balance < buffer) return 'below_buffer';
   return null;
}

/**
 * Why: alerts sit on bill days only, so each names the bill that caused it
 * and the expected balance left after paying it.
 */
export function alerts(state: StoreState, today: string): Alert[] {
   const result = forecast(state, today);
   const buffer = state.business.buffer;
   const out: Alert[] = [];
   for (const bill of result.bills) {
      const daysAway = diffDays(bill.date, today);
      const balance = result.days[daysAway]?.expected;
      if (balance === undefined) continue;
      const kind = alertKindFor(balance, buffer);
      if (kind === null) continue;
      out.push({
         id: `${kind}:${bill.billId}:${bill.date}`,
         kind,
         billId: bill.billId,
         date: bill.date,
         daysAway,
         text: `${bill.name} due ${bill.date} ${ALERT_MESSAGES[kind]} ${ALERT_ACTIONS[kind]}`,
      });
   }
   return out;
}
