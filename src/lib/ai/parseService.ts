// Purpose: reads a quick-add line the regex could not: Gemini JSON when it validates, otherwise an "unknown" result.
import { AI_JSON_FENCE_PATTERN, AI_PARSE_PROMPT } from '../constants';
import { askGemini } from './geminiClient';
import {
   type ParseRequest,
   type ParseResult,
   parseResultSchema,
} from './schemas';

/** Why: with no key or a bad reply the route says "couldn't read", and the tutor types it again. */
const UNREADABLE: ParseResult = {
   type: 'unknown',
   student: null,
   amount: null,
   method: null,
   date: null,
};

/** Why: the model may wrap JSON in a code fence; strip it, then parse without trusting the result. */
function readJson(text: string): unknown {
   try {
      return JSON.parse(text.replace(AI_JSON_FENCE_PATTERN, '').trim());
   } catch {
      return null;
   }
}

/** Why: the AI is the second reader only; its output is validated before any caller sees it. */
export async function parseLine(input: ParseRequest): Promise<ParseResult> {
   const reply = await askGemini(
      `${AI_PARSE_PROMPT} "${input.text}" Today: ${input.today}`,
   );
   if (reply === null) return UNREADABLE;
   const checked = parseResultSchema.safeParse(readJson(reply));
   return checked.success ? checked.data : UNREADABLE;
}
