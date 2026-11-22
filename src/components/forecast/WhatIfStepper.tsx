// Purpose: labelled stepper (fewer / more) for "lose K students from next month", clamped to its range.
import {
   WHATIF_CONTROLS_COPY,
   WHATIF_CONTROL_STEP,
   WHATIF_MIN_VALUE,
   WHATIF_STEP_BUTTON_CLASS,
} from '../../lib/constants';

export interface WhatIfStepperProps {
   id: string;
   label: string;
   value: number;
   max: number;
   onChange: (value: number) => void;
}

/** Why: a stepper gives a whole-student count with 44px tap targets and no typing. */
export function WhatIfStepper({ id, label, value, max, onChange }: WhatIfStepperProps) {
   const set = (next: number) =>
      onChange(Math.min(max, Math.max(WHATIF_MIN_VALUE, next)));
   return (
      <div className="flex flex-col gap-2">
         <span id={id} className="font-hand text-lg text-ink">
            {label}
         </span>
         <div role="group" aria-labelledby={id} className="flex items-center gap-3">
            <button
               type="button"
               onClick={() => set(value - WHATIF_CONTROL_STEP)}
               disabled={value <= WHATIF_MIN_VALUE}
               className={WHATIF_STEP_BUTTON_CLASS}
            >
               {WHATIF_CONTROLS_COPY.stepperFewer}
            </button>
            <output aria-live="polite" className="min-w-11 text-center font-display text-2xl text-ink">
               {value}
            </output>
            <button
               type="button"
               onClick={() => set(value + WHATIF_CONTROL_STEP)}
               disabled={value >= max}
               className={WHATIF_STEP_BUTTON_CLASS}
            >
               {WHATIF_CONTROLS_COPY.stepperMore}
            </button>
         </div>
      </div>
   );
}
