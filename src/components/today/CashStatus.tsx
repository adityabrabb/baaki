// Purpose: the Today cash line: cash in hand in Anton, then one sentence on what is still owed this month.
import { TODAY_COPY } from '../../lib/constants';
import { formatINR } from '../../lib/domain/formatINR';
import { BigRupee } from '../khata/BigRupee';

export interface CashStatusProps {
   balance: number;
   owedThisMonth: number;
}

/** Why: the tutor reads the cash figure first, then whether the month's fees still cover it. */
export function CashStatus({ balance, owedThisMonth }: CashStatusProps) {
   return (
      <section className="flex flex-col gap-2">
         <BigRupee amount={balance} label={TODAY_COPY.cashLabel} hero />
         <p className="font-hand text-2xl break-words text-ink">
            {`${formatINR(owedThisMonth)} ${TODAY_COPY.owedThisMonth}.`}
         </p>
      </section>
   );
}

