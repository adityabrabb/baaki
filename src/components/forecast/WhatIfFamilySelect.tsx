// Purpose: labelled select of families for the "one family pays late" what-if.
import { INPUT_CLASS, WHATIF_CONTROLS_COPY, WHATIF_CONTROL_IDS } from '../../lib/constants';
import type { Family } from '../../lib/types';

export interface WhatIfFamilySelectProps {
   families: Family[];
   value: string;
   onChange: (familyId: string) => void;
}

/** Why: the what-if needs a named family, so the picker is a visible labelled select. */
export function WhatIfFamilySelect({ families, value, onChange }: WhatIfFamilySelectProps) {
   return (
      <div className="flex flex-col gap-2">
         <label htmlFor={WHATIF_CONTROL_IDS.family} className="font-body text-base text-ink">
            {WHATIF_CONTROLS_COPY.familyLabel}
         </label>
         <select
            id={WHATIF_CONTROL_IDS.family}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={INPUT_CLASS}
         >
            {families.map((family) => (
               <option key={family.id} value={family.id}>
                  {family.name}
               </option>
            ))}
         </select>
      </div>
   );
}
