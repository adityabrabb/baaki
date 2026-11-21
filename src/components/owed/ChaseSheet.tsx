'use client';
// Purpose: sheet holding the template reminder for one family; the tutor copies it, nothing is sent.
import { useEffect, useState } from 'react';
import {
   FOCUS_RING_CLASS,
   OWED_COPY,
   OWED_ESCAPE_KEY,
   OWED_SHEET_TITLE_ID,
} from '../../lib/constants';
import { EmptyNote } from '../khata/EmptyNote';

export interface ChaseSheetProps {
   familyName: string;
   text: string;
   onClose: () => void;
   onCopied: () => void;
}

/** Why: no AI and no sending here; copying the template is the only action, and it is logged by the caller. */
export function ChaseSheet({
   familyName,
   text,
   onClose,
   onCopied,
}: ChaseSheetProps) {
   const [note, setNote] = useState<string | null>(null);

   useEffect(() => {
      const handleKey = (event: KeyboardEvent) => {
         if (event.key === OWED_ESCAPE_KEY) onClose();
      };
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
   }, [onClose]);

   /** Why: clipboard can be blocked in some browsers, so a failure becomes a note, not a crash. */
   const handleCopy = async () => {
      try {
         await navigator.clipboard.writeText(text);
         setNote(OWED_COPY.copied);
         onCopied();
      } catch {
         setNote(OWED_COPY.copyError);
      }
   };

   return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
         <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={OWED_SHEET_TITLE_ID}
            className="flex w-full max-w-lg flex-col gap-4 border-2 border-ink bg-paper p-5 shadow-[4px_4px_0_var(--ink)]"
         >
            <h2
               id={OWED_SHEET_TITLE_ID}
               className="font-display text-3xl text-ink uppercase"
            >
               {OWED_COPY.chaseSheetTitle}
            </h2>
            <p className="font-hand text-xl text-ink">{familyName}</p>
            <p className="border-2 border-ink bg-chalk p-4 font-body text-base whitespace-pre-line text-ink">
               {text}
            </p>
            <p className="font-body text-sm text-ink-soft">
               {OWED_COPY.sheetNote}
            </p>
            {note && <EmptyNote text={note} role="status" />}
            <div className="flex flex-wrap gap-3">
               <button
                  type="button"
                  onClick={handleCopy}
                  autoFocus
                  className={`min-h-11 border-2 border-ink bg-ink px-4 font-body font-semibold text-chalk shadow-[4px_4px_0_var(--ink)] ${FOCUS_RING_CLASS}`}
               >
                  {OWED_COPY.copyButton}
               </button>
               <button
                  type="button"
                  onClick={onClose}
                  className={`min-h-11 border-2 border-ink bg-chalk px-4 font-body font-semibold text-ink ${FOCUS_RING_CLASS}`}
               >
                  {OWED_COPY.closeButton}
               </button>
            </div>
         </div>
      </div>
   );
}
