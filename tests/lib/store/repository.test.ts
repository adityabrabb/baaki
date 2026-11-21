// Purpose: checks the localStorage repository against an in-memory fake: seeding, corrupt data, and round-trips.
import { describe, expect, it } from 'vitest';
import { STORAGE_KEY } from '../../../src/lib/constants';
import { createLocalStorageRepository } from '../../../src/lib/store/repository';
import { buildSeedState } from '../../../src/lib/store/seed';
import { TODAY } from '../../fixtures/state';

/** Why: an in-memory stand-in for window.localStorage, keyed like the real one. */
function fakeStorage(initial: Record<string, string> = {}) {
   const data = new Map<string, string>(Object.entries(initial));
   return {
      data,
      getItem: (key: string): string | null => data.get(key) ?? null,
      setItem: (key: string, value: string): void => {
         data.set(key, value);
      },
   };
}

describe('createLocalStorageRepository', () => {
   it('writes the seed on first load of empty storage', () => {
      const storage = fakeStorage();
      const repo = createLocalStorageRepository(() => storage);
      const state = repo.load(TODAY);
      expect(state).toEqual(buildSeedState(TODAY));
      expect(storage.data.get(STORAGE_KEY)).toBe(JSON.stringify(state));
   });

   it('resets to the seed when the stored JSON is corrupt', () => {
      const storage = fakeStorage({ [STORAGE_KEY]: '{not json' });
      const repo = createLocalStorageRepository(() => storage);
      expect(repo.load(TODAY)).toEqual(buildSeedState(TODAY));
   });

   it('resets to the seed when the stored data fails the schema', () => {
      const storage = fakeStorage({
         [STORAGE_KEY]: JSON.stringify({ version: 1, business: 'nope' }),
      });
      const repo = createLocalStorageRepository(() => storage);
      expect(repo.load(TODAY)).toEqual(buildSeedState(TODAY));
   });

   it('resets to the seed when the stored schema version is unknown', () => {
      const seed = buildSeedState(TODAY);
      const storage = fakeStorage({
         [STORAGE_KEY]: JSON.stringify({ ...seed, version: 2 }),
      });
      const repo = createLocalStorageRepository(() => storage);
      expect(repo.load(TODAY)).toEqual(seed);
   });

   it('round-trips a saved state through load', () => {
      const storage = fakeStorage();
      const repo = createLocalStorageRepository(() => storage);
      const edited = {
         ...buildSeedState(TODAY),
         business: { ...buildSeedState(TODAY).business, name: 'Test Classes' },
      };
      expect(repo.save(edited)).toBe(true);
      expect(repo.load(TODAY)).toEqual(edited);
   });

   it('reports a failed save and falls back to the seed when storage is absent', () => {
      const repo = createLocalStorageRepository(() => null);
      expect(repo.save(buildSeedState(TODAY))).toBe(false);
      expect(repo.load(TODAY)).toEqual(buildSeedState(TODAY));
   });
});
