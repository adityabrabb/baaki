// Purpose: zod rules for the add/edit student form; every form value is checked before it is stored (PRD §5).
import { z } from 'zod';
import {
   BATCH_NAMES,
   CLASS_MAX,
   CLASS_MIN,
   FEE_MAX,
   FEE_MIN,
   NAME_MAX_LENGTH,
   STUDENT_ERRORS,
} from '../constants';

/** Why: the raw form values after type conversion; the schema decides if they are acceptable. */
export interface StudentDraft {
   name: string;
   familyName: string;
   batch: string;
   classLevel: number;
   feeAmount: number;
}

export const studentInputSchema = z.object({
   name: z
      .string()
      .trim()
      .min(1, STUDENT_ERRORS.nameRequired)
      .max(NAME_MAX_LENGTH, STUDENT_ERRORS.nameTooLong),
   familyName: z
      .string()
      .trim()
      .min(1, STUDENT_ERRORS.familyRequired)
      .max(NAME_MAX_LENGTH, STUDENT_ERRORS.familyTooLong),
   batch: z.enum(BATCH_NAMES, { message: STUDENT_ERRORS.batchInvalid }),
   classLevel: z
      .number()
      .int(STUDENT_ERRORS.classRange)
      .min(CLASS_MIN, STUDENT_ERRORS.classRange)
      .max(CLASS_MAX, STUDENT_ERRORS.classRange),
   feeAmount: z
      .number()
      .int(STUDENT_ERRORS.feeRange)
      .min(FEE_MIN, STUDENT_ERRORS.feeRange)
      .max(FEE_MAX, STUDENT_ERRORS.feeRange),
});

export type StudentInput = z.infer<typeof studentInputSchema>;
export type StudentErrors = Partial<Record<keyof StudentDraft, string>>;

export type StudentParseResult =
   | { success: true; data: StudentInput }
   | { success: false; errors: StudentErrors };

/** Why: returns one friendly message per field, so the form can point at each bad input. */
export function parseStudentDraft(draft: StudentDraft): StudentParseResult {
   const result = studentInputSchema.safeParse(draft);
   if (result.success) return { success: true, data: result.data };
   const errors: StudentErrors = {};
   for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && errors[key as keyof StudentDraft] === undefined) {
         errors[key as keyof StudentDraft] = issue.message;
      }
   }
   return { success: false, errors };
}
