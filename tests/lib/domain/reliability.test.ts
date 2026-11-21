// Purpose: checks reliability scoring and badges for one family's recent history.
import { describe, expect, it } from 'vitest';
import {
   badgeForDelay,
   reliability,
} from '../../../src/lib/domain/reliability';
import { TODAY, invoice, makeState, payment } from '../../fixtures/state';

describe('reliability', () => {
   it('scores a mostly on-time family as reliable', () => {
      const state = makeState({
         invoices: [
            invoice('a1', 'fa', '2024-11-05'),
            invoice('a2', 'fa', '2024-12-05'),
            invoice('a3', 'fa', '2025-01-05'),
         ],
         payments: [
            payment('pa1', 'a1', 'fa', 1500, '2024-11-05'),
            payment('pa2', 'a2', 'fa', 1500, '2024-12-05'),
            payment('pa3', 'a3', 'fa', 1500, '2025-01-08'),
         ],
      });
      const r = reliability(state, 'fa', TODAY);
      expect(r.sampleSize).toBe(3);
      expect(r.avgDelayDays).toBe(1);
      expect(r.score).toBe(67);
      expect(r.badge).toBe('reliable');
      expect(r.label).toBe('Reliable');
   });

   it('gives a reliable default when there is no history', () => {
      const r = reliability(makeState(), 'fc', TODAY);
      expect(r).toEqual({
         familyId: 'fc',
         sampleSize: 0,
         score: null,
         avgDelayDays: 0,
         badge: 'reliable',
         label: 'Reliable',
      });
   });

   it('ignores part-paid invoices until they are fully settled', () => {
      const state = makeState({
         invoices: [
            invoice('b1', 'fb', '2024-11-05'),
            invoice('b2', 'fb', '2025-01-05'),
         ],
         payments: [
            payment('pb1', 'b1', 'fb', 500, '2024-11-05'),
            payment('pb2', 'b1', 'fb', 1000, '2024-11-12'),
            payment('pb3', 'b2', 'fb', 500, '2025-01-05'),
         ],
      });
      const r = reliability(state, 'fb', TODAY);
      expect(r.sampleSize).toBe(1);
      expect(r.avgDelayDays).toBe(7);
      expect(r.badge).toBe('usually_late');
      expect(r.label).toBe('Usually late');
   });

   it('maps average delay to badge at the thresholds', () => {
      expect(badgeForDelay(3)).toBe('reliable');
      expect(badgeForDelay(4)).toBe('usually_late');
      expect(badgeForDelay(15)).toBe('usually_late');
      expect(badgeForDelay(16)).toBe('risky');
   });
});
