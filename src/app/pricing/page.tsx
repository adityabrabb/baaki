// Purpose: /pricing route (PRD §5): business case, placeholder until the pricing slice lands.
import { PlaceholderPage } from '../../components/khata/PlaceholderPage';
import { PAGE_COPY } from '../../lib/constants';

export default function PricingPage() {
   return (
      <PlaceholderPage
         title={PAGE_COPY.pricing.title}
         empty={PAGE_COPY.pricing.empty}
      />
   );
}

