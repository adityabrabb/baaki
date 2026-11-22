'use client';
// Purpose: the quick-add line: reads one line with the regex first, AI only if that fails, shows a confirm chip, and saves on confirm.
import { useState } from 'react';
import { fetchParse } from '../../lib/ai/clientRoutes';
import {
   AI_ERRORS,
   FOCUS_RING_CLASS,
   PAYMENT_ERRORS,
   QUICK_ADD_BILL_UNSUPPORTED,
   QUICK_ADD_ERRORS,
   QUICK_ADD_ID,
   QUICK_ADD_LABEL,
   QUICK_ADD_MAX_LENGTH,
   QUICK_ADD_PLACEHOLDER,
   QUICK_ADD_READING_COPY,
   QUICK_ADD_SAVED_COPY,
   QUICK_ADD_SUBMIT_LABEL,
} from '../../lib/constants';
import { intentFromParse } from '../../lib/domain/aiParseIntent';
import { parseQuickAdd, type QuickAddIntent } from '../../lib/domain/parseQuickAdd';
import { applyQuickAdd, describeIntent } from '../../lib/domain/quickAddSave';
import { commitState } from '../../lib/store/clientStore';
import { useStore } from '../../lib/store/useStore';
import type { PaymentMethod } from '../../lib/types';
import { EmptyNote } from './EmptyNote';
import { PenIcon } from './PenIcon';
import { QuickAddChip } from './QuickAddChip';

/** A read line waiting for the tutor's confirm; the method is asked for when the line left it out. */
interface Draft {
   intent: QuickAddIntent;
   method: PaymentMethod | null;
}

/** Why: a line is read by the regex first (free, instant); the AI is only asked when the regex cannot read it. */
export function QuickAdd() {
   const { state, today } = useStore();
   const [text, setText] = useState('');
   const [draft, setDraft] = useState<Draft | null>(null);
   const [busy, setBusy] = useState(false);
   const [note, setNote] = useState<string | null>(null);

   if (!state || !today) return null;

   const handleRead = async () => {
      const line = text.trim();
      if (line === '') return;
      setNote(null);
      setDraft(null);
      const local = parseQuickAdd(line);
      if (local !== null) {
         setDraft({ intent: local, method: local.kind === 'payment' ? local.method : null });
         return;
      }
      setBusy(true);
      try {
         const parsed = await fetchParse({ text: line, today });
         const intent = intentFromParse(parsed, today);
         if (intent === null) {
            setNote(AI_ERRORS.parseFailed);
         } else {
            setDraft({ intent, method: intent.kind === 'payment' ? intent.method : null });
         }
      } catch {
         setNote(AI_ERRORS.parseFailed);
      } finally {
         setBusy(false);
      }
   };

   /** Why: nothing is saved until the tutor confirms; a failed save says so instead of silently dropping the line. */
   const handleConfirm = () => {
      if (draft === null || draft.intent.kind !== 'payment' || draft.method === null) return;
      const outcome = applyQuickAdd(state, draft.intent, draft.method, today);
      if (!outcome.ok) {
         setNote(outcome.error);
         return;
      }
      const saved = commitState(outcome.state);
      setNote(saved ? QUICK_ADD_SAVED_COPY : QUICK_ADD_ERRORS.saveFailed);
      setDraft(null);
      setText('');
   };

   const canConfirm =
      draft !== null && draft.intent.kind === 'payment' && draft.method !== null;
   const reason =
      draft === null
         ? null
         : draft.intent.kind === 'bill_paid'
           ? QUICK_ADD_BILL_UNSUPPORTED
           : draft.method === null
             ? PAYMENT_ERRORS.methodRequired
             : null;

   return (
      <div className="mt-2">
         <form
            onSubmit={(event) => {
               event.preventDefault();
               void handleRead();
            }}
            className="flex flex-col gap-3"
         >
            <label htmlFor={QUICK_ADD_ID} className="block font-body text-sm font-semibold text-ink">
               {QUICK_ADD_LABEL}
            </label>
            <div className="flex items-center gap-2 border-b-2 border-ink bg-chalk px-3">
               <PenIcon />
               <input
                  id={QUICK_ADD_ID}
                  type="text"
                  autoComplete="off"
                  maxLength={QUICK_ADD_MAX_LENGTH}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder={QUICK_ADD_PLACEHOLDER}
                  className={`min-h-11 min-w-0 flex-1 bg-transparent font-hand text-xl text-ink placeholder:text-ink-soft ${FOCUS_RING_CLASS}`}
               />
               <button
                  type="submit"
                  disabled={busy || text.trim() === ''}
                  className={`min-h-11 min-w-11 border-2 border-ink bg-ink px-3 font-body text-sm font-semibold text-chalk disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_RING_CLASS}`}
               >
                  {QUICK_ADD_SUBMIT_LABEL}
               </button>
            </div>
         </form>
         {busy && <EmptyNote text={QUICK_ADD_READING_COPY} role="status" />}
         {note && <EmptyNote text={note} role="alert" />}
         {draft !== null && (
            <div className="mt-3">
               <QuickAddChip
                  summary={describeIntent(draft.intent, draft.method, today)}
                  method={draft.method}
                  showMethods={draft.intent.kind === 'payment'}
                  canConfirm={canConfirm}
                  reason={reason}
                  onMethod={(picked) =>
                     setDraft((current) => (current ? { ...current, method: picked } : null))
                  }
                  onConfirm={handleConfirm}
                  onCancel={() => setDraft(null)}
               />
            </div>
         )}
      </div>
   );
}
