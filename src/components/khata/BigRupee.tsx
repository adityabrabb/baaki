// Purpose: a big Anton rupee figure with a marigold underline swipe, for totals and balances.
import { formatINR } from '../../lib/domain/formatINR';

export interface BigRupeeProps {
   amount: number;
   label?: string;
   hero?: boolean;
}

/** Why: money always goes through formatINR, so the ₹ and lakh grouping match everywhere. */
export function BigRupee({ amount, label, hero = false }: BigRupeeProps) {
   // Why: the Today cash hero is 1.5x the standard size so it reads first.
   const sizeClass = hero ? 'text-[4.5rem]' : 'text-5xl';
   return (
      <p className={`font-display ${sizeClass} leading-none text-ink`}>
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

