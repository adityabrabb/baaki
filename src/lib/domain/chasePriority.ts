// Purpose: ranks overdue families for the chase queue (PRD §6 chase priority).
// Pure: callers pass `today`; nothing here reads the clock or storage.
import { CHASE_RECENT_REMINDER_DAYS, RISK_WEIGHTS } from '../constants';
import { diffDays, isAfterDate, isBeforeDate } from '../dates';
import type { Invoice, Payment, RiskBadge, StoreState } from '../types';
import { reliability } from './reliability';

/** One overdue family in the chase queue; higher score is chased first. */
export interface ChaseItem {
   familyId: string;
   familyName: string;
   owed: number;
   daysLate: number;
   oldestDueDate: string;
   invoiceIds: string[];
   badge: RiskBadge;
   recentReminders: number;
   score: number;
}

/** Working totals for one family while its overdue invoices are scanned. */
interface Group {
   familyId: string;
   owed: number;
   daysLate: number;
   oldestDueDate: string;
   invoiceIds: string[];
}

/**
 * Why: money still owed on one invoice after partial payments; never negative.
 * Shared so every "owed" figure in the chase and what-if views agrees.
 */
export function outstandingOf(invoice: Invoice, payments: Payment[]): number {
   const paid = payments
      .filter((payment) => payment.invoiceId === invoice.id)
      .reduce((sum, payment) => sum + payment.amount, 0);
   return Math.max(0, invoice.amount - paid);
}

/** Why: a reminder in the last few days means the family was just chased. */
function countRecentReminders(
   state: StoreState,
   invoiceIds: string[],
   today: string,
): number {
   const ids = new Set(invoiceIds);
   return state.reminders.filter(
      (reminder) =>
         ids.has(reminder.invoiceId) &&
         !isAfterDate(reminder.sentOn, today) &&
         diffDays(today, reminder.sentOn) <= CHASE_RECENT_REMINDER_DAYS,
   ).length;
}

/**
 * Why: priority = owed × days late × (1 + risk weight), minus the reminders
 * sent recently, so a family already chased this week drops down the queue.
 */
function toItem(state: StoreState, today: string, group: Group): ChaseItem {
   const family = state.families.find((f) => f.id === group.familyId);
   const { badge } = reliability(state, group.familyId, today);
   const recentReminders = countRecentReminders(state, group.invoiceIds, today);
   const weighted = group.owed * group.daysLate * (1 + RISK_WEIGHTS[badge]);
   return {
      familyId: group.familyId,
      familyName: family?.name ?? '',
      owed: group.owed,
      daysLate: group.daysLate,
      oldestDueDate: group.oldestDueDate,
      invoiceIds: group.invoiceIds,
      badge,
      recentReminders,
      score: Math.round(weighted) - recentReminders,
   };
}

/**
 * Why: ties go to the family with the older unpaid invoice (PRD §6), then to
 * the family id so the order is the same on every render.
 */
function compareChase(a: ChaseItem, b: ChaseItem): number {
   if (a.score !== b.score) return b.score - a.score;
   if (a.oldestDueDate !== b.oldestDueDate) {
      return a.oldestDueDate < b.oldestDueDate ? -1 : 1;
   }
   return a.familyId.localeCompare(b.familyId);
}

/**
 * Why: only invoices past their due date with money still owed enter the
 * queue; the ranked list drives the Today chase queue and the Owed board.
 */
export function chasePriority(state: StoreState, today: string): ChaseItem[] {
   const groups = new Map<string, Group>();
   for (const invoice of state.invoices) {
      if (!isBeforeDate(invoice.dueDate, today)) continue;
      const owed = outstandingOf(invoice, state.payments);
      if (owed === 0) continue;
      const group = groups.get(invoice.familyId) ?? {
         familyId: invoice.familyId,
         owed: 0,
         daysLate: 0,
         oldestDueDate: invoice.dueDate,
         invoiceIds: [],
      };
      group.owed += owed;
      group.daysLate = Math.max(group.daysLate, diffDays(today, invoice.dueDate));
      if (isBeforeDate(invoice.dueDate, group.oldestDueDate)) {
         group.oldestDueDate = invoice.dueDate;
      }
      group.invoiceIds.push(invoice.id);
      groups.set(invoice.familyId, group);
   }
   return [...groups.values()]
      .map((group) => toItem(state, today, group))
      .sort(compareChase);
}
