'use client';
// Purpose: the what-if chip that redraws the forecast line; it never changes stored data.
import { FOCUS_RING_CLASS, FORECAST_WHATIF_CHIP_LABEL } from '../../lib/constants';

export interface WhatIfChipProps {
   pressed: boolean;
   onToggle: () => void;
}

/** Why: a pressed toggle button says the what-if is on, and the label names the scenario. */
export function WhatIfChip({ pressed, onToggle }: WhatIfChipProps) {
   const state = pressed
      ? 'border-ink bg-marigold text-ink'
      : 'border-dashed border-ink bg-chalk text-ink';
   return (
      <button
         type="button"
         aria-pressed={pressed}
         onClick={onToggle}
         className={`min-h-11 self-start rounded-full border-2 px-4 font-hand text-lg ${state} ${FOCUS_RING_CLASS}`}
      >
         {FORECAST_WHATIF_CHIP_LABEL}
      </button>
   );
}
