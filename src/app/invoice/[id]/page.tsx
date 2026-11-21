// Purpose: /invoice/[id] route (PRD §5): one invoice with its timeline, payment form and chase link.
import { InvoiceView } from '../../../components/invoice/InvoiceView';
import { PageHeading } from '../../../components/khata/PageHeading';
import { StoreGate } from '../../../components/khata/StoreGate';
import { PAGE_COPY } from '../../../lib/constants';

export default async function InvoicePage({
   params,
}: {
   params: Promise<{ id: string }>;
}) {
   const { id } = await params;
   return (
      <>
         <PageHeading title={PAGE_COPY.invoice.title} />
         <StoreGate>
            <InvoiceView invoiceId={id} />
         </StoreGate>
      </>
   );
}
