'use client';
// Purpose: /settings business form: business name and UPI id, checked with zod and saved to the store for reminders.
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { INPUT_CLASS, SETTINGS_COPY, STORE_ERROR_COPY, STUDENTS_COPY } from '../../lib/constants';
import {
   parseBusinessDraft,
   type BusinessDraft,
   type BusinessErrors,
} from '../../lib/domain/businessInput';
import { setBusinessIdentity } from '../../lib/domain/businessEdits';
import { commitState } from '../../lib/store/clientStore';
import { useStore } from '../../lib/store/useStore';
import { EmptyNote } from '../khata/EmptyNote';
import { ActionButton } from '../students/ActionButton';
import { FormField } from '../students/FormField';

/** Why: the form starts from the saved business, and a save only changes the store when every box is valid. */
export function BusinessForm() {
   const { state } = useStore();
   const [text, setText] = useState<BusinessDraft>({
      name: state?.business.name ?? '',
      upiId: state?.business.upiId ?? '',
   });
   const [errors, setErrors] = useState<BusinessErrors>({});
   const [notice, setNotice] = useState<string | null>(null);

   if (!state) {
      return <EmptyNote text={STORE_ERROR_COPY} role="alert" />;
   }

   const update =
      (key: keyof BusinessDraft) => (event: ChangeEvent<HTMLInputElement>) =>
         setText((prev) => ({ ...prev, [key]: event.target.value }));

   const submit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const result = parseBusinessDraft(text);
      if (!result.success) {
         setErrors(result.errors);
         setNotice(null);
         return;
      }
      setErrors({});
      const saved = commitState(
         setBusinessIdentity(state, result.data.name, result.data.upiId),
      );
      setNotice(saved ? SETTINGS_COPY.businessSaved : STUDENTS_COPY.saveError);
   };

   return (
      <form
         noValidate
         onSubmit={submit}
         className="flex flex-col gap-4 border-2 border-ink bg-chalk p-4"
      >
         <FormField id="business-name" label={SETTINGS_COPY.businessNameLabel} error={errors.name}>
            <input
               id="business-name"
               type="text"
               autoComplete="organization"
               value={text.name}
               onChange={update('name')}
               className={INPUT_CLASS}
            />
         </FormField>
         <FormField id="business-upi" label={SETTINGS_COPY.upiLabel} error={errors.upiId}>
            <input
               id="business-upi"
               type="text"
               autoComplete="off"
               value={text.upiId}
               onChange={update('upiId')}
               className={INPUT_CLASS}
            />
         </FormField>
         <div className="flex flex-wrap gap-3">
            <ActionButton type="submit">{SETTINGS_COPY.businessSave}</ActionButton>
         </div>
         {notice && (
            <p role="status" className="font-hand text-lg text-ink">
               {notice}
            </p>
         )}
      </form>
   );
}
