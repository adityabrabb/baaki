// Purpose: browser-side calls to the AI routes; every response is validated with zod before the UI uses it.
import { AI_PARSE_ROUTE, AI_REMINDER_ROUTE, JSON_HEADERS } from '../constants';
import {
   type ParseRequest,
   type ParseResult,
   type ReminderRequest,
   type ReminderResponse,
   parseResultSchema,
   reminderResponseSchema,
} from './schemas';

/** Why: a non-2xx or non-JSON reply becomes one thrown error the UI can show as a note. */
async function postJson(url: string, body: unknown): Promise<unknown> {
   const response = await fetch(url, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
   });
   if (!response.ok) throw new Error(`Request failed: ${response.status}`);
   return response.json();
}

/** Why: the Chase sheet shows only a draft that passed the reminder schema. */
export async function fetchReminderDraft(
   input: ReminderRequest,
): Promise<ReminderResponse> {
   const json = await postJson(AI_REMINDER_ROUTE, input);
   return reminderResponseSchema.parse(json);
}

/** Why: the quick-add chip shows only a parse that passed the parse schema. */
export async function fetchParse(input: ParseRequest): Promise<ParseResult> {
   const json = await postJson(AI_PARSE_ROUTE, input);
   return parseResultSchema.parse(json);
}
