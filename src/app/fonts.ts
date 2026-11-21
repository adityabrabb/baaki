// Purpose: the three Khata fonts (Anton, Kalam, Hind) as next/font objects with CSS variables.
import { Anton, Hind, Kalam } from 'next/font/google';
import { FONT_VARIABLES } from '../lib/constants';

/** Why: big numbers and page titles; Anton only ships one weight. */
export const anton = Anton({
   weight: '400',
   subsets: ['latin'],
   variable: FONT_VARIABLES.display,
   display: 'swap',
});

/** Why: handwriting accent for names, notes and empty states. */
export const kalam = Kalam({
   weight: ['400', '700'],
   subsets: ['latin'],
   variable: FONT_VARIABLES.hand,
   display: 'swap',
});

/** Why: body and UI text; devanagari keeps Hindi reminders legible. */
export const hind = Hind({
   weight: ['400', '500', '600', '700'],
   subsets: ['latin', 'devanagari'],
   variable: FONT_VARIABLES.body,
   display: 'swap',
});
