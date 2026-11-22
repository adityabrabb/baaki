// Purpose: zod rules for the /bills inputs: one recurring bill, and the opening balance and buffer (PRD §5 /bills).
// Pure: every value is checked here before the store is touched.
import { z } from 'zod';
import {
   BILL_DAY_MAX,
   BILL_DAY_MIN,
   BILL_ERRORS,
   NAME_MAX_LENGTH,
} from '../constants';
import {
   type ParseResult,
   firstIssueErrors,
} from './formInput';

export interface BillDraft {
   name: string;
   amount: number;
   dayOfMonth: number;
}

export interface BalanceDraft {
   openingBalance: number;
   buffer: number;
}

export type BillErrors = Partial<Record<keyof BillDraft, string>>;
export type BalanceErrors = Partial<Record<keyof BalanceDraft, string>>;

/** Why: a bill needs a name, a positive whole-rupee amount, and a due day every month has. */
export const billInputSchema = z.object({
   name: z
      .string({ message: BILL_ERRORS.nameRequired })
      .trim()
      .min(1, { message: BILL_ERRORS.nameRequired })
      .max(NAME_MAX_LENGTH, { message: BILL_ERRORS.nameTooLong }),
   amount: z
      .number({ message: BILL_ERRORS.wholeRupees })
      .int({ message: BILL_ERRORS.wholeRupees })
      .positive({ message: BILL_ERRORS.amountPositive }),
   dayOfMonth: z
      .number({ message: BILL_ERRORS.dayRange })
      .int({ message: BILL_ERRORS.dayRange })
      .min(BILL_DAY_MIN, { message: BILL_ERRORS.dayRange })
      .max(BILL_DAY_MAX, { message: BILL_ERRORS.dayRange }),
});

/** Why: opening cash and the buffer are whole rupees and may be zero, never negative. */
export const balanceInputSchema = z.object({
   openingBalance: z
      .number({ message: BILL_ERRORS.wholeRupees })
      .int({ message: BILL_ERRORS.wholeRupees })
      .nonnegative({ message: BILL_ERRORS.balanceNegative }),
   buffer: z
      .number({ message: BILL_ERRORS.wholeRupees })
      .int({ message: BILL_ERRORS.wholeRupees })
      .nonnegative({ message: BILL_ERRORS.balanceNegative }),
});

export type BillInput = z.infer<typeof billInputSchema>;
export type BalanceInput = z.infer<typeof balanceInputSchema>;

/** Why: accepts unknown values so a wrong type becomes a friendly field error, not a crash. */
export function parseBillDraft(
   draft: unknown,
): ParseResult<BillInput, BillErrors> {
   const result = billInputSchema.safeParse(draft);
   if (result.success) return { success: true, data: result.data };
   return { success: false, errors: firstIssueErrors<BillDraft>(result.error) };
}

/** Why: the opening balance and buffer are checked together, one message per box. */
export function parseBalanceDraft(
   draft: unknown,
): ParseResult<BalanceInput, BalanceErrors> {
   const result = balanceInputSchema.safeParse(draft);
   if (result.success) return { success: true, data: result.data };
   return {
      success: false,
      errors: firstIssueErrors<BalanceDraft>(result.error),
   };
}
