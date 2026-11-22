'use client';
// Purpose: Chase sheet for one family: an AI or template draft in the chosen tone and language, editable, opened in WhatsApp or copied; each send is logged.
import { useEffect, useState } from 'react';
import { fetchReminderDraft } from '../../lib/ai/clientRoutes';
import {
   CHASE_DRAFT_ID,
   CHASE_SHEET_COPY,
   DEFAULT_LANGUAGE,
   DEFAULT_TONE,
   DRAFT_KEY_SEPARATOR,
   DRAFT_ROWS,
   FOCUS_RING_CLASS,
   INPUT_CLASS,
   OWED_COPY,
   OWED_ESCAPE_KEY,
   OWED_SHEET_TITLE_ID,
   STORE_ERROR_COPY,
   WHATSAPP_WINDOW_FEATURES,
   WHATSAPP_WINDOW_TARGET,
} from '../../lib/constants';
import { chaseFactsOf, type ChaseFacts } from '../../lib/domain/chaseFacts';
import type { ChaseItem } from '../../lib/domain/chasePriority';
import { whatsappLink } from '../../lib/domain/paymentLinks';
import { logChaseReminders } from '../../lib/domain/reminderLog';
import { commitState } from '../../lib/store/clientStore';
import { useStore } from '../../lib/store/useStore';
import type { Language, ReminderChannel, Tone } from '../../lib/types';
import { EmptyNote } from '../khata/EmptyNote';
import { ChaseSheetControls } from './ChaseSheetControls';

export interface ChaseSheetProps {
   item: ChaseItem;
   onClose: () => void;
}

/** A draft tied to the tone and language it was asked for, so a stale one is never shown. */
interface DraftResult {
   key: string;
   text: string;
   source: 'ai' | 'template' | null;
   failed: boolean;
}

/** Why: the key pairs a draft with its request; a change of tone or language makes the old draft stale. */
function draftKeyOf(tone: Tone, language: Language): string {
   return `${tone}${DRAFT_KEY_SEPARATOR}${language}`;
}

/** Why: the sheet drafts from the store once on open, then redrafts only when the pickers change. */
export function ChaseSheet({ item, onClose }: ChaseSheetProps) {
   const { state, today } = useStore();
   const [tone, setTone] = useState<Tone>(state?.settings.defaultTone ?? DEFAULT_TONE);
   const [language, setLanguage] = useState<Language>(
      state?.settings.defaultLanguage ?? DEFAULT_LANGUAGE,
   );
   const [facts] = useState<ChaseFacts | null>(() =>
      state ? chaseFactsOf(state, item) : null,
   );
   const [result, setResult] = useState<DraftResult | null>(null);
   const [edited, setEdited] = useState<string | null>(null);
   const [note, setNote] = useState<string | null>(null);

   useEffect(() => {
      const handleKey = (event: KeyboardEvent) => {
         if (event.key === OWED_ESCAPE_KEY) onClose();
      };
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
   }, [onClose]);

   useEffect(() => {
      if (facts === null) return;
      let active = true;
      const key = draftKeyOf(tone, language);
      fetchReminderDraft({ ...facts, tone, language })
         .then((draft) => {
            if (active) {
               setResult({ key, text: draft.text, source: draft.source, failed: false });
            }
         })
         .catch(() => {
            if (active) setResult({ key, text: '', source: null, failed: true });
         });
      return () => {
         active = false;
      };
   }, [facts, tone, language]);

   if (!state || !today || facts === null) {
      return <EmptyNote text={STORE_ERROR_COPY} role="alert" />;
   }

   const current = result?.key === draftKeyOf(tone, language) ? result : null;
   const draftText = edited ?? current?.text ?? '';
   const phone = state.families.find((family) => family.id === item.familyId)?.phone ?? '';
   const hasPhone = phone.trim() !== '';
   const canSend = hasPhone && current !== null && !current.failed && draftText.trim() !== '';

   const handleTone = (next: Tone) => {
      setTone(next);
      setEdited(null);
   };
   const handleLanguage = (next: Language) => {
      setLanguage(next);
      setEdited(null);
   };

   /** Why: opening WhatsApp or copying is the send, so that is what the timeline records. */
   const logSend = (channel: ReminderChannel) => {
      commitState(
         logChaseReminders(state, item.invoiceIds, today, { tone, language, channel }),
      );
      setNote(CHASE_SHEET_COPY.logged);
   };

   const handleWhatsApp = () => {
      window.open(
         whatsappLink(phone, draftText),
         WHATSAPP_WINDOW_TARGET,
         WHATSAPP_WINDOW_FEATURES,
      );
      logSend('whatsapp');
   };

   /** Why: clipboard can be blocked, so a failure becomes a note and nothing is logged. */
   const handleCopy = async () => {
      try {
         await navigator.clipboard.writeText(draftText);
         logSend('copy');
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
            className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto border-2 border-ink bg-paper p-5 shadow-[4px_4px_0_var(--ink)]"
         >
            <h2
               id={OWED_SHEET_TITLE_ID}
               className="font-display text-3xl text-ink uppercase"
            >
               {OWED_COPY.chaseSheetTitle}
            </h2>
            <p className="font-hand text-xl text-ink">{item.familyName}</p>
            <ChaseSheetControls
               tone={tone}
               language={language}
               onTone={handleTone}
               onLanguage={handleLanguage}
            />
            <div className="flex flex-col gap-2">
               <label htmlFor={CHASE_DRAFT_ID} className="font-body text-sm font-semibold text-ink">
                  {CHASE_SHEET_COPY.draftLabel}
               </label>
               {current === null && (
                  <EmptyNote text={CHASE_SHEET_COPY.drafting} role="status" />
               )}
               {current?.failed && (
                  <EmptyNote text={CHASE_SHEET_COPY.draftError} role="alert" />
               )}
               <textarea
                  id={CHASE_DRAFT_ID}
                  rows={DRAFT_ROWS}
                  value={draftText}
                  disabled={current === null}
                  onChange={(event) => setEdited(event.target.value)}
                  className={`${INPUT_CLASS} py-2 whitespace-pre-wrap`}
               />
               {current !== null && !current.failed && (
                  <p className="font-body text-sm text-ink-soft">
                     {current.source === 'ai'
                        ? CHASE_SHEET_COPY.sourceAi
                        : CHASE_SHEET_COPY.sourceTemplate}
                  </p>
               )}
               {current !== null && !current.failed && draftText.trim() === '' && (
                  <EmptyNote text={CHASE_SHEET_COPY.emptyDraft} />
               )}
            </div>
            {!hasPhone && <EmptyNote text={CHASE_SHEET_COPY.noPhone} />}
            {note && <EmptyNote text={note} role="status" />}
            <div className="flex flex-wrap gap-3">
               <button
                  type="button"
                  onClick={handleWhatsApp}
                  disabled={!canSend}
                  className={`min-h-11 border-2 border-ink bg-ink px-4 font-body font-semibold text-chalk shadow-[4px_4px_0_var(--ink)] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_RING_CLASS}`}
               >
                  {CHASE_SHEET_COPY.openWhatsApp}
               </button>
               <button
                  type="button"
                  onClick={handleCopy}
                  disabled={draftText.trim() === ''}
                  className={`min-h-11 border-2 border-ink bg-chalk px-4 font-body font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_RING_CLASS}`}
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
            <p className="font-body text-sm text-ink-soft">{OWED_COPY.sheetNote}</p>
         </div>
      </div>
   );
}
