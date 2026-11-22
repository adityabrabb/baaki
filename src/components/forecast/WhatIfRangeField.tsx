// Purpose: labelled range slider for a what-if value; the label carries the live number.
import { WHATIF_CONTROL_STEP, WHATIF_MIN_VALUE } from '../../lib/constants';

export interface WhatIfRangeFieldProps {
   id: string;
   label: string;
   value: number;
   max: number;
   onChange: (value: number) => void;
}

/** Why: a slider is the PRD control for "pays N days late" and "raise fees X%". */
export function WhatIfRangeField({ id, label, value, max, onChange }: WhatIfRangeFieldProps) {
   return (
      <div className="flex flex-col gap-2">
         <label htmlFor={id} className="font-hand text-lg text-ink">
            {label}
         </label>
         <input
            id={id}
            type="range"
            min={WHATIF_MIN_VALUE}
            max={max}
            step={WHATIF_CONTROL_STEP}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="min-h-11 w-full accent-ink"
         />
      </div>
   );
}
