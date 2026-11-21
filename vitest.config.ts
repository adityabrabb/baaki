// Vitest config: runs unit tests in tests/, passes when none exist yet.
import { defineConfig } from 'vitest/config';

export default defineConfig({
   test: {
      passWithNoTests: true,
   },
});
