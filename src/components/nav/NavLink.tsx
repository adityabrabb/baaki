// Purpose: one navigation link; the active one gets a marigold fill and aria-current="page".
import Link from 'next/link';
import { FOCUS_RING_CLASS } from '../../lib/constants';

export type NavVariant = 'tab' | 'list';

export interface NavLinkProps {
   href: string;
   label: string;
   active: boolean;
   variant: NavVariant;
}

const VARIANT_CLASSES: Record<NavVariant, string> = {
   tab: 'flex min-h-11 flex-1 items-center justify-center border-2 px-1 font-body text-sm font-semibold',
   list: 'flex min-h-11 items-center border-2 px-3 font-body font-semibold',
};
const ACTIVE_CLASSES = 'border-ink bg-marigold text-ink';
const IDLE_CLASSES = 'border-transparent text-ink hover:border-ink';

/** Why: one link style for tabs and the spine; active state is shown by fill and text, not colour alone. */
export function NavLink({ href, label, active, variant }: NavLinkProps) {
   const state = active ? ACTIVE_CLASSES : IDLE_CLASSES;
   return (
      <Link
         href={href}
         aria-current={active ? 'page' : undefined}
         className={`${VARIANT_CLASSES[variant]} ${state} ${FOCUS_RING_CLASS}`}
      >
         {label}
      </Link>
   );
}

