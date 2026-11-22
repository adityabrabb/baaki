// Purpose: /bills route (PRD §5): recurring outgoing bills to add, edit and delete, plus opening balance and buffer.
import { BillsView } from '../../components/bills/BillsView';
import { PageHeading } from '../../components/khata/PageHeading';
import { StoreGate } from '../../components/khata/StoreGate';
import { PAGE_COPY } from '../../lib/constants';

export default function BillsPage() {
   return (
      <>
         <PageHeading title={PAGE_COPY.bills.title} />
         <StoreGate>
            <BillsView />
         </StoreGate>
      </>
   );
}
