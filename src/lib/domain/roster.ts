// Purpose: pure roster rules: unique ids, family lookup or creation, saving a student, and grouping by batch (PRD §5 /students).
import {
   BATCH_NAMES,
   FAMILY_ID_PREFIX,
   FIRST_NEW_ID_NUMBER,
   ID_SEPARATOR,
   ID_STEP,
   NEW_FAMILY_PHONE,
   STUDENT_ID_PREFIX,
} from '../constants';
import type { Family, Invoice, Payment, Student, StoreState } from '../types';
import type { StudentDraft, StudentInput } from './studentInput';

export interface StudentGroup {
   batch: string;
   students: Student[];
}

/** Why: a new id must never equal an existing one, or a new record would overwrite an old one. */
export function nextId(prefix: string, existing: string[]): string {
   const taken = new Set(existing);
   let n = FIRST_NEW_ID_NUMBER;
   while (taken.has(`${prefix}${ID_SEPARATOR}${n}`)) n += ID_STEP;
   return `${prefix}${ID_SEPARATOR}${n}`;
}

/** Why: a family typed twice (any case) links to one household, not two. */
export function resolveFamily(
   families: Family[],
   name: string,
): { families: Family[]; familyId: string } {
   const wanted = name.trim().toLowerCase();
   const match = families.find((f) => f.name.trim().toLowerCase() === wanted);
   if (match) return { families, familyId: match.id };
   const id = nextId(
      FAMILY_ID_PREFIX,
      families.map((f) => f.id),
   );
   const family: Family = { id, name: name.trim(), phone: NEW_FAMILY_PHONE };
   return { families: [...families, family], familyId: id };
}

/** Why: when a student moves family, their invoices and payments move with them so the owed totals agree. */
function moveStudentFamily(
   state: StoreState,
   studentId: string,
   familyId: string,
): { invoices: Invoice[]; payments: Payment[] } {
   const invoiceIds = new Set(
      state.invoices
         .filter((i) => i.studentId === studentId)
         .map((i) => i.id),
   );
   const invoices = state.invoices.map((i) =>
      invoiceIds.has(i.id) ? { ...i, familyId } : i,
   );
   const payments = state.payments.map((p) =>
      invoiceIds.has(p.invoiceId) ? { ...p, familyId } : p,
   );
   return { invoices, payments };
}

/**
 * Why: the form gives plain values; this stores them as a new student (when
 * studentId is null) or updates the existing one, keeping its id and active flag.
 */
export function saveStudent(
   state: StoreState,
   input: StudentInput,
   studentId: string | null,
): StoreState {
   const { families, familyId } = resolveFamily(state.families, input.familyName);
   const fields = {
      name: input.name,
      familyId,
      batch: input.batch,
      classLevel: input.classLevel,
      feeAmount: input.feeAmount,
   };
   if (studentId === null) {
      const student: Student = {
         id: nextId(
            STUDENT_ID_PREFIX,
            state.students.map((s) => s.id),
         ),
         ...fields,
         active: true,
      };
      return { ...state, families, students: [...state.students, student] };
   }
   const existing = state.students.find((s) => s.id === studentId);
   if (!existing) return state;
   const students = state.students.map((s) =>
      s.id === studentId ? { ...s, ...fields } : s,
   );
   const moved = moveStudentFamily(state, studentId, familyId);
   return { ...state, families, students, ...moved };
}

/** Why: the edit form starts from the stored values, with the family shown by name. */
export function draftForStudent(
   state: StoreState,
   studentId: string,
): StudentDraft | null {
   const student = state.students.find((s) => s.id === studentId);
   if (!student) return null;
   return {
      name: student.name,
      familyName: familyNameOf(state.families, student.familyId),
      batch: student.batch,
      classLevel: student.classLevel,
      feeAmount: student.feeAmount,
   };
}

/** Why: the roster shows a family name, never its id. */
export function familyNameOf(families: Family[], familyId: string): string {
   return families.find((f) => f.id === familyId)?.name ?? '';
}

/** Why: the roster reads batch by batch in the fixed batch order; empty batches are hidden. */
export function groupByBatch(students: Student[]): StudentGroup[] {
   return BATCH_NAMES.map((batch) => ({
      batch,
      students: students.filter((s) => s.batch === batch),
   })).filter((group) => group.students.length > 0);
}
