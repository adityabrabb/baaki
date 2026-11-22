// Purpose: the families Today asks the tutor to chase first, with their combined amount (PRD §6).
// Pure: callers pass `today`; reads only chasePriority.
import { CHASE_TARGET_LIMIT } from '../constants';
import type { StoreState } from '../types';
import { type ChaseItem, chasePriority } from './chasePriority';

/** The top families to chase and the rupees they owe between them. */
export interface ChaseTargets {
   items: ChaseItem[];
   total: number;
}

/** Why: one shared list keeps the bill headline and the alerts naming the same families. */
export function chaseTargets(state: StoreState, today: string): ChaseTargets {
   const items = chasePriority(state, today).slice(0, CHASE_TARGET_LIMIT);
   const total = items.reduce((sum, item) => sum + item.owed, 0);
   return { items, total };
}
