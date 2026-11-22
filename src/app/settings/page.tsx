// Purpose: /settings route (PRD §5): business name and UPI id, invoice CSV export, and the demo data reset.
import { BusinessForm } from '../../components/settings/BusinessForm';
import { ExportCsvButton } from '../../components/settings/ExportCsvButton';
import { ResetDemoData } from '../../components/settings/ResetDemoData';
import { PageHeading } from '../../components/khata/PageHeading';
import { StoreGate } from '../../components/khata/StoreGate';
import { PAGE_COPY, SETTINGS_COPY } from '../../lib/constants';

export default function SettingsPage() {
   return (
      <>
         <PageHeading title={PAGE_COPY.settings.title} />
         <StoreGate>
            <section className="mt-6 flex flex-col gap-4">
               <h2 className="font-display text-2xl text-ink uppercase">
                  {SETTINGS_COPY.businessTitle}
               </h2>
               <p className="font-body text-base text-ink">{SETTINGS_COPY.businessNote}</p>
               <BusinessForm />
            </section>
            <section className="mt-6 flex flex-col gap-4">
               <h2 className="font-display text-2xl text-ink uppercase">
                  {SETTINGS_COPY.exportTitle}
               </h2>
               <p className="font-body text-base text-ink">{SETTINGS_COPY.exportNote}</p>
               <ExportCsvButton />
            </section>
            <section className="mt-6 flex flex-col gap-4">
               <h2 className="font-display text-2xl text-ink uppercase">
                  {SETTINGS_COPY.resetTitle}
               </h2>
               <p className="font-body text-base text-ink">{SETTINGS_COPY.resetNote}</p>
               <ResetDemoData />
            </section>
         </StoreGate>
      </>
   );
}
