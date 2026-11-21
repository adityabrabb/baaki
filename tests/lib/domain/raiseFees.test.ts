// Purpose: Vitest cases for raiseMonthlyFees: normal raise, repeat press, partial history, and empty roster.
import { describe, expect, it } from 'vitest';
import {
   raiseMonthLabel,
   raiseMonthlyFees,
} from '../../../src/lib/domain/raiseFees';
import type { Invoice, StoreState, Student } from '../../../src/lib/types';

const TODAY = '2025-03-14';

function student(id: string, overrides: Partial<Student> = {}): Student {
   return {
      id,
      name: `Child ${id}`,
      familyId: `fam-${id}`,
      batch: 'Batch A',
      classLevel: 9,
      feeAmount: 2000,
      active: true,
      ...overrides,
   };
}

function makeState(students: Student[], invoices: Invoice[] = []): StoreState {
   return {
      version: 1,
      business: {
         name: 'Test Classes',
         openingBalance: 0,
         buffer: 0,
         upiId: 'test@upi',
      },
      families: [],
      students,
      invoices,
      payments: [],
      reminders: [],
      bills: [],
      settings: { defaultTone: 'gentle', defaultLanguage: 'hinglish' },
   };
}

describe('raiseMonthlyFees', () => {
   it('raises one invoice per active student at their fee, due on the 5th', () => {
      const state = makeState([
         student('stu-01', { feeAmount: 1800 }),
         student('stu-02', { feeAmount: 2400 }),
         student('stu-03', { active: false }),
      ]);
      const result = raiseMonthlyFees(state, TODAY);
      expect(result.raised).toBe(2);
      expect(result.state.invoices).toEqual([
         {
            id: 'inv-2025-04-stu-01',
            studentId: 'stu-01',
            familyId: 'fam-stu-01',
            month: '2025-04',
            amount: 1800,
            raisedOn: '2025-03-01',
            dueDate: '2025-04-05',
         },
         {
            id: 'inv-2025-04-stu-02',
            studentId: 'stu-02',
            familyId: 'fam-stu-02',
            month: '2025-04',
            amount: 2400,
            raisedOn: '2025-03-01',
            dueDate: '2025-04-05',
         },
      ]);
   });

   it('does not duplicate invoices when pressed twice', () => {
      const state = makeState([student('stu-01'), student('stu-02')]);
      const first = raiseMonthlyFees(state, TODAY);
      const second = raiseMonthlyFees(first.state, TODAY);
      expect(first.raised).toBe(2);
      expect(second.raised).toBe(0);
      expect(second.state.invoices).toHaveLength(2);
      expect(second.state).toEqual(first.state);
   });

   it('skips only students already invoiced for the target month', () => {
      const existing: Invoice = {
         id: 'inv-2025-04-stu-01',
         studentId: 'stu-01',
         familyId: 'fam-stu-01',
         month: '2025-04',
         amount: 2000,
         raisedOn: '2025-03-01',
         dueDate: '2025-04-05',
      };
      const state = makeState(
         [student('stu-01'), student('stu-02')],
         [existing],
      );
      const result = raiseMonthlyFees(state, TODAY);
      expect(result.raised).toBe(1);
      expect(result.state.invoices.map((i) => i.studentId)).toEqual([
         'stu-01',
         'stu-02',
      ]);
   });

   it('ignores last month invoices when raising next month', () => {
      const lastMonth: Invoice = {
         id: 'inv-2025-02-stu-01',
         studentId: 'stu-01',
         familyId: 'fam-stu-01',
         month: '2025-02',
         amount: 2000,
         raisedOn: '2025-02-01',
         dueDate: '2025-02-05',
      };
      const result = raiseMonthlyFees(
         makeState([student('stu-01')], [lastMonth]),
         TODAY,
      );
      expect(result.raised).toBe(1);
   });

   it('returns the state unchanged when there are no students', () => {
      const state = makeState([]);
      const result = raiseMonthlyFees(state, TODAY);
      expect(result.raised).toBe(0);
      expect(result.state).toEqual(state);
   });

   it('returns the state unchanged when every student is inactive', () => {
      const state = makeState([student('stu-01', { active: false })]);
      expect(raiseMonthlyFees(state, TODAY).raised).toBe(0);
   });

   it('handles a leap-day raise in February', () => {
      const result = raiseMonthlyFees(makeState([student('stu-01')]), '2024-02-29');
      expect(result.state.invoices[0]?.month).toBe('2024-03');
      expect(result.state.invoices[0]?.dueDate).toBe('2024-03-05');
      expect(result.state.invoices[0]?.raisedOn).toBe('2024-02-01');
   });
});

describe('raiseMonthLabel', () => {
   it('names the month being raised', () => {
      expect(raiseMonthLabel(TODAY)).toBe('April 2025');
   });
});
