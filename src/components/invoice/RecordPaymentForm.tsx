'use client';
// Purpose: record-payment form for one invoice: amount, UPI or cash, and date; the domain rule decides validity.
import { useState, type FormEvent } from 'react';
import {
   INPUT_CLASS,
   INVOICE_COPY,
   MIN_PAYMENT_AMOUNT,
   PAYMENT_METHODS,
   PAYMENT_METHOD_LABELS,
} from '../../lib/constants';
import { formatINR } from '../../lib/domain/formatINR';
import { ActionButton } from '../students/ActionButton';
import { FormField } from '../students/FormField';

export interface RecordPaymentFormProps {
   balance: number;
   today: string;
   onRecord: (input: unknown) => string | null;
}

/** Why: blank amount is sent as undefined so the domain reports "enter the amount", not "0". */
function amountOf(raw: string): number | undefined {
   return raw.trim() === '' ? undefined : Number(raw);
}

/** Why: the form only collects text; the domain schema decides whether the payment is valid. */
export function RecordPaymentForm({
   balance,
   today,
   onRecord,
}: RecordPaymentFormProps) {
   const [amount, setAmount] = useState('');
   const [method, setMethod] = useState<string>(PAYMENT_METHODS[0]);
   const [date, setDate] = useState(today);
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const problem = onRecord({ amount: amountOf(amount), method, date });
      setError(problem);
      if (problem === null) setAmount('');
   };

   return (
      <form
         onSubmit={handleSubmit}
         noValidate
         className="flex flex-col gap-4 border-2 border-ink bg-chalk p-4 shadow-[4px_4px_0_var(--color-ink)]"
      >
         <h2 className="font-display text-2xl text-ink uppercase">
            {INVOICE_COPY.paymentTitle}
         </h2>
         <p className="font-body text-sm text-ink-soft">
            {INVOICE_COPY.stillDue}: {formatINR(balance)}. {INVOICE_COPY.fullHint}
         </p>
         {error && (
            <p role="alert" className="font-body text-sm font-semibold text-margin-red">
               {error}
            </p>
         )}
         <FormField id="payment-amount" label={INVOICE_COPY.amountLabel}>
            <input
               id="payment-amount"
               type="number"
               inputMode="numeric"
               min={MIN_PAYMENT_AMOUNT}
               max={balance}
               step={1}
               value={amount}
               onChange={(event) => setAmount(event.target.value)}
               className={INPUT_CLASS}
            />
         </FormField>
         <FormField id="payment-method" label={INVOICE_COPY.methodLabel}>
            <select
               id="payment-method"
               value={method}
               onChange={(event) => setMethod(event.target.value)}
               className={INPUT_CLASS}
            >
               {PAYMENT_METHODS.map((value) => (
                  <option key={value} value={value}>
                     {PAYMENT_METHOD_LABELS[value]}
                  </option>
               ))}
            </select>
         </FormField>
         <FormField id="payment-date" label={INVOICE_COPY.dateLabel}>
            <input
               id="payment-date"
               type="date"
               max={today}
               value={date}
               onChange={(event) => setDate(event.target.value)}
               className={INPUT_CLASS}
            />
         </FormField>
         <ActionButton type="submit">{INVOICE_COPY.submitButton}</ActionButton>
      </form>
   );
}
