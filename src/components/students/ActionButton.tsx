// Purpose: khata button with a 44px tap target; primary is ink-filled, secondary is outlined on chalk.
import type { ButtonHTMLAttributes } from 'react';
import { FOCUS_RING_CLASS } from '../../lib/constants';

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: 'primary' | 'secondary';
}

const VARIANT_CLASSES = {
   primary: 'bg-ink text-chalk',
   secondary: 'bg-chalk text-ink',
} as const;

/** Why: one button look for every students action, so raise, add, save and edit match. */
export function ActionButton({
   variant = 'primary',
   type = 'button',
   className = '',
   ...rest
}: ActionButtonProps) {
   return (
      <button
         type={type}
         {...rest}
         className={`min-h-11 min-w-11 border-2 border-ink px-4 font-body text-base font-bold ${VARIANT_CLASSES[variant]} ${FOCUS_RING_CLASS} ${className}`}
      />
   );
}
