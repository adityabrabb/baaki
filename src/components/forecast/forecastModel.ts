// Purpose: view model for /forecast: chart rows, bill tags, the dashed what-if line and the sentence under the chart.
// Reuses forecast() and whatIf() unchanged; it only slices and labels their output.
import { format } from 'date-fns';
import {
   FORECAST_COPY,
   FORECAST_DATE_TICK_FORMAT,
   WHATIF_FEE_RISE_PERCENT,
   WHATIF_LATE_DAYS,
   WHATIF_LOST_STUDENT_COUNT,
} from '../../lib/constants';
import { dayLabel, isAfterDate, parseDateOnly } from '../../lib/dates';
import { forecast } from '../../lib/domain/forecast';
import { formatINR } from '../../lib/domain/formatINR';
import {
   whatIf,
   type WhatIfId,
   type WhatIfOptions,
   type WhatIfPoint,
} from '../../lib/domain/whatIf';
import type { StoreState } from '../../lib/types';
import { scenarioLine } from '../../lib/domain/scenarioLine';
import { comparisonSentence } from './whatIfSentence';

/** The one what-if picked on the page (null = Normal) and its slider values. */
export interface WhatIfSelection {
   id: WhatIfId | null;
   familyId: string;
   lateDays: number;
   lostCount: number;
   feeRisePercent: number;
}

/** Why: the page opens on Normal, with each slider at the PRD default. */
export const DEFAULT_WHATIF_SELECTION: WhatIfSelection = {
   id: null,
   familyId: '',
   lateDays: WHATIF_LATE_DAYS,
   lostCount: WHATIF_LOST_STUDENT_COUNT,
   feeRisePercent: WHATIF_FEE_RISE_PERCENT,
};

/** One x-axis point: the balances on that day under each scenario. */
export interface ChartRow {
   label: string;
   expected: number;
   optimistic: number;
   pessimistic: number;
   band: number;
   scenario: number | null;
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

/** The active what-if's label and its balances over the chosen window. */
interface ActiveScenario {
   label: string;
   points: WhatIfPoint[];
}

/** Why: the chart needs short day labels that match the bill tag labels exactly. */
function tickLabel(date: string): string {
   return format(parseDateOnly(date), FORECAST_DATE_TICK_FORMAT);
}

/** Why: the family picker starts on the first family so the control always has a value. */
function optionsOf(state: StoreState, selection: WhatIfSelection): WhatIfOptions {
   return {
      familyId: selection.familyId || (state.families[0]?.id ?? ''),
      lateDays: selection.lateDays,
      lostCount: selection.lostCount,
      feeRisePercent: selection.feeRisePercent,
   };
}

/** Why: the dashed line is read from whatIf() for the one chosen scenario; it is display-only and never saved. */
function activeScenario(
   state: StoreState,
   today: string,
   windowSize: number,
   selection: WhatIfSelection,
): ActiveScenario | null {
   if (selection.id === null) return null;
   const found = whatIf(state, today, optionsOf(state, selection)).find(
      (item) => item.id === selection.id,
   );
   if (!found) return null;
   return { label: found.label, points: found.days.slice(0, windowSize) };
}

/** Why: the tutor needs one day and one action, so the lowest point is named. */
function lowestSentence(
   days: WhatIfPoint[],
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
   selection: WhatIfSelection,
): ForecastModel {
   const result = forecast(state, today);
   const days = result.days.slice(0, windowSize);
   const buffer = state.business.buffer;
   const active = activeScenario(state, today, windowSize, selection);
   const normal: WhatIfPoint[] = days.map((day) => ({
      date: day.date,
      balance: day.expected,
   }));
   const rows: ChartRow[] = days.map((day, i) => ({
      label: tickLabel(day.date),
      expected: day.expected,
      optimistic: day.optimistic,
      pessimistic: day.pessimistic,
      band: day.optimistic - day.pessimistic,
      scenario: active?.points[i]?.balance ?? null,
   }));
   const last = days[days.length - 1]?.date;
   const bills = result.bills
      .filter((bill) => last !== undefined && !isAfterDate(bill.date, last))
      .map((bill) => ({
         label: tickLabel(bill.date),
         name: bill.name,
         amount: bill.amount,
      }));
   const sentence = active
      ? comparisonSentence(
           active.label,
           normal,
           active.points,
           buffer,
           result.bills,
           today,
        )
      : lowestSentence(normal, buffer, today);
   const assumptions = [...result.assumptions, scenarioLine(selection)];
   return { rows, buffer, bills, assumptions, sentence };
}
