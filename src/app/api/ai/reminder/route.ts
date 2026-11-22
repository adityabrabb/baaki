// Purpose: POST /api/ai/reminder: validates the chase facts with zod and returns a drafted reminder (AI, or the template with no key).
import { NextResponse } from 'next/server';
import { draftReminder } from '../../../../lib/ai/reminderService';
import { reminderRequestSchema } from '../../../../lib/ai/schemas';
import { AI_ERRORS } from '../../../../lib/constants';

/** Why: bad input gets a friendly 400, never a crash; the key is read on the server only. */
export async function POST(request: Request) {
   let body: unknown;
   try {
      body = await request.json();
   } catch {
      return NextResponse.json({ error: AI_ERRORS.badJson }, { status: 400 });
   }
   const parsed = reminderRequestSchema.safeParse(body);
   if (!parsed.success) {
      return NextResponse.json({ error: AI_ERRORS.badInput }, { status: 400 });
   }
   try {
      return NextResponse.json(await draftReminder(parsed.data));
   } catch {
      return NextResponse.json({ error: AI_ERRORS.serverError }, { status: 500 });
   }
}
