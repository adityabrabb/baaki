// Purpose: the forecast's assumptions, listed so every number is read as an estimate.
import { FORECAST_COPY } from '../../lib/constants';

export interface AssumptionsListProps {
   items: string[];
}

/** Why: the forecast is an estimate, so its assumptions are always shown beside it. */
export function AssumptionsList({ items }: AssumptionsListProps) {
   return (
      <section className="flex flex-col gap-3">
         <h2 className="font-display text-2xl text-ink uppercase">
            {FORECAST_COPY.assumptionsTitle}
         </h2>
         <ul className="flex flex-col gap-2 list-disc pl-6 font-body text-base text-ink">
            {items.map((item) => (
               <li key={item}>{item}</li>
            ))}
         </ul>
      </section>
   );
}
