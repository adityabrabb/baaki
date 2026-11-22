// Purpose: cleans a model's reminder body and joins it to the exact UPI link within the length cap (PRD §7).
// Pure: every value is passed in; no network, env or clock.
import {
   REMINDER_LINK_PATTERN,
   REMINDER_LINK_SEPARATOR,
   REMINDER_WHITESPACE_PATTERN,
} from '../constants';

/** Why: the model must not write links; any URL it does write is removed before our link is added. */
export function stripLinks(text: string): string {
   return text
      .replace(REMINDER_LINK_PATTERN, ' ')
      .replace(REMINDER_WHITESPACE_PATTERN, ' ')
      .trim();
}

/**
 * Why: the payment link is never truncated, so the body gives up characters
 * first; the result never exceeds maxChars. An empty body yields ''.
 */
export function withPaymentLink(
   body: string,
   link: string,
   maxChars: number,
): string {
   const cleaned = stripLinks(body);
   if (cleaned === '') return '';
   const room = maxChars - link.length - REMINDER_LINK_SEPARATOR.length;
   const kept = cleaned.slice(0, Math.max(0, room)).trimEnd();
   if (kept === '') return '';
   return `${kept}${REMINDER_LINK_SEPARATOR}${link}`;
}
