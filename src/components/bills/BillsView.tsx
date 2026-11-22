'use client';
// Purpose: client view for /bills: add, edit and delete recurring bills, and set the opening balance and buffer; every save goes through the store.
import { useState } from 'react';
import { BILLS_COPY, BILL_DAY_MIN, PAGE_COPY } from '../../lib/constants';
import { addBill, deleteBill, updateBill } from '../../lib/domain/billEdits';
import type { BalanceInput, BillDraft, BillInput } from '../../lib/domain/billInput';
import { setBalances } from '../../lib/domain/businessEdits';
import { commitState } from '../../lib/store/clientStore';
import { useStore } from '../../lib/store/useStore';
import type { StoreState } from '../../lib/types';
import { EmptyNote } from '../khata/EmptyNote';
import { ActionButton } from '../students/ActionButton';
import { BillBalanceForm } from './BillBalanceForm';
import { BillCard } from './BillCard';
import { BillForm } from './BillForm';

/** Why: null means closed; billId null means "add a new bill". */
interface FormTarget {
   billId: string | null;
}

const BLANK_BILL_DRAFT: BillDraft = { name: '', amount: 0, dayOfMonth: BILL_DAY_MIN };

/** Why: one place for the page: every write goes through the store, then the note says what happened. */
export function BillsView() {
   const { state, today } = useStore();
   const [target, setTarget] = useState<FormTarget | null>(null);
   const [notice, setNotice] = useState<string | null>(null);

   if (!state || !today) {
      return <EmptyNote text={BILLS_COPY.errorCopy} role="alert" />;
   }

   const save = (next: StoreState, doneNote: string) => {
      const saved = commitState(next);
      setNotice(saved ? doneNote : BILLS_COPY.saveError);
   };

   const handleBillSave = (input: BillInput) => {
      const next =
         target === null || target.billId === null
            ? addBill(state, input)
            : updateBill(state, target.billId, input);
      setTarget(null);
      save(next, BILLS_COPY.savedNote);
   };

   const handleDelete = (billId: string) => {
      setTarget(null);
      save(deleteBill(state, billId), BILLS_COPY.deletedNote);
   };

   const handleBalances = (input: BalanceInput) => {
      save(setBalances(state, input.openingBalance, input.buffer), BILLS_COPY.balanceSaved);
   };

   const formDraft: BillDraft | null =
      target === null
         ? null
         : target.billId === null
           ? BLANK_BILL_DRAFT
           : (() => {
                const bill = state.bills.find((item) => item.id === target.billId);
                return bill
                   ? { name: bill.name, amount: bill.amount, dayOfMonth: bill.dayOfMonth }
                   : null;
             })();

   return (
      <section className="mt-6 flex flex-col gap-4">
         <h2 className="font-display text-2xl text-ink uppercase">{BILLS_COPY.title}</h2>
         <p className="font-body text-sm text-ink-soft">{BILLS_COPY.note}</p>
         <div className="flex flex-wrap gap-3">
            <ActionButton
               onClick={() => {
                  setNotice(null);
                  setTarget({ billId: null });
               }}
            >
               {BILLS_COPY.addButton}
            </ActionButton>
         </div>
         {notice && <EmptyNote text={notice} role="status" />}
         {target !== null && formDraft && (
            <BillForm
               key={target.billId ?? 'new'}
               title={target.billId === null ? BILLS_COPY.formAddTitle : BILLS_COPY.formEditTitle}
               initial={formDraft}
               onSubmit={handleBillSave}
               onCancel={() => setTarget(null)}
            />
         )}
         {state.bills.length === 0 ? (
            <EmptyNote text={PAGE_COPY.bills.empty} />
         ) : (
            <ul className="flex flex-col gap-4">
               {state.bills.map((bill) => (
                  <BillCard
                     key={bill.id}
                     bill={bill}
                     today={today}
                     onEdit={() => {
                        setNotice(null);
                        setTarget({ billId: bill.id });
                     }}
                     onDelete={() => handleDelete(bill.id)}
                  />
               ))}
            </ul>
         )}
         <BillBalanceForm
            initial={{
               openingBalance: state.business.openingBalance,
               buffer: state.business.buffer,
            }}
            onSubmit={handleBalances}
         />
      </section>
   );
}
