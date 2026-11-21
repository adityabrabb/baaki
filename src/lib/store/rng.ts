// Purpose: deterministic mulberry32 PRNG so the same seed always yields the same data.
// Pure: no clock, no Math.random.
import {
   MULBERRY_INCREMENT,
   MULBERRY_MASK_B,
   MULBERRY_ODD_MASK,
   MULBERRY_SHIFT_A,
   MULBERRY_SHIFT_B,
   MULBERRY_SHIFT_C,
   UINT32_RANGE,
} from '../constants';

export interface Rng {
   /** Returns a float in [0, 1). */
   next: () => number;
   /** Returns an integer in [min, max], inclusive. */
   int: (min: number, max: number) => number;
   /** Returns one item chosen uniformly. */
   pick: <T>(items: readonly T[]) => T;
}

/** Why: a tiny, well-known 32-bit PRNG with no dependency. */
export function createRng(seed: number): Rng {
   let state = seed >>> 0;
   const next = (): number => {
      state = (state + MULBERRY_INCREMENT) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> MULBERRY_SHIFT_A), t | MULBERRY_ODD_MASK);
      t ^= t + Math.imul(t ^ (t >>> MULBERRY_SHIFT_B), t | MULBERRY_MASK_B);
      return ((t ^ (t >>> MULBERRY_SHIFT_C)) >>> 0) / UINT32_RANGE;
   };
   const int = (min: number, max: number): number =>
      min + Math.floor(next() * (max - min + 1));
   const pick = <T>(items: readonly T[]): T => items[int(0, items.length - 1)] as T;
   return { next, int, pick };
}
