// Purpose: hook that gives client components the store status, state and today.
import { useContext } from 'react';
import { STORE_MISSING_PROVIDER } from '../constants';
import { StoreContext, type StoreContextValue } from './StoreContext';

/** Why: fails loudly if a component renders outside StoreProvider, instead of silently showing nothing. */
export function useStore(): StoreContextValue {
   const value = useContext(StoreContext);
   if (value === null) throw new Error(STORE_MISSING_PROVIDER);
   return value;
}
