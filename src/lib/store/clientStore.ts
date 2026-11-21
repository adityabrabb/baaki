// Purpose: external store for the khata; loads localStorage (or the seed) on the client only, for useSyncExternalStore.
import { STORE_STATUS } from '../constants';
import { kolkataDateOf } from '../dates';
import { createLocalStorageRepository } from './repository';
import { LOADING_STORE_VALUE, type StoreContextValue } from './StoreContext';

// Why: created at module scope; it touches storage only when a method runs.
const repository = createLocalStorageRepository();

type Listener = () => void;

const listeners = new Set<Listener>();
let snapshot: StoreContextValue = LOADING_STORE_VALUE;

/** Why: replaces the snapshot and wakes React; the snapshot object identity changes only here. */
function emit(next: StoreContextValue): void {
   snapshot = next;
   listeners.forEach((listener) => listener());
}

/** Why: reads storage once after mount; a failed read becomes the error state, never a throw. */
export function load(): void {
   if (snapshot.status !== STORE_STATUS.loading) return;
   try {
      const today = kolkataDateOf(new Date());
      emit({
         status: STORE_STATUS.ready,
         state: repository.load(today),
         today,
      });
   } catch {
      emit({ status: STORE_STATUS.error, state: null, today: null });
   }
}

/** Why: React calls this from an effect (client only), so the first load happens after mount. */
export function subscribe(listener: Listener): () => void {
   listeners.add(listener);
   load();
   return () => {
      listeners.delete(listener);
   };
}

/** Why: returns the same object until the store changes, as useSyncExternalStore requires. */
export function getSnapshot(): StoreContextValue {
   return snapshot;
}
