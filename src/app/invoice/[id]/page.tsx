// Purpose: /invoice/[id] route (PRD §5): one invoice, placeholder until the invoice slice lands.
import { PlaceholderPage } from '../../../components/khata/PlaceholderPage';
import { PAGE_COPY } from '../../../lib/constants';

export default async function InvoicePage({
   params,
}: {
   params: Promise<{ id: string }>;
}) {
   const { id } = await params;
   return (
      <PlaceholderPage
         title={`${PAGE_COPY.invoice.title} ${id}`}
         empty={PAGE_COPY.invoice.empty}
      />
   );
}

