// Purpose: tests for the template reminder text (PRD §5 /owed): fills every token, keeps names literal.
import { describe, expect, it } from 'vitest';
import { formatINR } from '../../../src/lib/domain/formatINR';
import { reminderText } from '../../../src/lib/domain/reminderText';

describe('reminderText', () => {
   it('fills family, amount, days and business into the template', () => {
      const text = reminderText({
         familyName: 'Kulkarni family',
         amount: 1500,
         daysLate: 8,
         businessName: "Priya's Maths Classes",
      });
      expect(text).toBe(
         `Hello Kulkarni family, the fee of ${formatINR(1500)} is 8 days past due. Please pay when you can. Thank you, Priya's Maths Classes.`,
      );
   });

   it('keeps a dollar sign in a name literal', () => {
      const text = reminderText({
         familyName: 'A$B family',
         amount: 0,
         daysLate: 0,
         businessName: 'Tutor',
      });
      expect(text).toContain('Hello A$B family');
   });

   it('writes zero days late as 0, not blank', () => {
      const text = reminderText({
         familyName: 'Joshi family',
         amount: 2000,
         daysLate: 0,
         businessName: 'Tutor',
      });
      expect(text).toContain('is 0 days past due');
   });
});
