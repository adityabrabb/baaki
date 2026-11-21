'use client';
// Purpose: client store provider; reads localStorage only after mount, via useSyncExternalStore.
import { useSyncExternalStore, type ReactNode } from 'react';
import { getSnapshot, subscribe } from './clientStore';
import {
   LOADING_STORE_VALUE,
   StoreContext,
   type StoreContextValue,
} from './StoreContext';

/** Why: server render and hydration both show the loading state; storage is never read on the server. */
function getServerSnapshot(): StoreContextValue {
   return LOADING_STORE_VALUE;
}

/** Why: exposes the external khata store to client components through the same context shape. */
export function StoreProvider({ children }: { children: ReactNode }) {
   const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

   return (
      <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
   );
}
