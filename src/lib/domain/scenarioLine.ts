// Purpose: one plain line naming the active what-if and its parameters, shown with the forecast assumptions.
// Pure: no state or clock; the caller passes the picked scenario and its values.
import {
   SCENARIO_LINE_COPY,
   WHATIF_LABELS,
   WHATIF_LATE_DAYS,
   WHATIF_NORMAL_LABEL,
   WHATIF_TOP_FAMILY_COUNT,
} from '../constants';
import type { WhatIfId } from './whatIf';

/** The picked what-if (null = Normal) and the slider values it uses. */
export interface ScenarioParams {
   id: WhatIfId | null;
   lateDays: number;
   lostCount: number;
   feeRisePercent: number;
}

/**
 * Why: the forecast is read with its scenario, so the active what-if and its
 * numbers are always named in the assumptions.
 */
export function scenarioLine(params: ScenarioParams): string {
   const { prefix } = SCENARIO_LINE_COPY;
   const head = (label: string, detail: string): string =>
      `${prefix} ${label}. ${detail}`;
   switch (params.id) {
      case null:
         return head(WHATIF_NORMAL_LABEL, SCENARIO_LINE_COPY.normalDetail);
      case 'family_late':
         return head(
            WHATIF_LABELS.family_late,
            SCENARIO_LINE_COPY.familyLate(params.lateDays),
         );
      case 'top_families_late':
         return head(
            WHATIF_LABELS.top_families_late,
            SCENARIO_LINE_COPY.topLate(WHATIF_TOP_FAMILY_COUNT, WHATIF_LATE_DAYS),
         );
      case 'lose_students':
         return head(
            WHATIF_LABELS.lose_students,
            SCENARIO_LINE_COPY.lose(params.lostCount),
         );
      case 'raise_fees':
         return head(
            WHATIF_LABELS.raise_fees,
            SCENARIO_LINE_COPY.raise(params.feeRisePercent),
         );
   }
}
