// Purpose: one labelled form field: visible label, the control, and a friendly error line under it.
import type { ReactNode } from 'react';

export interface FormFieldProps {
   id: string;
   label: string;
   error?: string;
   children: ReactNode;
}

/** Why: every input gets a visible label and its error text, never placeholder-only. */
export function FormField({ id, label, error, children }: FormFieldProps) {
   return (
      <div className="flex flex-col gap-1">
         <label htmlFor={id} className="font-body text-sm font-semibold text-ink">
            {label}
         </label>
         {children}
         {error && (
            <p role="alert" className="font-body text-sm font-semibold text-margin-red">
               {error}
            </p>
         )}
      </div>
   );
}
