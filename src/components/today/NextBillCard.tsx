// Purpose: the next bill card: name, amount, due date and a COVERED or NOT COVERED stamp whose text carries the verdict.
import { TODAY_COPY } from '../../lib/constants';
import { formatINR } from '../../lib/domain/formatINR';
import type { NextBill } from '../../lib/domain/nextBill';
import { Stamp } from '../khata/Stamp';

export interface NextBillCardProps {
   bill: NextBill;
}

/** Why: the stamp answers "covered?" in words, so colour is never the only signal. */
export function NextBillCard({ bill }: NextBillCardProps) {
   return (
      <article className="min-w-0 border-2 border-ink bg-chalk p-4 shadow-[4px_4px_0_var(--ink)]">
         <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="min-w-0 font-display text-2xl text-ink uppercase break-words">
               {TODAY_COPY.billTitle}
            </h2>
            <Stamp variant={bill.covered ? 'covered' : 'not_covered'} />
         </div>
         <p className="mt-2 font-hand text-2xl break-words text-ink">{bill.name}</p>
         <p className="font-display text-3xl leading-none text-ink">
            {formatINR(bill.amount)}
         </p>
         <p className="font-body text-sm text-ink-soft">
            {`${TODAY_COPY.billDue} ${bill.date}`}
         </p>
         <p className="mt-2 font-body text-sm text-ink">
            {bill.covered ? TODAY_COPY.billCovered : TODAY_COPY.billNotCovered}
         </p>
      </article>
   );
}

