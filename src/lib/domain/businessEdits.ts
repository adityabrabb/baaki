// Purpose: pure edits to the business block: name, UPI id, opening balance and buffer (PRD §5 /settings, /bills).
// Pure: returns the next state; the caller commits it through the store.
import type { StoreState } from '../types';
import { totalReceived } from './cashStatus';

/** Why: the reminders and the chase card read the name and UPI id from here. */
export function setBusinessIdentity(
   state: StoreState,
   name: string,
   upiId: string,
): StoreState {
   return { ...state, business: { ...state.business, name, upiId } };
}

/** Why: opening cash and buffer feed the forecast, Today and alerts directly. */
export function setBalances(
   state: StoreState,
   openingBalance: number,
   buffer: number,
): StoreState {
   return { ...state, business: { ...state.business, openingBalance, buffer } };
}

/**
 * Why: the typed cash in hand is the truth, so the stored opening balance is the
 * cash minus payments already recorded; cashStatus then shows exactly the typed amount.
 */
export function openingFromCash(state: StoreState, cashInHand: number): number {
   return cashInHand - totalReceived(state);
}
