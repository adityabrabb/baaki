// Purpose: the only Gemini call site (server only): one generateContent with an 8s timeout; null when there is no key or the call fails.
import { GoogleGenAI } from '@google/genai';
import {
   AI_TIMEOUT_MESSAGE,
   AI_TIMEOUT_MS,
   GEMINI_API_KEY_ENV,
   GEMINI_MODEL_DEFAULT,
   GEMINI_MODEL_ENV,
} from '../constants';

/** Why: the key comes from env only and is read per call, so it is never bundled or logged. */
function apiKey(): string | null {
   const key = process.env[GEMINI_API_KEY_ENV]?.trim();
   return key ? key : null;
}

/** Why: a slow model must not hang the Chase sheet; the race rejects after the limit. */
function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
   let timer: ReturnType<typeof setTimeout> | undefined;
   const expired = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(AI_TIMEOUT_MESSAGE)), ms);
   });
   return Promise.race([work, expired]).finally(() => clearTimeout(timer));
}

/**
 * Why: every caller treats null as "use the template", so a missing key, a
 * timeout and a model error all degrade to the same working path.
 */
export async function askGemini(prompt: string): Promise<string | null> {
   const key = apiKey();
   if (key === null) return null;
   try {
      const ai = new GoogleGenAI({ apiKey: key });
      const model = process.env[GEMINI_MODEL_ENV]?.trim() || GEMINI_MODEL_DEFAULT;
      const response = await withTimeout(
         ai.models.generateContent({ model, contents: prompt }),
         AI_TIMEOUT_MS,
      );
      const text = response.text;
      return typeof text === 'string' && text.trim() !== '' ? text : null;
   } catch {
      return null;
   }
}
