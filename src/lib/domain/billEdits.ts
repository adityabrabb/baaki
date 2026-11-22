// Purpose: pure edits to the recurring bills list: add, change and remove one bill (PRD §5 /bills).
// Pure: returns the next state; the caller commits it through the store.
import { BILL_ID_PREFIX } from '../constants';
import type { Bill, StoreState } from '../types';
import type { BillInput } from './billInput';
import { nextId } from './roster';

/** Why: a new bill starts active so it counts in Forecast, Today and alerts at once. */
export function addBill(state: StoreState, input: BillInput): StoreState {
   const bill: Bill = {
      id: nextId(
         BILL_ID_PREFIX,
         state.bills.map((item) => item.id),
      ),
      name: input.name,
      amount: input.amount,
      dayOfMonth: input.dayOfMonth,
      active: true,
   };
   return { ...state, bills: [...state.bills, bill] };
}

/** Why: an edit keeps the id and active flag, so anything pointing at the bill still finds it. */
export function updateBill(
   state: StoreState,
   billId: string,
   input: BillInput,
): StoreState {
   const bills = state.bills.map((bill) =>
      bill.id === billId
         ? {
              ...bill,
              name: input.name,
              amount: input.amount,
              dayOfMonth: input.dayOfMonth,
           }
         : bill,
   );
   return { ...state, bills };
}

/** Why: a deleted bill leaves Forecast, Today and alerts on the next render. */
export function deleteBill(state: StoreState, billId: string): StoreState {
   return { ...state, bills: state.bills.filter((bill) => bill.id !== billId) };
}
