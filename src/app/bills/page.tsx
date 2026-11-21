// Purpose: /bills route (PRD §5): outgoing money, placeholder until the bills slice lands.
import { PlaceholderPage } from '../../components/khata/PlaceholderPage';
import { PAGE_COPY } from '../../lib/constants';

export default function BillsPage() {
   return (
      <PlaceholderPage
         title={PAGE_COPY.bills.title}
         empty={PAGE_COPY.bills.empty}
      />
   );
}

