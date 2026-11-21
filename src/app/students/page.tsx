// Purpose: /students route (PRD §5): roster by batch, add or edit a student, and raise this month's fees.
import { PageHeading } from '../../components/khata/PageHeading';
import { StoreGate } from '../../components/khata/StoreGate';
import { StudentsView } from '../../components/students/StudentsView';
import { PAGE_COPY } from '../../lib/constants';

export default function StudentsPage() {
   return (
      <>
         <PageHeading title={PAGE_COPY.students.title} />
         <StoreGate>
            <StudentsView />
         </StoreGate>
      </>
   );
}

