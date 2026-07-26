# Original Task Request — m4_auditor_v2

Perform Final Forensic Integrity Audit for Class Fund Tracker (Milestone 4).

## Objectives
1. Inspect entire codebase across R1, R2, and R3 for integrity violations (hardcoded test results, facade implementations, fake outputs, formula injection vulnerabilities, or improper Supabase client usage).
2. Execute TypeScript check (`npx tsc --noEmit`), production build (`npm run build`), and automated E2E test suite (`npm run test:e2e`).
3. Render a final verdict: CLEAN or INTEGRITY VIOLATION.
4. Output structured forensic audit report in `handoff.md` and send message to orchestrator.
