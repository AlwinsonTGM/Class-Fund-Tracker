## 2026-07-26T13:35:51Z
MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You are Worker Fix for Milestone 2: Mobile Button Ergonomics & Touch Targets Remediation.
Your working directory is: c:\Users\PC\Documents\Transparency\class-fund-tracker\.agents\m2_worker_fix

Read the Challenger 1 findings report:
- Handoff report: c:\Users\PC\Documents\Transparency\class-fund-tracker\.agents\m2_challenger_1\handoff.md

Objective:
Remediate all 6 specific remaining sub-44px touch target violations and modal footer wrapping issues identified during Milestone 2 Challenger review.

Specific Fix Tasks:
1. `components/tasks-section/task-filter-header.tsx`: Refactor active filter chip remove `X` icon buttons to have min 44x44px touch footprint (`p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center`).
2. `components/freedom-wall/sandbox-tools.tsx`: Upgrade physics tool buttons (Bomb, Magnet, Tornado) to `min-h-[44px] min-w-[44px] p-2.5`.
3. `components/manage-weeks-panel.tsx`: Upgrade add week number input field and button to `min-h-[44px]`.
4. `components/study-hub/add-study-material-modal.tsx`: Upgrade target scope buttons (Lesson, Week, Task) to `min-h-[44px]`.
5. `components/freedom-wall/post-reactions.tsx`: Upgrade emoji palette reaction picker buttons from `size-9` to `size-11 min-h-[44px] min-w-[44px]`.
6. `components/study-hub/embed-viewer-modal.tsx`: Upgrade "Open Reviewer & Download" anchor button to `min-h-[44px]`.
7. `components/officer-receipt-approval-queue.tsx`: Upgrade alert dismiss close icon buttons to `min-h-[44px] min-w-[44px] p-3`.
8. Modal Footers (`add-study-material-modal.tsx`, `add-post-modal.tsx`, `task-form-modal.tsx`, `record-expense-modal.tsx`, `financial-audit-report-modal.tsx`): Ensure responsive flex wrapping (`flex-col-reverse xs:flex-row gap-2.5`) so modal action buttons wrap cleanly on 320px screens.

Build & Test Verification Requirement:
- Run `npm run build` and ensure clean compilation with 0 TypeScript/Next.js errors.
- Run `npm run test:e2e` (`npx tsx scripts/run-e2e-tests.ts`) and ensure all 37 test cases pass.

Deliverables:
- Save handoff report to `c:\Users\PC\Documents\Transparency\class-fund-tracker\.agents\m2_worker_fix\handoff.md`.
- Send message to parent summarizing fixes implemented and test results.
