'use client';
// Purpose: shows a stable loading or error note until the client store is ready, then the children.
import type { ReactNode } from 'react';
import {
   STORE_ERROR_COPY,
   STORE_LOADING_COPY,
   STORE_STATUS,
} from '../../lib/constants';
import { useStore } from '../../lib/store/useStore';
import { EmptyNote } from './EmptyNote';

/** Why: storage is read only after mount, so the first paint is always the loading note. */
export function StoreGate({ children }: { children: ReactNode }) {
   const { status } = useStore();
   if (status === STORE_STATUS.error) {
      return <EmptyNote text={STORE_ERROR_COPY} role="alert" />;
   }
   if (status === STORE_STATUS.loading) {
      return <EmptyNote text={STORE_LOADING_COPY} role="status" />;
   }
   return <>{children}</>;
}

