// Purpose: /forecast route (PRD §5, §6): 30/60/90-day cash forecast with the assumptions it rests on.
import { ForecastView } from '../../components/forecast/ForecastView';
import { PageHeading } from '../../components/khata/PageHeading';
import { StoreGate } from '../../components/khata/StoreGate';
import { PAGE_COPY } from '../../lib/constants';

export default function ForecastPage() {
   return (
      <>
         <PageHeading title={PAGE_COPY.forecast.title} />
         <StoreGate>
            <ForecastView />
         </StoreGate>
      </>
   );
}
