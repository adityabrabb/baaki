// Purpose: add or edit student form: validates with zod, shows a message per field, then hands the clean input up.
import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import {
   BATCH_NAMES,
   INPUT_CLASS,
   STUDENTS_COPY,
} from '../../lib/constants';
import {
   parseStudentDraft,
   type StudentDraft,
   type StudentErrors,
   type StudentInput,
} from '../../lib/domain/studentInput';
import { ActionButton } from './ActionButton';
import { FormField } from './FormField';

export interface StudentFormProps {
   title: string;
   initial: StudentDraft;
   onSubmit: (input: StudentInput) => void;
   onCancel: () => void;
}

type FormText = Record<keyof StudentDraft, string>;

/** Why: inputs hold text, so a cleared number field stays empty instead of snapping to 0. */
function toText(draft: StudentDraft): FormText {
   return {
      name: draft.name,
      familyName: draft.familyName,
      batch: draft.batch,
      classLevel: String(draft.classLevel),
      feeAmount: String(draft.feeAmount),
   };
}

/** Why: the form is remounted per student (via key) so each open starts from fresh values. */
export function StudentForm({ title, initial, onSubmit, onCancel }: StudentFormProps) {
   const baseId = useId();
   const [text, setText] = useState<FormText>(() => toText(initial));
   const [errors, setErrors] = useState<StudentErrors>({});
   const fieldId = (key: keyof StudentDraft) => `${baseId}-${key}`;

   const update =
      (key: keyof FormText) =>
      (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
         setText((prev) => ({ ...prev, [key]: event.target.value }));

   const submit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const result = parseStudentDraft({
         name: text.name,
         familyName: text.familyName,
         batch: text.batch,
         classLevel: Number(text.classLevel),
         feeAmount: Number(text.feeAmount),
      });
      if (!result.success) {
         setErrors(result.errors);
         return;
      }
      setErrors({});
      onSubmit(result.data);
   };

   return (
      <form
         noValidate
         onSubmit={submit}
         className="mt-6 flex flex-col gap-4 border-2 border-ink bg-chalk p-4"
      >
         <h2 className="font-display text-3xl text-ink uppercase">{title}</h2>
         <FormField id={fieldId('name')} label={STUDENTS_COPY.nameLabel} error={errors.name}>
            <input
               id={fieldId('name')}
               type="text"
               autoComplete="off"
               value={text.name}
               onChange={update('name')}
               className={INPUT_CLASS}
            />
         </FormField>
         <FormField
            id={fieldId('familyName')}
            label={STUDENTS_COPY.familyLabel}
            error={errors.familyName}
         >
            <input
               id={fieldId('familyName')}
               type="text"
               autoComplete="off"
               value={text.familyName}
               onChange={update('familyName')}
               className={INPUT_CLASS}
            />
         </FormField>
         <FormField id={fieldId('batch')} label={STUDENTS_COPY.batchLabel} error={errors.batch}>
            <select
               id={fieldId('batch')}
               value={text.batch}
               onChange={update('batch')}
               className={INPUT_CLASS}
            >
               {BATCH_NAMES.map((batch) => (
                  <option key={batch} value={batch}>
                     {batch}
                  </option>
               ))}
            </select>
         </FormField>
         <FormField
            id={fieldId('classLevel')}
            label={STUDENTS_COPY.classLabel}
            error={errors.classLevel}
         >
            <input
               id={fieldId('classLevel')}
               type="number"
               inputMode="numeric"
               value={text.classLevel}
               onChange={update('classLevel')}
               className={INPUT_CLASS}
            />
         </FormField>
         <FormField
            id={fieldId('feeAmount')}
            label={STUDENTS_COPY.feeLabel}
            error={errors.feeAmount}
         >
            <input
               id={fieldId('feeAmount')}
               type="number"
               inputMode="numeric"
               value={text.feeAmount}
               onChange={update('feeAmount')}
               className={INPUT_CLASS}
            />
         </FormField>
         <div className="flex flex-wrap gap-3">
            <ActionButton type="submit">{STUDENTS_COPY.saveButton}</ActionButton>
            <ActionButton variant="secondary" onClick={onCancel}>
               {STUDENTS_COPY.cancelButton}
            </ActionButton>
         </div>
      </form>
   );
}
