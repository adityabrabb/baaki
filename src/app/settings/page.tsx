// Purpose: /settings route (PRD §5): demo controls, placeholder until the settings slice lands.
import { PlaceholderPage } from '../../components/khata/PlaceholderPage';
import { PAGE_COPY } from '../../lib/constants';

export default function SettingsPage() {
   return (
      <PlaceholderPage
         title={PAGE_COPY.settings.title}
         empty={PAGE_COPY.settings.empty}
      />
   );
}

