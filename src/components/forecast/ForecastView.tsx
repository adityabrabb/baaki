'use client';
// Purpose: client view for /forecast: window toggle, what-if chip, chart, legend, lowest-balance sentence and assumptions.
import { useState } from 'react';
import {
   FORECAST_COPY,
   FORECAST_DEFAULT_WINDOW,
   FORECAST_WINDOWS,
   PAGE_COPY,
   STORE_ERROR_COPY,
} from '../../lib/constants';
import { useStore } from '../../lib/store/useStore';
import type { StoreState } from '../../lib/types';
import { EmptyNote } from '../khata/EmptyNote';
import { AssumptionsList } from './AssumptionsList';
import { buildForecastModel, type ForecastModel } from './forecastModel';
import { ForecastChart } from './ForecastChart';
import { ChartLegend } from './ChartLegend';
import { HorizonToggle } from './HorizonToggle';
import { WhatIfChip } from './WhatIfChip';

/** Why: a forecast means little until there are invoices or active bills to project. */
function hasCashData(state: StoreState): boolean {
   return state.invoices.length > 0 || state.bills.some((bill) => bill.active);
}

/** Why: the page reads the store only; the what-if is a view toggle, never a write. */
export function ForecastView() {
   const { state, today } = useStore();
   const [windowSize, setWindowSize] = useState<number>(FORECAST_DEFAULT_WINDOW);
   const [whatIfOn, setWhatIfOn] = useState(false);

   if (!state || !today) {
      return <EmptyNote text={STORE_ERROR_COPY} role="alert" />;
   }
   if (!hasCashData(state)) {
      return <EmptyNote text={PAGE_COPY.forecast.empty} />;
   }

   let model: ForecastModel;
   try {
      model = buildForecastModel(state, today, windowSize, whatIfOn);
   } catch {
      return <EmptyNote text={FORECAST_COPY.errorCopy} role="alert" />;
   }

   return (
      <div className="mt-6 flex flex-col gap-6">
         <p className="font-hand text-lg text-ink">{FORECAST_COPY.estimateNote}</p>
         <HorizonToggle
            options={FORECAST_WINDOWS}
            value={windowSize}
            onChange={setWindowSize}
         />
         <div className="flex flex-col gap-2">
            <WhatIfChip
               pressed={whatIfOn}
               onToggle={() => setWhatIfOn((on) => !on)}
            />
            <p className="font-body text-sm text-ink-soft">
               {whatIfOn ? FORECAST_COPY.whatIfOn : FORECAST_COPY.whatIfOff}
            </p>
         </div>
         <ForecastChart
            rows={model.rows}
            buffer={model.buffer}
            bills={model.bills}
         />
         <ChartLegend />
         <p className="font-hand text-xl text-ink">{model.sentence}</p>
         {model.bills.length === 0 && (
            <p className="font-body text-sm text-ink-soft">
               {FORECAST_COPY.noBillsNote}
            </p>
         )}
         <AssumptionsList items={model.assumptions} />
      </div>
   );
}
