'use client';
// Purpose: client view for /students: roster by batch, add or edit a student, and raise this month's fees.
import { useState } from 'react';
import {
   BLANK_STUDENT_DRAFT,
   PAGE_COPY,
   STORE_ERROR_COPY,
   STUDENTS_COPY,
} from '../../lib/constants';
import { EmptyNote } from '../khata/EmptyNote';
import { commitState } from '../../lib/store/clientStore';
import { useStore } from '../../lib/store/useStore';
import { raiseMonthLabel, raiseMonthlyFees } from '../../lib/domain/raiseFees';
import {
   draftForStudent,
   groupByBatch,
   saveStudent,
} from '../../lib/domain/roster';
import type { StudentInput } from '../../lib/domain/studentInput';
import { ActionButton } from './ActionButton';
import { BatchGroup } from './BatchGroup';
import { StudentForm } from './StudentForm';

/** Why: null means closed; studentId null means "add a new student". */
interface FormTarget {
   studentId: string | null;
}

/** Why: one place for the page: every write goes through the store, then the note says what happened. */
export function StudentsView() {
   const { state, today } = useStore();
   const [target, setTarget] = useState<FormTarget | null>(null);
   const [notice, setNotice] = useState<string | null>(null);

   if (!state || !today) {
      return <EmptyNote text={STORE_ERROR_COPY} role="alert" />;
   }

   const raiseLabel = `${STUDENTS_COPY.raisePrefix} ${raiseMonthLabel(today)} ${STUDENTS_COPY.raiseSuffix}`;

   const handleRaise = () => {
      const { state: next, raised } = raiseMonthlyFees(state, today);
      if (raised === 0) {
         setNotice(STUDENTS_COPY.raiseNone);
         return;
      }
      const saved = commitState(next);
      setNotice(
         saved
            ? `${STUDENTS_COPY.raiseDone} ${raised} for ${raiseMonthLabel(today)}.`
            : STUDENTS_COPY.saveError,
      );
   };

   const handleSave = (input: StudentInput) => {
      const next = saveStudent(state, input, target?.studentId ?? null);
      const saved = commitState(next);
      setTarget(null);
      setNotice(saved ? STUDENTS_COPY.savedNote : STUDENTS_COPY.saveError);
   };

   const formDraft =
      target === null
         ? null
         : target.studentId === null
           ? { ...BLANK_STUDENT_DRAFT }
           : draftForStudent(state, target.studentId);

   const groups = groupByBatch(state.students);

   return (
      <div className="mt-6 flex flex-col gap-4">
         <div className="flex flex-wrap gap-3">
            <ActionButton onClick={handleRaise}>{raiseLabel}</ActionButton>
            <ActionButton
               variant="secondary"
               onClick={() => setTarget({ studentId: null })}
            >
               {STUDENTS_COPY.addButton}
            </ActionButton>
         </div>
         {notice && <EmptyNote text={notice} role="status" />}
         {target !== null && formDraft && (
            <StudentForm
               key={target.studentId ?? 'new'}
               title={
                  target.studentId === null
                     ? STUDENTS_COPY.formAddTitle
                     : STUDENTS_COPY.formEditTitle
               }
               initial={formDraft}
               onSubmit={handleSave}
               onCancel={() => setTarget(null)}
            />
         )}
         {state.students.length === 0 ? (
            <EmptyNote text={PAGE_COPY.students.empty} />
         ) : (
            groups.map((group) => (
               <BatchGroup
                  key={group.batch}
                  batch={group.batch}
                  students={group.students}
                  families={state.families}
                  onEdit={(studentId) => {
                     setNotice(null);
                     setTarget({ studentId });
                  }}
               />
            ))
         )}
      </div>
   );
}
