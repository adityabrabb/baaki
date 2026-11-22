// Purpose: zod schemas for the AI routes: reminder and parse requests and responses (PRD §7). Every input and AI output is validated.
import { z } from 'zod';
import {
   AI_MAX_REMINDER_CHARS,
   DATE_ONLY_PATTERN,
   LANGUAGES,
   NAME_MAX_LENGTH,
   PARSE_TYPES,
   PAYMENT_METHODS,
   QUICK_ADD_MAX_AMOUNT,
   QUICK_ADD_MAX_LENGTH,
   REMINDER_SOURCES,
   TONES,
} from '../constants';

const nameSchema = z.string().trim().min(1).max(NAME_MAX_LENGTH);

/** Why: the reminder draft needs the facts the tutor sees on the chase card, plus the payment link inputs. */
export const reminderRequestSchema = z.object({
   familyName: nameSchema,
   childName: nameSchema,
   amount: z.number().int().positive(),
   daysLate: z.number().int().min(0),
   remindersSent: z.number().int().min(0),
   tone: z.enum(TONES),
   language: z.enum(LANGUAGES),
   businessName: nameSchema,
   upiId: nameSchema,
});

/** Why: the draft text is checked for length and emptiness before the sheet shows it. */
export const reminderResponseSchema = z.object({
   text: z.string().trim().min(1).max(AI_MAX_REMINDER_CHARS),
   source: z.enum(REMINDER_SOURCES),
});

/** Why: the line and today's date are all the parser needs; the date resolves "yesterday". */
export const parseRequestSchema = z.object({
   text: z.string().trim().min(1).max(QUICK_ADD_MAX_LENGTH),
   today: z.string().regex(DATE_ONLY_PATTERN),
});

/** Why: AI JSON is never trusted; every field is checked before it becomes a payment. */
export const parseResultSchema = z.object({
   type: z.enum(PARSE_TYPES),
   student: nameSchema.nullable(),
   amount: z.number().int().positive().max(QUICK_ADD_MAX_AMOUNT).nullable(),
   method: z.enum(PAYMENT_METHODS).nullable(),
   date: z.string().regex(DATE_ONLY_PATTERN).nullable(),
});

export type ReminderRequest = z.infer<typeof reminderRequestSchema>;
export type ReminderResponse = z.infer<typeof reminderResponseSchema>;
export type ParseRequest = z.infer<typeof parseRequestSchema>;
export type ParseResult = z.infer<typeof parseResultSchema>;
