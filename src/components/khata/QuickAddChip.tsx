// Purpose: the confirm chip under quick-add: says what will be saved, asks for the method when missing, and offers Confirm or Cancel.
import {
   FOCUS_RING_CLASS,
   PAYMENT_METHOD_LABELS,
   PAYMENT_METHODS,
   QUICK_ADD_CANCEL_LABEL,
   QUICK_ADD_CONFIRM_LABEL,
   QUICK_ADD_METHOD_TITLE,
} from '../../lib/constants';
import type { PaymentMethod } from '../../lib/types';

export interface QuickAddChipProps {
   summary: string;
   method: PaymentMethod | null;
   showMethods: boolean;
   canConfirm: boolean;
   reason: string | null;
   onMethod: (method: PaymentMethod) => void;
   onConfirm: () => void;
   onCancel: () => void;
}

/** Why: nothing is saved until the tutor confirms, and the chip says why Confirm is off. */
export function QuickAddChip({
   summary,
   method,
   showMethods,
   canConfirm,
   reason,
   onMethod,
   onConfirm,
   onCancel,
}: QuickAddChipProps) {
   return (
      <div className="flex flex-col gap-3 border-2 border-ink bg-chalk p-4 shadow-[4px_4px_0_var(--ink)]">
         <p className="font-hand text-xl break-words text-ink">{summary}</p>
         {showMethods && (
            <fieldset className="flex flex-col gap-2">
               <legend className="font-body text-sm font-semibold text-ink">
                  {QUICK_ADD_METHOD_TITLE}
               </legend>
               <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((option) => (
                     <button
                        key={option}
                        type="button"
                        aria-pressed={method === option}
                        onClick={() => onMethod(option)}
                        className={`min-h-11 min-w-11 border-2 border-ink px-4 font-body font-semibold ${method === option ? 'bg-ink text-chalk' : 'bg-paper text-ink'} ${FOCUS_RING_CLASS}`}
                     >
                        {PAYMENT_METHOD_LABELS[option]}
                     </button>
                  ))}
               </div>
            </fieldset>
         )}
         {reason && <p className="font-body text-sm text-ink-soft">{reason}</p>}
         <div className="flex flex-wrap gap-3">
            <button
               type="button"
               onClick={onConfirm}
               disabled={!canConfirm}
               className={`min-h-11 min-w-11 border-2 border-ink bg-ink px-4 font-body font-semibold text-chalk shadow-[4px_4px_0_var(--ink)] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_RING_CLASS}`}
            >
               {QUICK_ADD_CONFIRM_LABEL}
            </button>
            <button
               type="button"
               onClick={onCancel}
               className={`min-h-11 min-w-11 border-2 border-ink bg-chalk px-4 font-body font-semibold text-ink ${FOCUS_RING_CLASS}`}
            >
               {QUICK_ADD_CANCEL_LABEL}
            </button>
         </div>
      </div>
   );
}
