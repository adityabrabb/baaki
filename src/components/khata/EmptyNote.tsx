// Purpose: handwritten Kalam note for empty and status states (loading, error, nothing yet).
export interface EmptyNoteProps {
   text: string;
   role?: 'status' | 'alert';
}

/** Why: one shared look for every empty state, so each screen says "nothing yet" the same way. */
export function EmptyNote({ text, role }: EmptyNoteProps) {
   return (
      <p
         role={role}
         className="mt-6 border-2 border-dashed border-ink-soft bg-chalk/70 p-4 font-hand text-xl leading-relaxed text-ink"
      >
         {text}
      </p>
   );
}

