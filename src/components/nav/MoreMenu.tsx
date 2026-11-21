'use client';
// Purpose: the mobile "More" tab; a disclosure button that opens links to Bills, Pricing and Settings.
import { useState } from 'react';
import {
   FOCUS_RING_CLASS,
   NAV_MORE_ITEMS,
   NAV_MORE_LABEL,
   NAV_MORE_MENU_ID,
} from '../../lib/constants';
import { isActivePath } from './isActivePath';
import { NavLink } from './NavLink';

/** Why: a menu keeps the five-tab bar within 360px; closing on any link click avoids a stuck menu. */
export function MoreMenu({ pathname }: { pathname: string }) {
   const [open, setOpen] = useState(false);
   const childActive = NAV_MORE_ITEMS.some((item) =>
      isActivePath(pathname, item.href),
   );
   const buttonState = childActive
      ? 'border-ink bg-marigold text-ink'
      : 'border-transparent text-ink';

   return (
      <div className="relative flex flex-1">
         <button
            type="button"
            aria-expanded={open}
            aria-controls={NAV_MORE_MENU_ID}
            onClick={() => setOpen((current) => !current)}
            className={`flex min-h-11 w-full flex-1 items-center justify-center border-2 font-body text-sm font-semibold ${buttonState} ${FOCUS_RING_CLASS}`}
         >
            {NAV_MORE_LABEL}
         </button>
         <div
            id={NAV_MORE_MENU_ID}
            hidden={!open}
            onClick={() => setOpen(false)}
            className="absolute right-0 bottom-full mb-2 flex w-44 flex-col gap-1 border-2 border-ink bg-chalk p-2 shadow-[4px_4px_0_var(--ink)]"
         >
            {NAV_MORE_ITEMS.map((item) => (
               <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={isActivePath(pathname, item.href)}
                  variant="list"
               />
            ))}
         </div>
      </div>
   );
}

