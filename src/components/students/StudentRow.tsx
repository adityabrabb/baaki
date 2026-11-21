// Purpose: one roster line: student name in Kalam, family and class, fee in Anton, and an Edit button.
import { STUDENTS_COPY, ROW_SEPARATOR } from '../../lib/constants';
import { formatINR } from '../../lib/domain/formatINR';
import type { Student } from '../../lib/types';
import { ActionButton } from './ActionButton';

export interface StudentRowProps {
   student: Student;
   familyName: string;
   onEdit: (studentId: string) => void;
}

/** Why: each row carries its own Edit button, labelled with the student's name for screen readers. */
export function StudentRow({ student, familyName, onEdit }: StudentRowProps) {
   return (
      <li className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-line py-3">
         <div className="min-w-0">
            <p className="font-hand text-xl text-ink">{student.name}</p>
            <p className="font-body text-sm text-ink-soft">
               {`${familyName}${ROW_SEPARATOR}${STUDENTS_COPY.classLabel} ${student.classLevel}`}
            </p>
         </div>
         <div className="flex items-center gap-3">
            <p className="font-display text-2xl text-ink">
               {formatINR(student.feeAmount)}
            </p>
            <ActionButton
               variant="secondary"
               aria-label={`${STUDENTS_COPY.editButton} ${student.name}`}
               onClick={() => onEdit(student.id)}
            >
               {STUDENTS_COPY.editButton}
            </ActionButton>
         </div>
      </li>
   );
}
