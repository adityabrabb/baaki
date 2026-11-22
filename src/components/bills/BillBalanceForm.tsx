// Purpose: cash in hand today and safety buffer form on /bills; each box shows its own inline error.
import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { BILLS_COPY, INPUT_CLASS } from '../../lib/constants';
import {
   parseBalanceDraft,
   type BalanceDraft,
   type BalanceErrors,
   type BalanceInput,
} from '../../lib/domain/billInput';
import { numberOrNull } from '../../lib/domain/formInput';
import { ActionButton } from '../students/ActionButton';
import { FormField } from '../students/FormField';

export interface BillBalanceFormProps {
   initial: BalanceDraft;
   onSubmit: (input: BalanceInput) => void;
}

interface FormText {
   openingBalance: string;
   buffer: string;
}

/** Why: the boxes hold text, so a cleared box stays empty and gets a message instead of 0. */
export function BillBalanceForm({ initial, onSubmit }: BillBalanceFormProps) {
   const baseId = useId();
   const [text, setText] = useState<FormText>({
      openingBalance: String(initial.openingBalance),
      buffer: String(initial.buffer),
   });
   const [errors, setErrors] = useState<BalanceErrors>({});
   const fieldId = (key: keyof BalanceDraft) => `${baseId}-${key}`;

   const update =
      (key: keyof FormText) => (event: ChangeEvent<HTMLInputElement>) =>
         setText((prev) => ({ ...prev, [key]: event.target.value }));

   const submit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const result = parseBalanceDraft({
         openingBalance: numberOrNull(text.openingBalance),
         buffer: numberOrNull(text.buffer),
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
         <h3 className="font-display text-2xl text-ink uppercase">
            {BILLS_COPY.balanceTitle}
         </h3>
         <FormField
            id={fieldId('openingBalance')}
            label={BILLS_COPY.cashLabel}
            error={errors.openingBalance}
         >
            <input
               id={fieldId('openingBalance')}
               type="number"
               inputMode="numeric"
               value={text.openingBalance}
               onChange={update('openingBalance')}
               className={INPUT_CLASS}
            />
         </FormField>
         <FormField id={fieldId('buffer')} label={BILLS_COPY.bufferLabel} error={errors.buffer}>
            <input
               id={fieldId('buffer')}
               type="number"
               inputMode="numeric"
               value={text.buffer}
               onChange={update('buffer')}
               className={INPUT_CLASS}
            />
         </FormField>
         <div className="flex flex-wrap gap-3">
            <ActionButton type="submit">{BILLS_COPY.balanceSave}</ActionButton>
         </div>
      </form>
   );
}
