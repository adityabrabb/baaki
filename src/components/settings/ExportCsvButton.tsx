'use client';
// Purpose: /settings export: downloads every invoice as a CSV file; disabled with a stated reason when there are none.
import { useState } from 'react';
import {
   CSV_FILE_NAME,
   CSV_MIME_TYPE,
   SETTINGS_COPY,
   STORE_ERROR_COPY,
} from '../../lib/constants';
import { buildInvoiceCsv } from '../../lib/domain/invoiceCsv';
import { downloadText } from '../../lib/download';
import { useStore } from '../../lib/store/useStore';
import { EmptyNote } from '../khata/EmptyNote';
import { ActionButton } from '../students/ActionButton';

/** Why: the button builds the file from the current store, so the export matches what the tutor sees. */
export function ExportCsvButton() {
   const { state, today } = useStore();
   const [notice, setNotice] = useState<string | null>(null);
   const [failed, setFailed] = useState(false);

   if (!state || !today) {
      return <EmptyNote text={STORE_ERROR_COPY} role="alert" />;
   }

   const hasInvoices = state.invoices.length > 0;

   const exportNow = () => {
      try {
         downloadText(CSV_FILE_NAME, buildInvoiceCsv(state, today), CSV_MIME_TYPE);
         setFailed(false);
         setNotice(SETTINGS_COPY.exportDone);
      } catch {
         setFailed(true);
         setNotice(SETTINGS_COPY.exportError);
      }
   };

   return (
      <div className="flex flex-col gap-3">
         <ActionButton
            onClick={exportNow}
            disabled={!hasInvoices}
            aria-describedby={hasInvoices ? undefined : 'export-disabled-reason'}
            className="self-start disabled:opacity-50"
         >
            {SETTINGS_COPY.exportButton}
         </ActionButton>
         {!hasInvoices && (
            <p id="export-disabled-reason" className="font-body text-base text-ink-soft">
               {SETTINGS_COPY.exportDisabled}
            </p>
         )}
         {notice && (
            <p role={failed ? 'alert' : 'status'} className="font-hand text-lg text-ink">
               {notice}
            </p>
         )}
      </div>
   );
}
