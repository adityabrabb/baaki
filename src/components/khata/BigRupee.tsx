// Purpose: a big Anton rupee figure with a marigold underline swipe, for totals and balances.
import { formatINR } from '../../lib/domain/formatINR';

export interface BigRupeeProps {
   amount: number;
   label?: string;
}

/** Why: money always goes through formatINR, so the ₹ and lakh grouping match everywhere. */
export function BigRupee({ amount, label }: BigRupeeProps) {
   return (
      <p className="font-display text-5xl leading-none text-ink">
         {label ? (
            <span className="block font-body text-sm font-semibold">
               {label}
            </span>
         ) : null}
         <span className="relative inline-block">
            <span
               aria-hidden="true"
               className="absolute inset-x-0 bottom-0 h-3 bg-marigold"
            />
            <span className="relative">{formatINR(amount)}</span>
         </span>
      </p>
   );
}

