'use client';
// Purpose: client body of the Today page: one store read feeds the cash line, next bill, chase queue, alerts and quick-add.
import {
   PAGE_COPY,
   STORE_ERROR_COPY,
   TODAY_CHASE_LIMIT,
   TODAY_COPY,
} from '../../lib/constants';
import { alerts } from '../../lib/domain/alerts';
import { cashStatus } from '../../lib/domain/cashStatus';
import { chasePriority } from '../../lib/domain/chasePriority';
import { nextBill } from '../../lib/domain/nextBill';
import { useStore } from '../../lib/store/useStore';
import { EmptyNote } from '../khata/EmptyNote';
import { QuickAdd } from '../khata/QuickAdd';
import { CashStatus } from './CashStatus';
import { NextBillCard } from './NextBillCard';
import { TodayAlerts } from './TodayAlerts';
import { TodayChaseQueue } from './TodayChaseQueue';

/** Why: one read of the store keeps every Today figure on the same numbers. */
export function TodayView() {
   const { state, today } = useStore();
   if (!state || !today) {
      return <EmptyNote text={STORE_ERROR_COPY} role="alert" />;
   }

   const cash = cashStatus(state, today);
   const bill = nextBill(state, today);
   const queue = chasePriority(state, today);
   const top = queue.slice(0, TODAY_CHASE_LIMIT);

   return (
      <div className="mt-6 flex flex-col gap-8">
         <CashStatus balance={cash.balance} owedThisMonth={cash.owedThisMonth} />
         {bill ? <NextBillCard bill={bill} /> : <EmptyNote text={TODAY_COPY.noBill} />}
         <section className="flex flex-col gap-3">
            <h2 className="font-display text-2xl text-ink uppercase">
               {TODAY_COPY.chaseTitle}
            </h2>
            {top.length === 0 ? (
               <EmptyNote text={PAGE_COPY.today.empty} />
            ) : (
               <TodayChaseQueue state={state} today={today} items={top} />
            )}
            {queue.length > TODAY_CHASE_LIMIT && (
               <p className="font-body text-sm text-ink-soft">{TODAY_COPY.chaseMore}</p>
            )}
         </section>
         <TodayAlerts alerts={alerts(state, today)} />
         <QuickAdd />
      </div>
   );
}

