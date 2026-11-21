// Purpose: /forecast route (PRD §5): cash next 30/60/90, placeholder until the forecast slice lands.
import { PlaceholderPage } from '../../components/khata/PlaceholderPage';
import { PAGE_COPY } from '../../lib/constants';

export default function ForecastPage() {
   return (
      <PlaceholderPage
         title={PAGE_COPY.forecast.title}
         empty={PAGE_COPY.forecast.empty}
      />
   );
}

