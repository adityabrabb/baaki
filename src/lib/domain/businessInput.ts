// Purpose: zod rules for the /settings business form: business name and UPI id (PRD §5 /settings).
// Pure: the UPI id is checked against one pattern from constants before it is stored.
import { z } from 'zod';
import {
   BUSINESS_ERRORS,
   NAME_MAX_LENGTH,
   UPI_ID_PATTERN,
} from '../constants';
import {
   type ParseResult,
   firstIssueErrors,
} from './formInput';

export interface BusinessDraft {
   name: string;
   upiId: string;
}

export type BusinessErrors = Partial<Record<keyof BusinessDraft, string>>;

/** Why: the name and UPI id go on every reminder, so both are checked before saving. */
export const businessInputSchema = z.object({
   name: z
      .string({ message: BUSINESS_ERRORS.nameRequired })
      .trim()
      .min(1, { message: BUSINESS_ERRORS.nameRequired })
      .max(NAME_MAX_LENGTH, { message: BUSINESS_ERRORS.nameTooLong }),
   upiId: z
      .string({ message: BUSINESS_ERRORS.upiInvalid })
      .trim()
      .regex(UPI_ID_PATTERN, { message: BUSINESS_ERRORS.upiInvalid }),
});

export type BusinessInput = z.infer<typeof businessInputSchema>;

/** Why: accepts unknown values so bad input becomes a field message, never a crash. */
export function parseBusinessDraft(
   draft: unknown,
): ParseResult<BusinessInput, BusinessErrors> {
   const result = businessInputSchema.safeParse(draft);
   if (result.success) return { success: true, data: result.data };
   return {
      success: false,
      errors: firstIssueErrors<BusinessDraft>(result.error),
   };
}
