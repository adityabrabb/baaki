// Purpose: cash in hand and what is still owed this month, for the Today cash sentence (PRD §5 /).
// Pure: callers pass `today`; nothing here reads the clock or storage.
import { monthKeyOf } from '../dates';
import type { StoreState } from '../types';
import { outstandingOf } from './chasePriority';

/** The two numbers the Today sentence compares. */
export interface CashStatus {
   balance: number;
   owedThisMonth: number;
}

/**
 * Why: cash on hand is the opening balance plus every recorded payment, the same
 * rule the forecast uses, so the Today sentence agrees with the forecast.
 */
export function cashStatus(state: StoreState, today: string): CashStatus {
   const received = state.payments.reduce((sum, payment) => sum + payment.amount, 0);
   const month = monthKeyOf(today);
   const owedThisMonth = state.invoices
      .filter((invoice) => invoice.month === month)
      .reduce((sum, invoice) => sum + outstandingOf(invoice, state.payments), 0);
   return {
      balance: state.business.openingBalance + received,
      owedThisMonth,
   };
}
