// Purpose: /owed route (PRD §5): the Baaki board, placeholder until the owed slice lands.
import { PlaceholderPage } from '../../components/khata/PlaceholderPage';
import { PAGE_COPY } from '../../lib/constants';

export default function OwedPage() {
   return (
      <PlaceholderPage
         title={PAGE_COPY.owed.title}
         empty={PAGE_COPY.owed.empty}
      />
   );
}

