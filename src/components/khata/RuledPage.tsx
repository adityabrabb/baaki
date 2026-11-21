// Purpose: notebook page shell with paper, ruled lines and a red margin (CSS gradients only).
import type { ReactNode } from 'react';

/** Why: every screen sits on the same ruled paper, so the app feels like one khata. */
export function RuledPage({ children }: { children: ReactNode }) {
   return (
      <div className="ruled-page flex min-h-dvh flex-1 flex-col">{children}</div>
   );
}

