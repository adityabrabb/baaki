'use client';
// Purpose: demo reset on /settings: a two-step inline confirm that restores the seed through the store.
import { useState } from 'react';
import {
   FOCUS_RING_CLASS,
   SETTINGS_COPY,
   STORE_ERROR_COPY,
} from '../../lib/constants';
import { commitState } from '../../lib/store/clientStore';
import { buildSeedState } from '../../lib/store/seed';
import { useStore } from '../../lib/store/useStore';

/** Why: restoring the seed wipes the tutor's own changes, so the first click only asks. */
export function ResetDemoData() {
   const { today } = useStore();
   const [confirming, setConfirming] = useState(false);
   const [notice, setNotice] = useState<{ text: string; role: 'status' | 'alert' } | null>(null);

   /** Why: the write goes through the store so every open page sees the seed at once. */
   const resetNow = () => {
      setConfirming(false);
      if (!today) {
         setNotice({ text: STORE_ERROR_COPY, role: 'alert' });
         return;
      }
      let saved = false;
      try {
         saved = commitState(buildSeedState(today));
      } catch {
         saved = false;
      }
      setNotice(
         saved
            ? { text: SETTINGS_COPY.resetDone, role: 'status' }
            : { text: SETTINGS_COPY.resetError, role: 'alert' },
      );
   };

   return (
      <div className="flex flex-col gap-3">
         {confirming ? (
            <div
               role="group"
               aria-label={SETTINGS_COPY.resetQuestion}
               className="flex flex-col gap-3 border-2 border-margin-red bg-chalk p-4"
            >
               <p className="font-hand text-xl text-ink">{SETTINGS_COPY.resetQuestion}</p>
               <div className="flex flex-wrap gap-3">
                  <button
                     type="button"
                     onClick={resetNow}
                     className={`min-h-11 border-2 border-ink bg-margin-red px-4 font-body text-base font-bold text-chalk shadow-[4px_4px_0_var(--ink)] ${FOCUS_RING_CLASS}`}
                  >
                     {SETTINGS_COPY.resetConfirm}
                  </button>
                  <button
                     type="button"
                     onClick={() => setConfirming(false)}
                     className={`min-h-11 border-2 border-ink bg-chalk px-4 font-body text-base font-bold text-ink shadow-[4px_4px_0_var(--ink)] ${FOCUS_RING_CLASS}`}
                  >
                     {SETTINGS_COPY.resetCancel}
                  </button>
               </div>
            </div>
         ) : (
            <button
               type="button"
               onClick={() => {
                  setNotice(null);
                  setConfirming(true);
               }}
               className={`min-h-11 self-start border-2 border-ink bg-margin-red px-4 font-body text-base font-bold text-chalk shadow-[4px_4px_0_var(--ink)] ${FOCUS_RING_CLASS}`}
            >
               {SETTINGS_COPY.resetButton}
            </button>
         )}
         {notice && (
            <p role={notice.role} className="font-hand text-lg text-ink">
               {notice.text}
            </p>
         )}
      </div>
   );
}
