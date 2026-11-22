// Purpose: date-only helpers on 'YYYY-MM-DD' strings (Asia/Kolkata convention).
// Callers pass `today` in; nothing here reads the clock or uses new Date(string).
import {
   addDays as addCalendarDays,
   addMonths as addCalendarMonths,
   differenceInCalendarDays,
   endOfMonth,
   format,
   getDate,
   isValid,
   parseISO,
   startOfMonth,
} from 'date-fns';
import {
   DATE_FORMAT,
   DATE_ONLY_PATTERN,
   DAY_LABEL_FORMAT,
   DAY_WORDS,
   FIRST_DAY_OF_MONTH,
   MONTH_FORMAT,
   MONTH_KEY_PATTERN,
   RELATIVE_FUTURE_PREFIX,
   RELATIVE_PAST_SUFFIX,
   RELATIVE_TODAY,
   ROW_SEPARATOR,
   TIMEZONE,
} from './constants';

/** Why: validate before parsing so bad input fails loudly, not silently. */
export function isDateOnly(value: string): boolean {
   return DATE_ONLY_PATTERN.test(value) && isValid(parseISO(value));
}

/** Why: 'YYYY-MM' keys group invoices by month; same validation rule. */
export function isMonthKey(value: string): boolean {
   return MONTH_KEY_PATTERN.test(value);
}

/** Why: parseISO reads a bare date as local midnight, avoiding UTC drift. */
export function parseDateOnly(value: string): Date {
   if (!isDateOnly(value)) {
      throw new RangeError(`Not a YYYY-MM-DD date: ${value}`);
   }
   return parseISO(value);
}

/** Why: converts a local-calendar Date back to the stored string form. */
export function toDateOnly(date: Date): string {
   return format(date, DATE_FORMAT);
}

/** Why: the tutor's day is the Kolkata calendar day, whatever the host zone. */
export function kolkataDateOf(instant: Date): string {
   const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
   }).formatToParts(instant);
   const pick = (type: string): string =>
      parts.find((part) => part.type === type)?.value ?? '';
   return `${pick('year')}-${pick('month')}-${pick('day')}`;
}

/** Why: due dates and expected pay dates are whole-day shifts. */
export function addDays(value: string, days: number): string {
   return toDateOnly(addCalendarDays(parseDateOnly(value), days));
}

/** Why: ageing and forecast need whole calendar days; returns later - earlier. */
export function diffDays(later: string, earlier: string): number {
   return differenceInCalendarDays(
      parseDateOnly(later),
      parseDateOnly(earlier),
   );
}

/** Why: invoices and bills are grouped by their 'YYYY-MM' month. */
export function monthKeyOf(value: string): string {
   return format(parseDateOnly(value), MONTH_FORMAT);
}

/** Why: the first day of a date's month, e.g. for the raised-on date. */
export function monthStart(value: string): string {
   return toDateOnly(startOfMonth(parseDateOnly(value)));
}

/** Why: the last day of a date's month, e.g. for month-end forecast cuts. */
export function monthEnd(value: string): string {
   return toDateOnly(endOfMonth(parseDateOnly(value)));
}

/** Why: moves by whole months and clamps the day (31 Jan + 1 month = 28 Feb). */
export function addMonths(value: string, months: number): string {
   return toDateOnly(addCalendarMonths(parseDateOnly(value), months));
}

/**
 * Why: builds a due date such as the 5th of a month; a day past month end
 * (e.g. 31 in February) is clamped to the last day, so leap years work.
 */
export function dateInMonth(monthKey: string, day: number): string {
   if (!isMonthKey(monthKey)) {
      throw new RangeError(`Not a YYYY-MM month key: ${monthKey}`);
   }
   const first = `${monthKey}-${String(FIRST_DAY_OF_MONTH).padStart(2, '0')}`;
   const lastDay = getDate(parseDateOnly(monthEnd(first)));
   const clamped = Math.min(Math.max(day, FIRST_DAY_OF_MONTH), lastDay);
   return `${monthKey}-${String(clamped).padStart(2, '0')}`;
}

/** Why: "3 days" or "1 day" with the right plural, for relative day phrases. */
function dayCount(n: number): string {
   return `${n} ${n === 1 ? DAY_WORDS.one : DAY_WORDS.many}`;
}

/** Why: "in 9 days" reads faster than a raw date; today is passed in, never read here. */
export function relativeDays(date: string, today: string): string {
   const n = diffDays(date, today);
   if (n === 0) return RELATIVE_TODAY;
   if (n > 0) return `${RELATIVE_FUTURE_PREFIX} ${dayCount(n)}`;
   return `${dayCount(-n)} ${RELATIVE_PAST_SUFFIX}`;
}

/** Why: the one date display on Today, e.g. "1 Dec · in 9 days". */
export function dayLabel(date: string, today: string): string {
   const day = format(parseDateOnly(date), DAY_LABEL_FORMAT);
   return `${day}${ROW_SEPARATOR}${relativeDays(date, today)}`;
}

/** Why: ISO date strings sort correctly as text once validated. */
export function isBeforeDate(a: string, b: string): boolean {
   return parseDateOnly(a) < parseDateOnly(b);
}

/** Why: the mirror of isBeforeDate, for "due after today" checks. */
export function isAfterDate(a: string, b: string): boolean {
   return parseDateOnly(a) > parseDateOnly(b);
}
