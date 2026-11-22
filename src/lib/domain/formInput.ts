// Purpose: shared helpers for form inputs: zod issues to one message per field, and text to number.
// Pure: no React, no storage; callers pass the raw values in.
import type { z } from 'zod';

/** Why: the result of a parse: the clean data, or one friendly message per field. */
export type ParseResult<Data, Errors> =
   | { success: true; data: Data }
   | { success: false; errors: Errors };

/** Why: the form shows one message under each field, so only the first issue per field is kept. */
export function firstIssueErrors<T extends object>(
   error: z.ZodError,
): Partial<Record<keyof T, string>> {
   const errors: Partial<Record<keyof T, string>> = {};
   for (const issue of error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && errors[key as keyof T] === undefined) {
         errors[key as keyof T] = issue.message;
      }
   }
   return errors;
}

/** Why: an empty number box must fail as "not a number", not quietly become 0. */
export function numberOrNull(text: string): number | null {
   return text.trim() === '' ? null : Number(text);
}
