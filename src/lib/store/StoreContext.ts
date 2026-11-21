// Purpose: React context and value types for the client store (loading, then ready or error).
import { createContext } from 'react';
import { STORE_STATUS } from '../constants';
import type { StoreState } from '../types';

export type StoreStatus = (typeof STORE_STATUS)[keyof typeof STORE_STATUS];

export interface StoreContextValue {
   status: StoreStatus;
   state: StoreState | null;
   today: string | null;
}

/** Why: the first render (server and client alike) must show loading, never storage data. */
export const LOADING_STORE_VALUE: StoreContextValue = {
   status: STORE_STATUS.loading,
   state: null,
   today: null,
};

/** Why: null default lets useStore fail loudly when used outside StoreProvider. */
export const StoreContext = createContext<StoreContextValue | null>(null);
