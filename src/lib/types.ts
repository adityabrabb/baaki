// Purpose: entity types and root store shape for Baaki (PRD §6, §8, §9).
// Money is integer rupees; dates are 'YYYY-MM-DD' strings.
import type {
   LANGUAGES,
   PAYMENT_METHODS,
   REMINDER_CHANNELS,
   RISK_BADGES,
   TONES,
} from './constants';

export type Tone = (typeof TONES)[number];
export type Language = (typeof LANGUAGES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type ReminderChannel = (typeof REMINDER_CHANNELS)[number];
export type RiskBadge = (typeof RISK_BADGES)[number];

/** The tutor's business: name, opening cash, safety buffer, UPI id. */
export interface Business {
   name: string;
   openingBalance: number;
   buffer: number;
   upiId: string;
}

/** A parent household; a family can have several students (siblings). */
export interface Family {
   id: string;
   name: string;
   phone: string;
}

/** A student enrolled in one batch, billed at their own monthly fee. */
export interface Student {
   id: string;
   name: string;
   familyId: string;
   batch: string;
   classLevel: number;
   feeAmount: number;
   active: boolean;
}

/**
 * A monthly fee invoice. Status (open / part-paid / paid) is derived from
 * the payments that reference it, never stored.
 */
export interface Invoice {
   id: string;
   studentId: string;
   familyId: string;
   month: string;
   amount: number;
   raisedOn: string;
   dueDate: string;
}

/** A recorded payment against one invoice (manual entry, UPI or cash). */
export interface Payment {
   id: string;
   invoiceId: string;
   familyId: string;
   amount: number;
   method: PaymentMethod;
   date: string;
}

/** A logged chase message for one invoice. */
export interface Reminder {
   id: string;
   invoiceId: string;
   sentOn: string;
   tone: Tone;
   language: Language;
   channel: ReminderChannel;
}

/** A recurring outgoing bill due on a day of every month. */
export interface Bill {
   id: string;
   name: string;
   amount: number;
   dayOfMonth: number;
   active: boolean;
}

/** User preferences that affect drafts and display only. */
export interface Settings {
   defaultTone: Tone;
   defaultLanguage: Language;
}

/** Root state persisted under the storage key (PRD §9). */
export interface StoreState {
   version: number;
   business: Business;
   families: Family[];
   students: Student[];
   invoices: Invoice[];
   payments: Payment[];
   reminders: Reminder[];
   bills: Bill[];
   settings: Settings;
}
