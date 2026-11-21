// Purpose: logs one chase reminder per overdue invoice when the tutor copies it (PRD §6 chase history).
// Pure: returns a new state; the caller passes `today` and commits the result.
import { OWED_REMINDER_CHANNEL, REMINDER_ID_PREFIX } from '../constants';
import type { Reminder, StoreState } from '../types';
import { nextId } from './roster';

/**
 * Why: the reminder log feeds the "recently chased" penalty in chase priority,
 * so every copied reminder must be recorded with the day it was sent.
 */
export function logChaseReminders(
   state: StoreState,
   invoiceIds: string[],
   today: string,
): StoreState {
   const reminders: Reminder[] = [...state.reminders];
   for (const invoiceId of invoiceIds) {
      reminders.push({
         id: nextId(
            REMINDER_ID_PREFIX,
            reminders.map((reminder) => reminder.id),
         ),
         invoiceId,
         sentOn: today,
         tone: state.settings.defaultTone,
         language: state.settings.defaultLanguage,
         channel: OWED_REMINDER_CHANNEL,
      });
   }
   return { ...state, reminders };
}
