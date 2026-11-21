// Purpose: the notebook-line quick-add field with a pen icon; UI only, parsing and saving come later.
import {
   FOCUS_RING_CLASS,
   QUICK_ADD_DISABLED_REASON,
   QUICK_ADD_ID,
   QUICK_ADD_LABEL,
   QUICK_ADD_PLACEHOLDER,
   QUICK_ADD_SUBMIT_LABEL,
} from '../../lib/constants';
import { PenIcon } from './PenIcon';

const REASON_ID = `${QUICK_ADD_ID}-reason`;

/** Why: no submit logic yet, so the Add button is visibly disabled with its reason. */
export function QuickAdd() {
   return (
      <div className="mt-6">
         <label
            htmlFor={QUICK_ADD_ID}
            className="block font-body text-sm font-semibold text-ink"
         >
            {QUICK_ADD_LABEL}
         </label>
         <div className="mt-2 flex items-center gap-2 border-b-2 border-ink bg-chalk px-3">
            <PenIcon />
            <input
               id={QUICK_ADD_ID}
               type="text"
               autoComplete="off"
               placeholder={QUICK_ADD_PLACEHOLDER}
               aria-describedby={REASON_ID}
               className={`min-h-11 min-w-0 flex-1 bg-transparent font-hand text-xl text-ink placeholder:text-ink-soft ${FOCUS_RING_CLASS}`}
            />
            <button
               type="button"
               disabled
               aria-describedby={REASON_ID}
               className="min-h-11 min-w-11 border-2 border-dashed border-ink-soft px-3 font-body text-sm font-semibold text-ink-soft disabled:cursor-not-allowed"
            >
               {QUICK_ADD_SUBMIT_LABEL}
            </button>
         </div>
         <p id={REASON_ID} className="mt-2 font-hand text-base text-ink-soft">
            {QUICK_ADD_DISABLED_REASON}
         </p>
      </div>
   );
}

