// Purpose: logs one chase reminder per overdue invoice when the tutor opens WhatsApp or copies the draft (PRD §6 chase history).
// Pure: returns a new state; the caller passes `today` and commits the result.
import { OWED_REMINDER_CHANNEL, REMINDER_ID_PREFIX } from '../constants';
import type {
   Language,
   Reminder,
   ReminderChannel,
   StoreState,
   Tone,
} from '../types';
import { nextId } from './roster';

/** How a reminder was sent: the tone, language and channel the tutor used. */
export interface ReminderMeta {
   tone: Tone;
   language: Language;
   channel: ReminderChannel;
}

/** Why: without a chosen draft, the log records the saved settings and the copy channel. */
function defaultMetaOf(state: StoreState): ReminderMeta {
   return {
      tone: state.settings.defaultTone,
      language: state.settings.defaultLanguage,
      channel: OWED_REMINDER_CHANNEL,
   };
}

/**
 * Why: the reminder log feeds the "recently chased" penalty in chase priority,
 * so every sent reminder must be recorded with the day and how it went out.
 */
export function logChaseReminders(
   state: StoreState,
   invoiceIds: string[],
   today: string,
   meta: ReminderMeta = defaultMetaOf(state),
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
         tone: meta.tone,
         language: meta.language,
         channel: meta.channel,
      });
   }
   return { ...state, reminders };
}
