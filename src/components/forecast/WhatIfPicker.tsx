'use client';
// Purpose: segmented buttons that choose the one active what-if (or Normal); the chart redraws from the choice.
import {
   FORECAST_WHATIF_CHIP_LABEL,
   FOCUS_RING_CLASS,
   WHATIF_LABELS,
   WHATIF_NORMAL_LABEL,
   WHATIF_PICKER_LABEL,
} from '../../lib/constants';
import type { WhatIfId } from '../../lib/domain/whatIf';

export interface WhatIfPickerProps {
   value: WhatIfId | null;
   onChange: (id: WhatIfId | null) => void;
}

const OPTIONS: { id: WhatIfId | null; label: string }[] = [
   { id: null, label: WHATIF_NORMAL_LABEL },
   { id: 'top_families_late', label: FORECAST_WHATIF_CHIP_LABEL },
   { id: 'family_late', label: WHATIF_LABELS.family_late },
   { id: 'lose_students', label: WHATIF_LABELS.lose_students },
   { id: 'raise_fees', label: WHATIF_LABELS.raise_fees },
];

/** Why: a segmented group makes "one scenario at a time" visible; the pressed one is active. */
export function WhatIfPicker({ value, onChange }: WhatIfPickerProps) {
   return (
      <div role="group" aria-label={WHATIF_PICKER_LABEL} className="flex flex-wrap gap-2">
         {OPTIONS.map((option) => {
            const pressed = option.id === value;
            const state = pressed
               ? 'border-ink bg-marigold text-ink'
               : 'border-dashed border-ink bg-chalk text-ink';
            return (
               <button
                  key={option.label}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => onChange(option.id)}
                  className={`min-h-11 rounded-full border-2 px-4 font-hand text-lg ${state} ${FOCUS_RING_CLASS}`}
               >
                  {option.label}
               </button>
            );
         })}
      </div>
   );
}
