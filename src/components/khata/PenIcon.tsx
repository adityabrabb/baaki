// Purpose: decorative pen icon for the quick-add line (inline SVG, no emoji or images).

/** Why: decorative only, so it is hidden from assistive tech; the input carries the label. */
export function PenIcon() {
   return (
      <svg
         aria-hidden="true"
         viewBox="0 0 24 24"
         className="h-5 w-5 shrink-0 text-ink"
         fill="none"
         stroke="currentColor"
         strokeWidth={2}
         strokeLinecap="round"
         strokeLinejoin="round"
      >
         <path d="M4 20h4L19 9l-4-4L4 16v4z" />
         <path d="M13.5 6.5l4 4" />
      </svg>
   );
}

