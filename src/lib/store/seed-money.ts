// Purpose: builds seeded invoices, payments, reminders and recurring bills for the demo store.
// Six months of history plus this month; the latest due month holds the overdue chase set, and the month before it a few Risky fees.
import type { Bill, Invoice, Payment, Reminder } from '../types';
import {
   BILL_PRESETS,
   DELAY_RANGE_DAYS,
   DEFAULT_LANGUAGE,
   FEE_DUE_DAY,
   HISTORY_MONTHS,
   LANGUAGES,
   OVERDUE_INVOICE_COUNT,
   PARTIAL_PAYMENT_DIVISOR,
   PAYMENT_METHODS,
   SEED_LAST_MONTH_OWING_COUNT,
   SEED_PARTIAL_PAY_DAYS_AFTER_DUE,
   SEED_REMINDER_OFFSETS_DAYS,
   TONES,
} from '../constants';
import {
   addDays,
   addMonths,
   dateInMonth,
   isAfterDate,
   monthKeyOf,
   monthStart,
} from '../dates';
import type { Rng } from './rng';
import { padNumber, type SeedRoster } from './seed-people';

export interface SeedMoney {
   invoices: Invoice[];
   payments: Payment[];
   reminders: Reminder[];
}

/** Why: the overdue set is the first non-reliable students, so late payers owe. */
export function chaseStudentIds(roster: SeedRoster): string[] {
   return roster.students
      .filter((s) => roster.riskByFamily[s.familyId] !== 'reliable')
      .slice(0, OVERDUE_INVOICE_COUNT)
      .map((s) => s.id);
}

/**
 * Why: a few Risky students also owe last month's fee, so some overdue
 * invoices land in the 30+ day bucket as well as the 8-30 day bucket.
 */
export function lastMonthOwingIds(roster: SeedRoster, chase: Set<string>): string[] {
   return roster.students
      .filter(
         (s) => roster.riskByFamily[s.familyId] === 'risky' && !chase.has(s.id),
      )
      .slice(0, SEED_LAST_MONTH_OWING_COUNT)
      .map((s) => s.id);
}

/** Why: a fixed price list of recurring bills, all active (PRD §5, §8). */
export function buildBills(): Bill[] {
   return BILL_PRESETS.map((preset) => ({ ...preset, active: true }));
}

/** Why: a single-payment record; the id is stable so the seed stays deterministic. */
function payment(
   invoice: Invoice,
   amount: number,
   method: Payment['method'],
   date: string,
): Payment {
   return {
      id: `pay-${invoice.id}-1`,
      invoiceId: invoice.id,
      familyId: invoice.familyId,
      amount,
      method,
      date,
   };
}

/** Why: reminders make the "sent in the last 3 days" chase rule visible in the demo. */
function buildReminders(chaseInvoices: Invoice[], today: string): Reminder[] {
   return SEED_REMINDER_OFFSETS_DAYS.flatMap((offset, index) => {
      const invoice = chaseInvoices[index];
      if (!invoice) return [];
      const reminder: Reminder = {
         id: `rem-${padNumber(index + 1, 2)}`,
         invoiceId: invoice.id,
         sentOn: addDays(today, offset),
         tone: TONES[index % TONES.length] ?? TONES[0],
         language: LANGUAGES[index % LANGUAGES.length] ?? DEFAULT_LANGUAGE,
         channel: 'whatsapp',
      };
      return [reminder];
   });
}

/**
 * Why: RNG draws happen for every invoice whatever today is, so the data is
 * stable; today only decides which payments are on or before it.
 */
export function buildMoney(
   roster: SeedRoster,
   today: string,
   rng: Rng,
): SeedMoney {
   const chaseIds = chaseStudentIds(roster);
   const chase = new Set(chaseIds);
   const owingLastMonth = new Set(lastMonthOwingIds(roster, chase));
   const firstChaseId = chaseIds[0];
   const currentMonth = monthStart(today);
   // Why: a fee is overdue only after its due day, so the chase month is the latest one already due.
   const dueDayThisMonth = dateInMonth(monthKeyOf(currentMonth), FEE_DUE_DAY);
   const dueStart = isAfterDate(today, dueDayThisMonth)
      ? currentMonth
      : addMonths(currentMonth, -1);
   const dueMonth = monthKeyOf(dueStart);
   const priorDueMonth = monthKeyOf(addMonths(dueStart, -1));
   const invoices: Invoice[] = [];
   const payments: Payment[] = [];

   for (let offset = -HISTORY_MONTHS; offset <= 0; offset++) {
      const monthDate = addMonths(currentMonth, offset);
      const month = monthKeyOf(monthDate);
      const isCurrentMonth = month === monthKeyOf(currentMonth);
      for (const student of roster.students) {
         const risk = roster.riskByFamily[student.familyId] ?? 'reliable';
         const [minDelay, maxDelay] = DELAY_RANGE_DAYS[risk];
         const delay = rng.int(minDelay, maxDelay);
         const method = rng.pick(PAYMENT_METHODS);
         const invoice: Invoice = {
            id: `inv-${month}-${student.id}`,
            studentId: student.id,
            familyId: student.familyId,
            month,
            amount: student.feeAmount,
            raisedOn: monthDate,
            dueDate: dateInMonth(month, FEE_DUE_DAY),
         };
         invoices.push(invoice);

         const isOwing =
            (month === dueMonth && chase.has(student.id)) ||
            (month === priorDueMonth && owingLastMonth.has(student.id));
         if (isOwing) {
            // Overdue set stays unpaid; the first chase family part-pays in the due month.
            if (month === dueMonth && student.id === firstChaseId) {
               const partial = Math.floor(invoice.amount / PARTIAL_PAYMENT_DIVISOR);
               const afterDue = addDays(
                  invoice.dueDate,
                  SEED_PARTIAL_PAY_DAYS_AFTER_DUE,
               );
               // Why: a partial cannot be dated after today, even mid-month.
               const partialDate = isAfterDate(afterDue, today) ? today : afterDue;
               payments.push(payment(invoice, partial, method, partialDate));
            }
            continue;
         }

         // Other current-month late payers have settled by today.
         const scheduled = addDays(invoice.dueDate, delay);
         const late = isAfterDate(scheduled, today);
         const payDate = isCurrentMonth && late ? today : scheduled;
         if (!isAfterDate(payDate, today)) {
            payments.push(payment(invoice, invoice.amount, method, payDate));
         }
      }
   }

   const chaseInvoices = invoices.filter(
      (i) => i.month === dueMonth && chase.has(i.studentId),
   );
   return {
      invoices,
      payments,
      reminders: buildReminders(chaseInvoices, today),
   };
}
