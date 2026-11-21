// Purpose: page title in Anton, the display face for big Khata headings.

/** Why: one h1 per screen; the title text comes from constants so nav and heading agree. */
export function PageHeading({ title }: { title: string }) {
   return (
      <h1 className="font-display text-5xl leading-none text-ink uppercase">
         {title}
      </h1>
   );
}

