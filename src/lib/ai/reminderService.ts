// Purpose: drafts one reminder: Gemini when it answers in time and passes checks, otherwise the template; always a validated draft.
import {
   AI_PROMPT_RULES,
   LANGUAGE_LABELS,
   REMINDER_TONE_LABELS,
} from '../constants';
import { formatINR } from '../domain/formatINR';
import { upiLink } from '../domain/paymentLinks';
import { askGemini } from './geminiClient';
import { templateReminder } from './reminderTemplates';
import {
   type ReminderRequest,
   type ReminderResponse,
   reminderResponseSchema,
} from './schemas';

/** Why: the prompt carries only the facts on the chase card and the payment link. */
function promptFor(input: ReminderRequest, link: string): string {
   return [
      ...AI_PROMPT_RULES,
      `Family: ${input.familyName}. Student: ${input.childName}. Amount: ${formatINR(input.amount)}. Days late: ${input.daysLate}. Reminders already sent: ${input.remindersSent}.`,
      `Tone: ${REMINDER_TONE_LABELS[input.tone]}. Language: ${LANGUAGE_LABELS[input.language]}.`,
      `UPI link (include exactly): ${link}. Sign off as: ${input.businessName}.`,
   ].join('\n');
}

/**
 * Why: the AI draft is used only if it is valid and keeps the payment link;
 * anything else falls back to the template, so the sheet never shows nothing.
 */
export async function draftReminder(
   input: ReminderRequest,
): Promise<ReminderResponse> {
   const link = upiLink(input.upiId, input.businessName, input.amount);
   const aiText = await askGemini(promptFor(input, link));
   if (aiText !== null && aiText.includes(link)) {
      const checked = reminderResponseSchema.safeParse({ text: aiText, source: 'ai' });
      if (checked.success) return checked.data;
   }
   return reminderResponseSchema.parse({
      text: templateReminder(input),
      source: 'template',
   });
}
