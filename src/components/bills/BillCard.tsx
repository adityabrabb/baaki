// Purpose: one recurring bill row on /bills: amount, next due date (or Paused), and Edit and Delete buttons.
import { BILLS_COPY } from '../../lib/constants';
import { dayLabel } from '../../lib/dates';
import { formatINR } from '../../lib/domain/formatINR';
import { dueDateOnOrAfter } from '../../lib/domain/nextBill';
import type { Bill } from '../../lib/types';
import { ActionButton } from '../students/ActionButton';

export interface BillCardProps {
   bill: Bill;
   today: string;
   onEdit: () => void;
   onDelete: () => void;
}

/** Why: each bill keeps its own edit and delete buttons, each at least 44px tall. */
export function BillCard({ bill, today, onEdit, onDelete }: BillCardProps) {
   return (
      <li className="flex flex-col gap-2 border-2 border-ink bg-chalk p-4 shadow-[4px_4px_0_var(--ink)]">
         <h3 className="font-hand text-2xl text-ink">{bill.name}</h3>
         <p className="font-display text-4xl text-ink">
            {formatINR(bill.amount)}
            <span className="font-body text-base">{BILLS_COPY.monthlyLabel}</span>
         </p>
         <p className="font-body text-base text-ink">
            <span className="font-bold">{BILLS_COPY.dueLabel}: </span>
            {bill.active
               ? dayLabel(dueDateOnOrAfter(bill.dayOfMonth, today), today)
               : BILLS_COPY.pausedLabel}
         </p>
         <div className="flex flex-wrap gap-3">
            <ActionButton variant="secondary" onClick={onEdit}>
               {BILLS_COPY.editButton}
            </ActionButton>
            <ActionButton variant="secondary" onClick={onDelete}>
               {BILLS_COPY.deleteButton}
            </ActionButton>
         </div>
      </li>
   );
}
