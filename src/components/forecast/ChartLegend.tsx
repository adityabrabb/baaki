// Purpose: colour-and-text key for the forecast chart; every swatch has a words label too.
import { FORECAST_COPY } from '../../lib/constants';

const LEGEND_ITEMS = [
   { label: FORECAST_COPY.expectedLegend, swatch: 'bg-ink' },
   { label: FORECAST_COPY.bandLegend, swatch: 'bg-marigold' },
   { label: FORECAST_COPY.bufferLegend, swatch: 'bg-margin-red' },
   { label: FORECAST_COPY.billLegend, swatch: 'border-2 border-ink bg-chalk' },
] as const;

/** Why: the key lets the tutor read the lines without guessing what the colours mean. */
export function ChartLegend() {
   return (
      <ul className="flex flex-wrap gap-x-4 gap-y-2 font-body text-sm text-ink">
         {LEGEND_ITEMS.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
               <span aria-hidden="true" className={`inline-block h-3 w-5 ${item.swatch}`} />
               {item.label}
            </li>
         ))}
      </ul>
   );
}
