// Purpose: builds the synthetic roster (families, students, risk tier per family) for the seed.
// Synthetic names and fake +91 numbers only; the risk mix follows PRD §8.
import type { Family, RiskBadge, Student } from '../types';
import {
   BATCH_NAMES,
   CLASS_MAX,
   CLASS_MIN,
   FAMILY_COUNT,
   FAMILY_LABEL,
   FEE_MAX,
   FEE_MIN,
   FEE_STEP,
   PHONE_DIGITS,
   PHONE_PREFIX,
   RELIABLE_FAMILY_COUNT,
   SEED_CHILD_NAMES,
   SEED_SURNAMES,
   STUDENT_COUNT,
   USUALLY_LATE_FAMILY_COUNT,
} from '../constants';
import type { Rng } from './rng';

export interface SeedRoster {
   families: Family[];
   students: Student[];
   riskByFamily: Record<string, RiskBadge>;
}

const ID_WIDTH = 2;

/** Why: stable zero-padded ids keep seed output readable and sortable. */
export function padNumber(value: number, width: number): string {
   return String(value).padStart(width, '0');
}

/** Why: the first 17 families are reliable, next 8 usually late, rest risky. */
export function riskTierFor(index: number): RiskBadge {
   if (index < RELIABLE_FAMILY_COUNT) return 'reliable';
   if (index < RELIABLE_FAMILY_COUNT + USUALLY_LATE_FAMILY_COUNT) {
      return 'usually_late';
   }
   return 'risky';
}

/** Why: the first 28 students get one family each; the last 4 are siblings. */
export function familyIndexForStudent(studentIndex: number): number {
   return studentIndex < FAMILY_COUNT ? studentIndex : studentIndex - FAMILY_COUNT;
}

/** Why: fees are integer rupees in steps of FEE_STEP between FEE_MIN and FEE_MAX. */
function feeFor(rng: Rng): number {
   const steps = (FEE_MAX - FEE_MIN) / FEE_STEP;
   return FEE_MIN + rng.int(0, steps) * FEE_STEP;
}

/** Why: builds families and students with fixed counts so the roster is stable. */
export function buildRoster(rng: Rng): SeedRoster {
   const families: Family[] = [];
   const riskByFamily: Record<string, RiskBadge> = {};
   for (let i = 0; i < FAMILY_COUNT; i++) {
      const id = `fam-${padNumber(i + 1, ID_WIDTH)}`;
      const surname = SEED_SURNAMES[i % SEED_SURNAMES.length] ?? FAMILY_LABEL;
      families.push({
         id,
         name: `${surname} ${FAMILY_LABEL}`,
         phone: `${PHONE_PREFIX}${padNumber(i + 1, PHONE_DIGITS)}`,
      });
      riskByFamily[id] = riskTierFor(i);
   }

   const students: Student[] = [];
   for (let s = 0; s < STUDENT_COUNT; s++) {
      const family = families[familyIndexForStudent(s)];
      if (!family) throw new RangeError('Roster has fewer families than students');
      students.push({
         id: `stu-${padNumber(s + 1, ID_WIDTH)}`,
         name: SEED_CHILD_NAMES[s % SEED_CHILD_NAMES.length] ?? 'Student',
         familyId: family.id,
         batch: BATCH_NAMES[s % BATCH_NAMES.length] ?? BATCH_NAMES[0],
         classLevel: rng.int(CLASS_MIN, CLASS_MAX),
         feeAmount: feeFor(rng),
         active: true,
      });
   }
   return { families, students, riskByFamily };
}
