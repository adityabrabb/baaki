// Purpose: / Today route (PRD §5): thin shell; cash line, next bill, chase queue, alerts and quick-add live in TodayView.
import { PageHeading } from '../components/khata/PageHeading';
import { StoreGate } from '../components/khata/StoreGate';
import { TodayView } from '../components/today/TodayView';
import { PAGE_COPY } from '../lib/constants';

export default function TodayPage() {
   return (
      <>
         <PageHeading title={PAGE_COPY.today.title} />
         <StoreGate>
            <TodayView />
         </StoreGate>
      </>
   );
}

