// Purpose: tests for ageing buckets and total owed (PRD §5 /owed): boundaries, empty input and leap day.
import { describe, expect, it } from 'vitest';
import {
   DEFAULT_LANGUAGE,
   DEFAULT_TONE,
   SCHEMA_VERSION,
} from '../../../src/lib/constants';
import {
   ageingBuckets,
   bucketIdFor,
   totalOwed,
} from '../../../src/lib/domain/ageing';
import type { Invoice, Payment, StoreState } from '../../../src/lib/types';

const TODAY = '2025-03-10';

function invoice(id: string, amount: number, dueDate: string): Invoice {
   return {
      id,
      studentId: 'stu-1',
      familyId: 'fam-1',
      month: '2025-03',
      amount,
      raisedOn: '2025-03-01',
      dueDate,
   };
}

function stateWith(invoices: Invoice[], payments: Payment[] = []): StoreState {
   return {
      version: SCHEMA_VERSION,
      business: {
         name: 'Test Classes',
         openingBalance: 0,
         buffer: 0,
         upiId: 'test@upi',
      },
      families: [],
      students: [],
      invoices,
      payments,
      reminders: [],
      bills: [],
      settings: { defaultTone: DEFAULT_TONE, defaultLanguage: DEFAULT_LANGUAGE },
   };
}

describe('bucketIdFor', () => {
   it('keeps 0 and 7 days late in the first bucket', () => {
      expect(bucketIdFor(0)).toBe('days_0_7');
      expect(bucketIdFor(7)).toBe('days_0_7');
   });

   it('moves 8 and 30 days late into the middle bucket', () => {
      expect(bucketIdFor(8)).toBe('days_8_30');
      expect(bucketIdFor(30)).toBe('days_8_30');
   });

   it('puts 31 days late and beyond in the 30+ bucket', () => {
      expect(bucketIdFor(31)).toBe('days_30_plus');
      expect(bucketIdFor(365)).toBe('days_30_plus');
   });
});

describe('ageingBuckets', () => {
   it('returns three empty buckets for an empty khata', () => {
      const buckets = ageingBuckets(stateWith([]), TODAY);
      expect(buckets).toHaveLength(3);
      expect(buckets.map((b) => b.count)).toEqual([0, 0, 0]);
      expect(buckets.map((b) => b.total)).toEqual([0, 0, 0]);
   });

   it('skips invoices due today, since they are not overdue yet', () => {
      const buckets = ageingBuckets(
         stateWith([invoice('inv-1', 1500, TODAY)]),
         TODAY,
      );
      expect(buckets.map((b) => b.count)).toEqual([0, 0, 0]);
   });

   it('places the 7, 8, 30 and 31 day boundaries in the right buckets', () => {
      const buckets = ageingBuckets(
         stateWith([
            invoice('inv-7', 100, '2025-03-03'),
            invoice('inv-8', 200, '2025-03-02'),
            invoice('inv-30', 300, '2025-02-08'),
            invoice('inv-31', 400, '2025-02-07'),
         ]),
         TODAY,
      );
      expect(buckets.map((b) => b.total)).toEqual([100, 500, 400]);
      expect(buckets.map((b) => b.count)).toEqual([1, 2, 1]);
   });

   it('counts only the unpaid balance of a partly paid invoice', () => {
      const payments: Payment[] = [
         {
            id: 'pay-1',
            invoiceId: 'inv-1',
            familyId: 'fam-1',
            amount: 400,
            method: 'cash',
            date: '2025-03-05',
         },
      ];
      const buckets = ageingBuckets(
         stateWith([invoice('inv-1', 1000, '2025-03-01')], payments),
         TODAY,
      );
      expect(buckets[1].total).toBe(600);
      expect(buckets[1].count).toBe(1);
   });

   it('leaves out a fully paid overdue invoice', () => {
      const payments: Payment[] = [
         {
            id: 'pay-1',
            invoiceId: 'inv-1',
            familyId: 'fam-1',
            amount: 1000,
            method: 'upi',
            date: '2025-03-05',
         },
      ];
      const buckets = ageingBuckets(
         stateWith([invoice('inv-1', 1000, '2025-03-01')], payments),
         TODAY,
      );
      expect(buckets.map((b) => b.count)).toEqual([0, 0, 0]);
   });

   it('ages a leap-day due date correctly', () => {
      const buckets = ageingBuckets(
         stateWith([invoice('inv-leap', 1500, '2024-02-29')]),
         '2024-03-01',
      );
      expect(buckets[0].count).toBe(1);
      expect(buckets[0].total).toBe(1500);
   });
});

describe('totalOwed', () => {
   it('is zero for an empty khata', () => {
      expect(totalOwed(stateWith([]))).toBe(0);
   });

   it('includes invoices that are not yet due', () => {
      const total = totalOwed(
         stateWith([
            invoice('inv-1', 1500, '2025-03-20'),
            invoice('inv-2', 2000, '2025-03-01'),
         ]),
      );
      expect(total).toBe(3500);
   });

   it('never goes negative when a payment exceeds the invoice', () => {
      const payments: Payment[] = [
         {
            id: 'pay-1',
            invoiceId: 'inv-1',
            familyId: 'fam-1',
            amount: 2000,
            method: 'upi',
            date: '2025-03-05',
         },
      ];
      expect(
         totalOwed(stateWith([invoice('inv-1', 1500, '2025-03-01')], payments)),
      ).toBe(0);
   });
});
