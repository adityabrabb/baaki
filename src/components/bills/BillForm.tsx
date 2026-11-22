// Purpose: add or edit bill form: name, monthly amount and due day; each field shows its own inline error.
import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { BILLS_COPY, INPUT_CLASS } from '../../lib/constants';
import {
   parseBillDraft,
   type BillDraft,
   type BillErrors,
   type BillInput,
} from '../../lib/domain/billInput';
import { numberOrNull } from '../../lib/domain/formInput';
import { ActionButton } from '../students/ActionButton';
import { FormField } from '../students/FormField';

export interface BillFormProps {
   title: string;
   initial: BillDraft;
   onSubmit: (input: BillInput) => void;
   onCancel: () => void;
}

interface FormText {
   name: string;
   amount: string;
   dayOfMonth: string;
}

/** Why: inputs hold text, so a cleared number box stays empty and gets a message, not a 0. */
function toText(draft: BillDraft): FormText {
   return {
      name: draft.name,
      amount: String(draft.amount),
      dayOfMonth: String(draft.dayOfMonth),
   };
}

/** Why: the form is remounted per bill (via key) so each open starts from fresh values. */
export function BillForm({ title, initial, onSubmit, onCancel }: BillFormProps) {
   const baseId = useId();
   const [text, setText] = useState<FormText>(() => toText(initial));
   const [errors, setErrors] = useState<BillErrors>({});
   const fieldId = (key: keyof BillDraft) => `${baseId}-${key}`;

   const update =
      (key: keyof FormText) => (event: ChangeEvent<HTMLInputElement>) =>
         setText((prev) => ({ ...prev, [key]: event.target.value }));

   const submit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const result = parseBillDraft({
         name: text.name,
         amount: numberOrNull(text.amount),
         dayOfMonth: numberOrNull(text.dayOfMonth),
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
         className="flex flex-col gap-4 border-2 border-ink bg-chalk p-4"
      >
         <h3 className="font-display text-2xl text-ink uppercase">{title}</h3>
         <FormField id={fieldId('name')} label={BILLS_COPY.nameLabel} error={errors.name}>
            <input
               id={fieldId('name')}
               type="text"
               autoComplete="off"
               value={text.name}
               onChange={update('name')}
               className={INPUT_CLASS}
            />
         </FormField>
         <FormField id={fieldId('amount')} label={BILLS_COPY.amountLabel} error={errors.amount}>
            <input
               id={fieldId('amount')}
               type="number"
               inputMode="numeric"
               value={text.amount}
               onChange={update('amount')}
               className={INPUT_CLASS}
            />
         </FormField>
         <FormField
            id={fieldId('dayOfMonth')}
            label={BILLS_COPY.dayLabel}
            error={errors.dayOfMonth}
         >
            <input
               id={fieldId('dayOfMonth')}
               type="number"
               inputMode="numeric"
               value={text.dayOfMonth}
               onChange={update('dayOfMonth')}
               className={INPUT_CLASS}
            />
         </FormField>
         <div className="flex flex-wrap gap-3">
            <ActionButton type="submit">{BILLS_COPY.saveButton}</ActionButton>
            <ActionButton variant="secondary" onClick={onCancel}>
               {BILLS_COPY.cancelButton}
            </ActionButton>
         </div>
      </form>
   );
}
