## 2026-07-26T08:09:49Z

You are the E2E Testing Specialist for the Class Fund Tracker project.

Your working directory is: `c:\Users\PC\Documents\Transparency\class-fund-tracker\.agents\e2e_testing`
Project root: `c:\Users\PC\Documents\Transparency\class-fund-tracker`

Your Task:
Create a comprehensive, automated E2E opaque-box test suite for the Class Fund Tracker requirements based on `ORIGINAL_REQUEST.md`.

Requirements to test:
- R1: Digital Proof of Payment & Officer Approval Portal (receipt upload, payment status sync, pending receipt queue, approve/reject server actions).
- R2: Exportable Financial Audit Reports (CSV data export formats/headers for payments, expenses, audit logs; PDF/printable financial statement structure and metrics).
- R3: Component Modularization & Code Optimization (Dynamic imports lazy-loading check, modular UI component loading, build zero-error check).

Test Suite Requirements:
1. Create a test runner script/suite (e.g. Node/TypeScript test runner script, e.g. `scripts/run-e2e-tests.ts` or `tests/e2e.test.ts` or standalone executable runner via tsx/node) that runs all test cases cleanly with exit code 0 on pass.
2. Design test cases across 4 Tiers:
   - Tier 1: Feature Coverage (>=5 tests per feature for R1, R2, R3 happy paths)
   - Tier 2: Boundary & Corner Cases (empty datasets, zero balances, invalid receipt formats, unauthorized approval attempts, invalid file extensions)
   - Tier 3: Cross-Feature Combinations (submitting payment receipt -> officer approving -> CSV/PDF audit report updating total balances)
   - Tier 4: Real-World Application Scenarios (full end-to-end user workflows from receipt submission through approval, modular UI navigation, and audit report generation)
3. Ensure the test runner can be executed with a single command (e.g., `npx tsx scripts/run-e2e-tests.ts` or `npm run test:e2e`).
4. Write `TEST_INFRA.md` at project root documenting test architecture, feature inventory, tier counts, and invocation command.
5. Once the test runner script and all test cases are implemented, create `TEST_READY.md` at project root summarizing total counts per tier and command to execute.
6. Verify your test script runs (some tests for new features may fail until implemented, but harness must execute cleanly and report results).
7. Document your work in `c:\Users\PC\Documents\Transparency\class-fund-tracker\.agents\e2e_testing\handoff.md` and send a message to parent when done.
