// Purpose: /owed route (PRD §5): total owed, ageing buckets, and the families to chase.
import { Suspense } from 'react';
import { EmptyNote } from '../../components/khata/EmptyNote';
import { PageHeading } from '../../components/khata/PageHeading';
import { StoreGate } from '../../components/khata/StoreGate';
import { OwedView } from '../../components/owed/OwedView';
import { PAGE_COPY, STORE_LOADING_COPY } from '../../lib/constants';

export default function OwedPage() {
   return (
      <>
         <PageHeading title={PAGE_COPY.owed.title} />
         <StoreGate>
            <Suspense
               fallback={<EmptyNote text={STORE_LOADING_COPY} role="status" />}
            >
               <OwedView />
            </Suspense>
         </StoreGate>
      </>
   );
}
