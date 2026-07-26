# Class Fund Tracker Master Plan

## 1. Objectives Overview
- **R1: Digital Proof of Payment & Officer Approval Portal**
  - Student payment receipt screenshot upload for specific unpaid weeks (GCash / Maya).
  - Officer Dashboard (`/officer-dashboard`) pending receipt queue, image preview, 1-click Approve / Reject for whitelisted officers.
  - Supabase integration via Server Actions updating student payment status for that week to 'paid'.
- **R2: Exportable Financial Audit Reports**
  - Structured CSV Data Export: Payment matrices, student payment histories, expense logs.
  - Formatted PDF Financial Statements: Total fund balance, collected dues, outstanding balances, recorded expenses.
- **R3: Component Modularization & Code Optimization**
  - Modularize `components/freedom-wall.tsx`, `components/study-hub.tsx`, and `components/tasks-section.tsx` into clean sub-components.
  - Dynamic imports using `next/dynamic` for heavy client components.

## 2. Milestone Decomposition & Workflows

### Milestone 0: Exploration & Architecture Baseline
- Explorer agent investigates current codebase layout, database schema/tables in Supabase, components, routes, server actions, and type definitions.
- Generates `analysis.md` summarizing existing setup.

### E2E Testing Track (Parallel)
- Requirement-driven opaque-box E2E testing framework.
- Creates test suites for Tiers 1-4 (Feature coverage, Boundary/Edge cases, Cross-feature interactions, Real-world workloads).
- Generates `TEST_INFRA.md` and signals `TEST_READY.md`.

### Milestone 1: R3 - Component Modularization & Optimization
- Modularize monolithic components (`freedom-wall.tsx`, `study-hub.tsx`, `tasks-section.tsx`).
- Introduce dynamic imports for heavy components.
- Ensure strict TypeScript typing and zero build errors.
- Verification via Reviewer, Challenger, and Forensic Auditor.

### Milestone 2: R1 - Digital Proof of Payment & Officer Portal
- Implement receipt upload UI and server action for linking to specific unpaid weeks.
- Build / update `/officer-dashboard` pending receipt queue with image preview modal/drawer and approve/reject actions.
- Implement server actions in `actions.ts` / `moderator-actions.ts` for Supabase status sync.
- Verification via Reviewer, Challenger, and Forensic Auditor.

### Milestone 3: R2 - Exportable Financial Audit Reports
- Implement CSV export utility and UI buttons for payment matrices, histories, expense logs.
- Implement PDF generation / export utility and UI button for financial statements.
- Verification via Reviewer, Challenger, and Forensic Auditor.

### Milestone 4: Final E2E Verification & Adversarial Hardening (Tier 5)
- Execute 100% of E2E test suite.
- Adversarial coverage hardening with Challenger & Forensic Auditor.
- Complete final human report.

## 3. Governance & Quality Control
- **Strict Rules**: No `any`, Server Actions for mutations, `@/lib/supabase-server.ts` on server, `@/lib/supabase.ts` on client.
- **Build Gating**: `npm run build` must succeed without errors.
- **Forensic Audit**: Binary veto for any cheating/hardcoding/facade implementations.
