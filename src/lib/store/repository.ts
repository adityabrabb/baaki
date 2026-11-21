// Purpose: StoreRepository interface plus its localStorage implementation (key baaki:v1).
// Browser-only: nothing touches window or localStorage until a method is called.
import { SCHEMA_VERSION, STORAGE_KEY } from '../constants';
import type { StoreState } from '../types';
import { storeStateSchema } from './schema';
import { buildSeedState } from './seed';

/** Why: the UI depends on this interface, so storage can change without touching it. */
export interface StoreRepository {
   load: (today: string) => StoreState;
   save: (state: StoreState) => boolean;
   reset: (today: string) => StoreState;
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

/** Why: resolve storage lazily so importing this module never reads window. */
export function browserStorage(): StorageLike | null {
   if (typeof window === 'undefined') return null;
   try {
      return window.localStorage;
   } catch {
      return null;
   }
}

/** Why: corrupt or stale data must never crash the app; null means "use the seed". */
function parseStored(raw: string): StoreState | null {
   let json: unknown;
   try {
      json = JSON.parse(raw);
   } catch {
      return null;
   }
   const result = storeStateSchema.safeParse(json);
   if (!result.success || result.data.version !== SCHEMA_VERSION) return null;
   return result.data;
}

/** Why: the only persistence path; reset-to-seed on any read or parse failure. */
export function createLocalStorageRepository(
   resolve: () => StorageLike | null = browserStorage,
): StoreRepository {
   const save = (state: StoreState): boolean => {
      const storage = resolve();
      if (!storage) return false;
      try {
         storage.setItem(STORAGE_KEY, JSON.stringify(state));
         return true;
      } catch {
         return false;
      }
   };

   const reset = (today: string): StoreState => {
      const seed = buildSeedState(today);
      save(seed);
      return seed;
   };

   const load = (today: string): StoreState => {
      const storage = resolve();
      if (!storage) return buildSeedState(today);
      let raw: string | null;
      try {
         raw = storage.getItem(STORAGE_KEY);
      } catch {
         return buildSeedState(today);
      }
      if (raw === null) return reset(today);
      return parseStored(raw) ?? reset(today);
   };

   return { load, save, reset };
}
