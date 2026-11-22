# Built with Codebenders: prompt and iteration log

Built in the Codebenders IDE with a custom baaki-builder agent, plus reviewer and qa agents.


## Entry 1: setup tooling
- Prompt: set up tooling (prettier, vitest, check/format scripts, env example, placeholder home page).
- Changes: added .prettierrc, vitest.config.ts (passWithNoTests), package.json scripts `check` and `format`, .env.example (GEMINI_API_KEY, GEMINI_MODEL), src/app/page.tsx now shows only "Baaki".
- Iterations: none yet; verification (npm run check, npm run build) run by tester after this entry.



## [time not recorded] data + domain
- Prompt: "Slice: data + domain. PRD §6, §8, §9 — types, constants, dates, seeded seed generator, localStorage repository (baaki:v1), pure domain functions, Vitest tests with fixed today."
- Changes: src/lib/types.ts, src/lib/constants.ts, src/lib/dates.ts, src/lib/store/ (seed, seed-people, seed-money, rng, schema, repository), src/lib/domain/ (reliability, expectedPayDate, forecast, alerts, chasePriority, whatIf, parseQuickAdd, formatINR), tests/ (fixtures + lib tests).
- Iterations: first check had a tsc error in parseQuickAdd test (union narrowing) and the seed produced 16 overdue as of 2025-03-15 (spec 8-10); fixed in test and seed-money.ts; a seed test now asserts 8-10. Final: lint, tsc, vitest green (63 tests).
- Decisions (PRD gaps): invoice status derived from payments; settings holds tone and language only; rent stays on day 1; pessimistic forecast excludes Risky families; reliability counts only fully paid invoices from last 6 months; fee raise applies from next month's fee due day.



## [time not recorded] forecast-what-if
- Prompt: "/forecast what-if: reuse whatIf(); scenario picker (Normal, Top 5 late, one family late with N-day slider, lose K students stepper, raise fees X% slider); dashed scenario line over expected; one comparison sentence."
- Changes: whatIf() takes an optional options object (family, late days, leavers, fee rise %) that defaults to the PRD values, so existing calls are unchanged; forecast model draws the dashed line and the comparison sentence (status words from billStatusOf/BILL_STATUS_WORDS); new WhatIfPicker, WhatIfControls, WhatIfFamilySelect, WhatIfRangeField, WhatIfStepper, whatIfSentence; WhatIfChip removed; constants for limits and copy; Vitest cases for the new options.
- Iterations: none recorded. Lint and tests were not run (no shell in this session); run npm run check.

