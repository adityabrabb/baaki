// Purpose: checks the reminder text helper strips model links, appends the UPI link once, and keeps the length cap.
import { describe, expect, it } from 'vitest';
import { AI_MAX_REMINDER_CHARS } from '../../../src/lib/constants';
import { withPaymentLink } from '../../../src/lib/ai/reminderMessage';

const LINK = 'upi://pay?pa=priya.tutor%40upi&pn=Priya&am=1500&cu=INR';

describe('withPaymentLink', () => {
   it('strips a URL the model wrote and appends the exact link once', () => {
      const body = 'Please pay at https://pay.example/x today. Thank you.';
      const text = withPaymentLink(body, LINK, AI_MAX_REMINDER_CHARS);
      expect(text).toBe(`Please pay at today. Thank you. ${LINK}`);
      expect(text.split(LINK)).toHaveLength(2);
      expect(text).not.toContain('https://');
   });

   it('strips bare upi:// and wa.me links the model wrote', () => {
      const body = 'Pay upi://pay?pa=x or wa.me/919000000000 now.';
      const text = withPaymentLink(body, LINK, AI_MAX_REMINDER_CHARS);
      expect(text.endsWith(LINK)).toBe(true);
      expect(text.split(LINK)).toHaveLength(2);
      expect(text).not.toContain('wa.me');
      expect(text).not.toContain('upi://pay?pa=x');
   });

   it('still ends with the UPI link when the model text has no link', () => {
      const text = withPaymentLink('Namaste, the fee is due.', LINK, AI_MAX_REMINDER_CHARS);
      expect(text).toBe(`Namaste, the fee is due. ${LINK}`);
   });

   it('keeps the whole message within the length cap and never cuts the link', () => {
      const body = 'a'.repeat(1000);
      const text = withPaymentLink(body, LINK, AI_MAX_REMINDER_CHARS);
      expect(text.length).toBeLessThanOrEqual(AI_MAX_REMINDER_CHARS);
      expect(text.endsWith(LINK)).toBe(true);
   });

   it('returns an empty string when the model text is only a link', () => {
      expect(withPaymentLink('https://example.com', LINK, AI_MAX_REMINDER_CHARS)).toBe('');
   });
});
