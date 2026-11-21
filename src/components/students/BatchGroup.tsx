// Purpose: one batch heading with its students as a ruled list (PRD §5 /students, roster by batch).
import type { Family, Student } from '../../lib/types';
import { familyNameOf } from '../../lib/domain/roster';
import { StudentRow } from './StudentRow';

export interface BatchGroupProps {
   batch: string;
   students: Student[];
   families: Family[];
   onEdit: (studentId: string) => void;
}

/** Why: the roster is grouped by batch so the tutor sees each class as a block. */
export function BatchGroup({ batch, students, families, onEdit }: BatchGroupProps) {
   return (
      <section className="mt-6">
         <h2 className="font-display text-2xl text-ink uppercase">{batch}</h2>
         <ul className="mt-2">
            {students.map((student) => (
               <StudentRow
                  key={student.id}
                  student={student}
                  familyName={familyNameOf(families, student.familyId)}
                  onEdit={onEdit}
               />
            ))}
         </ul>
      </section>
   );
}
