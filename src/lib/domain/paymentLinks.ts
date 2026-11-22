// Purpose: UPI and WhatsApp click-to-chat links for reminders (PRD §5, §7). Demo helpers: they do not collect money.
// Pure: no reads of env or clock; every value is passed in.
import {
   COUNTRY_CODE,
   LOCAL_NUMBER_LENGTH,
   NON_DIGITS_PATTERN,
   UPI_CURRENCY,
   UPI_SCHEME,
   WHATSAPP_BASE,
} from '../constants';

/** Why: a one-tap UPI link for the parent; the amount is whole rupees. */
export function upiLink(upiId: string, payee: string, amount: number): string {
   const query = [
      `pa=${encodeURIComponent(upiId)}`,
      `pn=${encodeURIComponent(payee)}`,
      `am=${amount}`,
      `cu=${UPI_CURRENCY}`,
   ].join('&');
   return `${UPI_SCHEME}?${query}`;
}

/** Why: wa.me needs digits only and the country code; a bare 10-digit number gets 91 added. */
export function whatsappDigits(phone: string): string {
   const digits = phone.replace(NON_DIGITS_PATTERN, '');
   return digits.length === LOCAL_NUMBER_LENGTH ? `${COUNTRY_CODE}${digits}` : digits;
}

/** Why: click-to-chat opens WhatsApp with the draft already typed; nothing is sent by Baaki. */
export function whatsappLink(phone: string, text: string): string {
   return `${WHATSAPP_BASE}${whatsappDigits(phone)}?text=${encodeURIComponent(text)}`;
}
