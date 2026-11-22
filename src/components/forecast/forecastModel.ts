// Purpose: view model for /forecast: chart rows, bill tags and the lowest-balance sentence.
// Reuses forecast() and whatIf() unchanged; it only slices and labels their output.
import { format } from 'date-fns';
import {
   FORECAST_COPY,
   FORECAST_DATE_TICK_FORMAT,
   FORECAST_WHATIF_ID,
} from '../../lib/constants';
import { dayLabel, isAfterDate, parseDateOnly } from '../../lib/dates';
import { forecast } from '../../lib/domain/forecast';
import { formatINR } from '../../lib/domain/formatINR';
import { whatIf } from '../../lib/domain/whatIf';
import type { StoreState } from '../../lib/types';

/** One x-axis point: the balances on that day under each scenario. */
export interface ChartRow {
   label: string;
   expected: number;
   optimistic: number;
   pessimistic: number;
   band: number;
}

/** A bill tag drawn on the chart at its due day. */
export interface BillMarker {
   label: string;
   name: string;
   amount: number;
}

/** Everything the forecast page draws, computed from one store snapshot. */
export interface ForecastModel {
   rows: ChartRow[];
   buffer: number;
   bills: BillMarker[];
   assumptions: string[];
   sentence: string;
}

/** Why: the chart needs short day labels that match the bill tag labels exactly. */
function tickLabel(date: string): string {
   return format(parseDateOnly(date), FORECAST_DATE_TICK_FORMAT);
}

/** Why: the what-if line is read from whatIf(), which is display-only and never saved. */
function lineBalances(
   state: StoreState,
   today: string,
   windowSize: number,
   whatIfOn: boolean,
   fallback: number[],
): number[] {
   if (!whatIfOn) return fallback;
   const scenario = whatIf(state, today).find(
      (item) => item.id === FORECAST_WHATIF_ID,
   );
   if (!scenario) return fallback;
   return scenario.days.slice(0, windowSize).map((point) => point.balance);
}

/** Why: the tutor needs one day and one action, so the lowest point is named. */
function lowestSentence(
   days: { date: string; balance: number }[],
   buffer: number,
   today: string,
): string {
   const first = days[0];
   if (!first) return '';
   const lowest = days.reduce(
      (best, point) => (point.balance < best.balance ? point : best),
      first,
   );
   const action =
      lowest.balance < buffer
         ? FORECAST_COPY.actionUnderBuffer
         : FORECAST_COPY.actionAboveBuffer;
   return `${FORECAST_COPY.lowestPrefix} ${formatINR(lowest.balance)} on ${dayLabel(lowest.date, today)}. ${action}`;
}

/**
 * Why: the chart, bill tags and sentence all come from one model, so the page
 * never shows a balance that disagrees with the line it sits under.
 */
export function buildForecastModel(
   state: StoreState,
   today: string,
   windowSize: number,
   whatIfOn: boolean,
): ForecastModel {
   const result = forecast(state, today);
   const days = result.days.slice(0, windowSize);
   const buffer = state.business.buffer;
   const line = lineBalances(
      state,
      today,
      windowSize,
      whatIfOn,
      days.map((day) => day.expected),
   );
   const rows: ChartRow[] = days.map((day, i) => ({
      label: tickLabel(day.date),
      expected: line[i] ?? day.expected,
      optimistic: day.optimistic,
      pessimistic: day.pessimistic,
      band: day.optimistic - day.pessimistic,
   }));
   const last = days[days.length - 1]?.date;
   const bills = result.bills
      .filter((bill) => last !== undefined && !isAfterDate(bill.date, last))
      .map((bill) => ({
         label: tickLabel(bill.date),
         name: bill.name,
         amount: bill.amount,
      }));
   const sentence = lowestSentence(
      days.map((day, i) => ({ date: day.date, balance: line[i] ?? day.expected })),
      buffer,
      today,
   );
   return { rows, buffer, bills, assumptions: result.assumptions, sentence };
}
