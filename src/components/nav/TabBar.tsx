'use client';
// Purpose: mobile bottom tab bar (Today, Owed, Forecast, Students, More); hidden from the desktop breakpoint up.
import { usePathname } from 'next/navigation';
import { NAV_LABEL, NAV_PRIMARY_ITEMS } from '../../lib/constants';
import { isActivePath } from './isActivePath';
import { MoreMenu } from './MoreMenu';
import { NavLink } from './NavLink';

/** Why: 44px tap targets across a 360px phone; the desktop spine replaces it at md. */
export function TabBar() {
   const pathname = usePathname();
   return (
      <nav
         aria-label={NAV_LABEL}
         className="fixed inset-x-0 bottom-0 z-20 flex gap-1 border-t-2 border-ink bg-chalk px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden"
      >
         {NAV_PRIMARY_ITEMS.map((item) => (
            <NavLink
               key={item.href}
               href={item.href}
               label={item.label}
               active={isActivePath(pathname, item.href)}
               variant="tab"
            />
         ))}
         <MoreMenu pathname={pathname} />
      </nav>
   );
}

