// Purpose: /pricing route (PRD §5, §10): proposed plans, the ROI line, who pays and why switch from the notebook.
import { PageHeading } from '../../components/khata/PageHeading';
import { formatINR } from '../../lib/domain/formatINR';
import { PAGE_COPY, PRICING_COPY, PRICING_PLANS } from '../../lib/constants';

/** Why: proposed prices are labelled as such, so no plan reads as a live offer. */
export default function PricingPage() {
   return (
      <>
         <PageHeading title={PAGE_COPY.pricing.title} />
         <section aria-labelledby="pricing-label" className="mt-6 flex flex-col gap-6">
            <p id="pricing-label" className="font-hand text-xl text-ink">
               {PRICING_COPY.label}
            </p>
            <ul className="grid gap-4 md:grid-cols-3">
               {PRICING_PLANS.map((plan) => {
                  const highlight = plan.id === 'pro';
                  return (
                     <li
                        key={plan.id}
                        className={`flex flex-col gap-3 border-2 border-ink p-5 shadow-[4px_4px_0_var(--ink)] ${highlight ? 'bg-marigold' : 'bg-chalk'}`}
                     >
                        <h2 className="font-display text-3xl text-ink uppercase">
                           {plan.name}
                        </h2>
                        <p className="font-display text-4xl text-ink">
                           {formatINR(plan.monthlyRupees)}
                           <span className="font-body text-base">
                              {plan.monthlyRupees === 0 ? '' : PRICING_COPY.perMonth}
                           </span>
                        </p>
                        <p className="font-body text-base text-ink">{plan.summary}</p>
                     </li>
                  );
               })}
            </ul>
            <p className="border-2 border-dashed border-ink-soft bg-chalk/70 p-4 font-hand text-xl text-ink">
               {PRICING_COPY.roi}
            </p>
            <section className="flex flex-col gap-2">
               <h2 className="font-display text-2xl text-ink uppercase">
                  {PRICING_COPY.whoPaysTitle}
               </h2>
               <p className="font-body text-base text-ink">{PRICING_COPY.whoPays}</p>
            </section>
            <section className="flex flex-col gap-2">
               <h2 className="font-display text-2xl text-ink uppercase">
                  {PRICING_COPY.whySwitchTitle}
               </h2>
               <p className="font-body text-base text-ink">{PRICING_COPY.whySwitch}</p>
            </section>
            <p className="font-body text-sm text-ink-soft">{PRICING_COPY.assumption}</p>
         </section>
      </>
   );
}
