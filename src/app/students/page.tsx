// Purpose: /students route (PRD §5): roster and invoicing, placeholder until the students slice lands.
import { PlaceholderPage } from '../../components/khata/PlaceholderPage';
import { PAGE_COPY } from '../../lib/constants';

export default function StudentsPage() {
   return (
      <PlaceholderPage
         title={PAGE_COPY.students.title}
         empty={PAGE_COPY.students.empty}
      />
   );
}

