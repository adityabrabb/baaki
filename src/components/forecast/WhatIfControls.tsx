'use client';
// Purpose: the labelled inputs for the active what-if: family picker, late-days slider, student stepper or fee-rise slider.
import {
   WHATIF_CONTROLS_COPY,
   WHATIF_CONTROL_IDS,
   WHATIF_FEE_RISE_MAX,
   WHATIF_LATE_DAYS_MAX,
   WHATIF_LOST_STUDENT_MAX,
} from '../../lib/constants';
import type { WhatIfId } from '../../lib/domain/whatIf';
import type { Family } from '../../lib/types';
import type { WhatIfSelection } from './forecastModel';
import { WhatIfFamilySelect } from './WhatIfFamilySelect';
import { WhatIfRangeField } from './WhatIfRangeField';
import { WhatIfStepper } from './WhatIfStepper';

export interface WhatIfControlsProps {
   id: WhatIfId;
   selection: WhatIfSelection;
   families: Family[];
   onChange: (patch: Partial<WhatIfSelection>) => void;
}

/** Why: each scenario shows only the inputs it reads, so no visible control is dead. */
export function WhatIfControls({ id, selection, families, onChange }: WhatIfControlsProps) {
   if (id === 'family_late') {
      return (
         <div className="flex flex-col gap-4">
            <WhatIfFamilySelect
               families={families}
               value={selection.familyId}
               onChange={(familyId) => onChange({ familyId })}
            />
            <WhatIfRangeField
               id={WHATIF_CONTROL_IDS.lateDays}
               label={WHATIF_CONTROLS_COPY.lateLabel(selection.lateDays)}
               value={selection.lateDays}
               max={WHATIF_LATE_DAYS_MAX}
               onChange={(lateDays) => onChange({ lateDays })}
            />
         </div>
      );
   }
   if (id === 'lose_students') {
      return (
         <WhatIfStepper
            id={WHATIF_CONTROL_IDS.lostStudents}
            label={WHATIF_CONTROLS_COPY.loseLabel(selection.lostCount)}
            value={selection.lostCount}
            max={WHATIF_LOST_STUDENT_MAX}
            onChange={(lostCount) => onChange({ lostCount })}
         />
      );
   }
   if (id === 'raise_fees') {
      return (
         <WhatIfRangeField
            id={WHATIF_CONTROL_IDS.feeRise}
            label={WHATIF_CONTROLS_COPY.riseLabel(selection.feeRisePercent)}
            value={selection.feeRisePercent}
            max={WHATIF_FEE_RISE_MAX}
            onChange={(feeRisePercent) => onChange({ feeRisePercent })}
         />
      );
   }
   return null;
}
