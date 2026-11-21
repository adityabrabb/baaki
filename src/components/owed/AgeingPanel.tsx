// Purpose: the 0-7 / 8-30 / 30+ day ageing buckets on /owed, each with its open count and total.
import { OWED_COPY } from '../../lib/constants';
import type { AgeingBucket } from '../../lib/domain/ageing';
import { formatINR } from '../../lib/domain/formatINR';

export interface AgeingPanelProps {
   buckets: AgeingBucket[];
}

/** Why: the tutor sees how stale the debt is before choosing whom to chase. */
export function AgeingPanel({ buckets }: AgeingPanelProps) {
   return (
      <section aria-label={OWED_COPY.bucketsTitle} className="flex flex-col gap-3">
         <h2 className="font-display text-2xl text-ink uppercase">
            {OWED_COPY.bucketsTitle}
         </h2>
         <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {buckets.map((bucket) => (
               <li
                  key={bucket.id}
                  className="border-2 border-ink bg-chalk p-3"
               >
                  <p className="font-body text-sm font-semibold text-ink">
                     {bucket.label}
                  </p>
                  <p className="font-display text-2xl leading-none text-ink">
                     {formatINR(bucket.total)}
                  </p>
                  <p className="font-body text-sm text-ink-soft">
                     {bucket.count} {OWED_COPY.bucketCountLabel}
                  </p>
               </li>
            ))}
         </ul>
      </section>
   );
}
