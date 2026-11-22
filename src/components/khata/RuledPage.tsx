// Purpose: notebook page shell with paper, ruled lines and a red margin (CSS gradients only).
import type { CSSProperties, ReactNode } from 'react';

/** Why: every screen sits on the same ruled paper, so the app feels like one khata. */
export function RuledPage({ children }: { children: ReactNode }) {
   // Why: margin line sits 24px from the left; the 2px line spans 24-26px.
   const pageStyle = { '--margin-x': '26px' } as CSSProperties;
   return (
      <div
         className="ruled-page flex min-h-dvh flex-1 flex-col pl-10 md:flex-row md:items-start lg:pl-0"
         style={pageStyle}
      >
         {children}
      </div>
   );
}

