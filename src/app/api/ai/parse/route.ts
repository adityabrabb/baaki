// Purpose: POST /api/ai/parse: validates one quick-add line and today with zod, then returns the parsed fields or "unknown".
import { NextResponse } from 'next/server';
import { parseLine } from '../../../../lib/ai/parseService';
import { parseRequestSchema } from '../../../../lib/ai/schemas';
import { AI_ERRORS } from '../../../../lib/constants';

/** Why: the regex parser runs first on the client; this route only answers the lines it could not read. */
export async function POST(request: Request) {
   let body: unknown;
   try {
      body = await request.json();
   } catch {
      return NextResponse.json({ error: AI_ERRORS.badJson }, { status: 400 });
   }
   const parsed = parseRequestSchema.safeParse(body);
   if (!parsed.success) {
      return NextResponse.json({ error: AI_ERRORS.badInput }, { status: 400 });
   }
   try {
      return NextResponse.json(await parseLine(parsed.data));
   } catch {
      return NextResponse.json({ error: AI_ERRORS.serverError }, { status: 500 });
   }
}
