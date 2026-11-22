// Purpose: rotated rubber-stamp status label; the text carries the meaning, colour only reinforces it.
import { STAMP_LABELS, type STAMP_VARIANTS } from '../../lib/constants';

export type StampVariant = (typeof STAMP_VARIANTS)[number];

const VARIANT_CLASSES: Record<StampVariant, string> = {
   paid: 'border-stamp-green text-stamp-green',
   overdue: 'border-stamp-red text-stamp-red',
   part_paid: 'border-ink bg-mustard text-ink',
   raised: 'border-ink text-ink',
   covered: 'border-stamp-green text-stamp-green',
   tight: 'border-ink bg-mustard text-ink',
   not_covered: 'border-stamp-red text-stamp-red',
};

/** Why: a static stamp with no animation, so reduced-motion users see the same label. */
export function Stamp({ variant }: { variant: StampVariant }) {
   return (
      <span
         className={`inline-block -rotate-3 border-2 bg-chalk px-2 py-0.5 font-body text-xs font-bold tracking-wider uppercase ${VARIANT_CLASSES[variant]}`}
      >
         {STAMP_LABELS[variant]}
      </span>
   );
}

