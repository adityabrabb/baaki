// Purpose: the only money formatter; Indian digit grouping with the ₹ symbol (PRD §6).
// Pure: money is integer rupees; fractional input is rounded to whole rupees.
import {
   INR_FIRST_GROUP_SIZE,
   INR_GROUP_SEPARATOR,
   INR_LATER_GROUP_SIZE,
   INR_SYMBOL,
   NEGATIVE_SIGN,
} from '../constants';

/**
 * Why: the tutor reads money in lakhs (1,00,000), not western thousands, so the
 * last three digits group first and the rest group in twos.
 */
export function formatINR(amount: number): string {
   if (!Number.isFinite(amount)) {
      throw new RangeError(`Not a finite amount: ${amount}`);
   }
   const whole = Math.abs(Math.round(amount));
   const digits = String(whole);
   const split = digits.length - INR_FIRST_GROUP_SIZE;
   if (split <= 0) return withSign(amount, whole, digits);

   const groups: string[] = [digits.slice(split)];
   let rest = digits.slice(0, split);
   while (rest.length > INR_LATER_GROUP_SIZE) {
      const cut = rest.length - INR_LATER_GROUP_SIZE;
      groups.unshift(rest.slice(cut));
      rest = rest.slice(0, cut);
   }
   groups.unshift(rest);
   return withSign(amount, whole, groups.join(INR_GROUP_SEPARATOR));
}

/** Why: a minus sign goes before the symbol, and zero never shows one. */
function withSign(amount: number, whole: number, body: string): string {
   const sign = amount < 0 && whole !== 0 ? NEGATIVE_SIGN : '';
   return `${sign}${INR_SYMBOL}${body}`;
}
