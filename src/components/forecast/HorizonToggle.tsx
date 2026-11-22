'use client';
// Purpose: 30 / 60 / 90 day toggle for the forecast chart; the active window is pressed.
import {
   DAY_WORDS,
   FOCUS_RING_CLASS,
   FORECAST_COPY,
} from '../../lib/constants';

export interface HorizonToggleProps {
   options: readonly number[];
   value: number;
   onChange: (days: number) => void;
}

/** Why: a toggle of buttons (not tabs) keeps each option a plain, labelled tap target. */
export function HorizonToggle({ options, value, onChange }: HorizonToggleProps) {
   return (
      <div role="group" aria-label={FORECAST_COPY.horizonLabel} className="flex flex-wrap gap-2">
         {options.map((days) => {
            const pressed = days === value;
            const state = pressed
               ? 'border-ink bg-marigold text-ink'
               : 'border-ink bg-chalk text-ink';
            return (
               <button
                  key={days}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => onChange(days)}
                  className={`min-h-11 min-w-11 border-2 px-4 font-body text-base font-bold shadow-[4px_4px_0_var(--ink)] ${state} ${FOCUS_RING_CLASS}`}
               >
                  {`${days} ${DAY_WORDS.many}`}
               </button>
            );
         })}
      </div>
   );
}
