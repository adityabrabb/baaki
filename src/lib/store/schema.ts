// Purpose: zod schema that validates persisted store data before the app trusts it.
// Any mismatch makes the repository fall back to the seed (PRD §9).
import { z } from 'zod';
import type { StoreState } from '../types';
import {
   LANGUAGES,
   PAYMENT_METHODS,
   REMINDER_CHANNELS,
   TONES,
} from '../constants';
import { isDateOnly } from '../dates';

const dateOnly = z.string().refine(isDateOnly, 'Expected YYYY-MM-DD');
const rupees = z.number().int().nonnegative();
const id = z.string().min(1);
const text = z.string();

const businessSchema = z.object({
   name: text,
   openingBalance: z.number().int(),
   buffer: rupees,
   upiId: text,
});

const familySchema = z.object({ id, name: text, phone: text });

const studentSchema = z.object({
   id,
   name: text,
   familyId: id,
   batch: text,
   classLevel: z.number().int(),
   feeAmount: rupees,
   active: z.boolean(),
});

const invoiceSchema = z.object({
   id,
   studentId: id,
   familyId: id,
   month: text,
   amount: rupees,
   raisedOn: dateOnly,
   dueDate: dateOnly,
});

const paymentSchema = z.object({
   id,
   invoiceId: id,
   familyId: id,
   amount: rupees,
   method: z.enum(PAYMENT_METHODS),
   date: dateOnly,
});

const reminderSchema = z.object({
   id,
   invoiceId: id,
   sentOn: dateOnly,
   tone: z.enum(TONES),
   language: z.enum(LANGUAGES),
   channel: z.enum(REMINDER_CHANNELS),
});

const billSchema = z.object({
   id,
   name: text,
   amount: rupees,
   dayOfMonth: z.number().int().min(1).max(31),
   active: z.boolean(),
});

const settingsSchema = z.object({
   defaultTone: z.enum(TONES),
   defaultLanguage: z.enum(LANGUAGES),
});

/** Why: one schema for the whole persisted state; keeps the repository free of shape checks. */
export const storeStateSchema: z.ZodType<StoreState> = z.object({
   version: z.number().int(),
   business: businessSchema,
   families: z.array(familySchema),
   students: z.array(studentSchema),
   invoices: z.array(invoiceSchema),
   payments: z.array(paymentSchema),
   reminders: z.array(reminderSchema),
   bills: z.array(billSchema),
   settings: settingsSchema,
});
