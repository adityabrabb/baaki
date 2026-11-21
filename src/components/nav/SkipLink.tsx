// Purpose: skip link, the first focusable element; jumps keyboard users past the navigation to #main.
import {
   FOCUS_RING_CLASS,
   MAIN_CONTENT_ID,
   SKIP_LINK_LABEL,
} from '../../lib/constants';

/** Why: hidden until focused, so it never clutters the page for mouse or touch users. */
export function SkipLink() {
   return (
      <a
         href={`#${MAIN_CONTENT_ID}`}
         className={`sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:border-2 focus:border-ink focus:bg-chalk focus:px-4 focus:py-3 focus:font-body focus:font-semibold focus:text-ink ${FOCUS_RING_CLASS}`}
      >
         {SKIP_LINK_LABEL}
      </a>
   );
}

