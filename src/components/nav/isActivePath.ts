// Purpose: decides whether a nav link matches the current pathname (exact for Today, prefix otherwise).
import { HOME_HREF } from '../../lib/constants';

/** Why: Today must match only '/', while '/invoice/x' keeps its parent section highlighted. */
export function isActivePath(pathname: string, href: string): boolean {
   if (href === HOME_HREF) return pathname === HOME_HREF;
   return pathname === href || pathname.startsWith(`${href}/`);
}

