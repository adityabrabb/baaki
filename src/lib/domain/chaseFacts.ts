// Purpose: gathers the facts a reminder draft needs from one chase item and the store (PRD §7 reminder input).
// Pure: the store state and item are passed in; nothing is read from storage or the clock.
import { NAME_LIST_JOIN } from '../constants';
import type { StoreState } from '../types';
import type { ChaseItem } from './chasePriority';

/** The facts the Chase sheet sends with a tone and language to the draft route. */
export interface ChaseFacts {
   familyName: string;
   childName: string;
   amount: number;
   daysLate: number;
   remindersSent: number;
   businessName: string;
   upiId: string;
}

/**
 * Why: the draft names the children of the family (or the family itself when
 * none are on the roster) and counts earlier reminders, so the wording fits.
 */
export function chaseFactsOf(state: StoreState, item: ChaseItem): ChaseFacts {
   const children = state.students
      .filter((student) => student.familyId === item.familyId && student.active)
      .map((student) => student.name);
   const remindersSent = state.reminders.filter((reminder) =>
      item.invoiceIds.includes(reminder.invoiceId),
   ).length;
   return {
      familyName: item.familyName,
      childName: children.length > 0 ? children.join(NAME_LIST_JOIN) : item.familyName,
      amount: item.owed,
      daysLate: item.daysLate,
      remindersSent,
      businessName: state.business.name,
      upiId: state.business.upiId,
   };
}
