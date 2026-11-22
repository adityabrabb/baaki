// Purpose: the tone and language pickers on the Chase sheet; labelled selects so the choice is clear without colour.
import {
   CHASE_LANGUAGE_ID,
   CHASE_SHEET_COPY,
   CHASE_TONE_ID,
   INPUT_CLASS,
   LANGUAGE_LABELS,
   LANGUAGES,
   REMINDER_TONE_LABELS,
   TONES,
} from '../../lib/constants';
import type { Language, Tone } from '../../lib/types';

export interface ChaseSheetControlsProps {
   tone: Tone;
   language: Language;
   onTone: (tone: Tone) => void;
   onLanguage: (language: Language) => void;
}

/** Why: changing tone or language asks for a fresh draft, so the pickers are the only way to redraft. */
export function ChaseSheetControls({
   tone,
   language,
   onTone,
   onLanguage,
}: ChaseSheetControlsProps) {
   return (
      <div className="grid gap-3 sm:grid-cols-2">
         <div className="flex flex-col gap-1">
            <label htmlFor={CHASE_TONE_ID} className="font-body text-sm font-semibold text-ink">
               {CHASE_SHEET_COPY.toneLabel}
            </label>
            <select
               id={CHASE_TONE_ID}
               value={tone}
               onChange={(event) => onTone(event.target.value as Tone)}
               className={INPUT_CLASS}
            >
               {TONES.map((option) => (
                  <option key={option} value={option}>
                     {REMINDER_TONE_LABELS[option]}
                  </option>
               ))}
            </select>
         </div>
         <div className="flex flex-col gap-1">
            <label htmlFor={CHASE_LANGUAGE_ID} className="font-body text-sm font-semibold text-ink">
               {CHASE_SHEET_COPY.languageLabel}
            </label>
            <select
               id={CHASE_LANGUAGE_ID}
               value={language}
               onChange={(event) => onLanguage(event.target.value as Language)}
               className={INPUT_CLASS}
            >
               {LANGUAGES.map((option) => (
                  <option key={option} value={option}>
                     {LANGUAGE_LABELS[option]}
                  </option>
               ))}
            </select>
         </div>
      </div>
   );
}
