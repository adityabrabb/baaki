// Purpose: / Today route (PRD §5): cash status line, quick-add and the chase queue placeholder.
import { EmptyNote } from '../components/khata/EmptyNote';
import { PageHeading } from '../components/khata/PageHeading';
import { QuickAdd } from '../components/khata/QuickAdd';
import { StoreGate } from '../components/khata/StoreGate';
import { CASH_STATUS_PLACEHOLDER, PAGE_COPY } from '../lib/constants';

export default function TodayPage() {
   return (
      <>
         <PageHeading title={PAGE_COPY.today.title} />
         <StoreGate>
            <p className="mt-4 font-hand text-2xl text-ink">
               {CASH_STATUS_PLACEHOLDER}
            </p>
            <QuickAdd />
            <EmptyNote text={PAGE_COPY.today.empty} />
         </StoreGate>
      </>
   );
}

