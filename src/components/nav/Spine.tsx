'use client';
// Purpose: desktop left spine, like a notebook binding; lists every route and is hidden on mobile.
import { usePathname } from 'next/navigation';
import {
   BUSINESS_NAME,
   NAV_LABEL,
   NAV_MORE_ITEMS,
   NAV_MORE_LABEL,
   NAV_PRIMARY_ITEMS,
} from '../../lib/constants';
import { isActivePath } from './isActivePath';
import { NavLink } from './NavLink';

/** Why: desktop shows every route at once, so no menu is needed on wide screens. */
export function Spine() {
   const pathname = usePathname();
   return (
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:h-screen md:w-64 md:flex-col md:gap-4 md:border-r-4 md:border-ink md:bg-chalk md:px-4 md:py-8">
         <p className="font-display text-2xl leading-none text-ink uppercase">
            {BUSINESS_NAME}
         </p>
         <nav aria-label={NAV_LABEL} className="flex flex-col gap-2">
            {NAV_PRIMARY_ITEMS.map((item) => (
               <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={isActivePath(pathname, item.href)}
                  variant="list"
               />
            ))}
            <p className="mt-4 font-hand text-lg font-bold text-ink-soft">
               {NAV_MORE_LABEL}
            </p>
            {NAV_MORE_ITEMS.map((item) => (
               <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={isActivePath(pathname, item.href)}
                  variant="list"
               />
            ))}
         </nav>
      </aside>
   );
}

