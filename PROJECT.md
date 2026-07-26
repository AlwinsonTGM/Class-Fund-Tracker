# Project: Class Fund Tracker (Transparency Portal)

## Architecture & Overview
Class Fund Tracker is a Next.js App Router application built with React 19, TypeScript, Tailwind CSS, and Supabase.
It manages class financial transparency, payment records, proof of payment receipt submissions, officer approvals, financial exports (CSV/PDF), freedom wall, study hub, tasks, and officer administrative features.

## Code Layout
- `app/`: App router pages (`app/officer-dashboard/`, `app/auth/`, etc.)
- `components/`: UI components (`freedom-wall.tsx`, `study-hub.tsx`, `tasks-section.tsx`, etc.)
- `components/ui/`: Base Shadcn components
- `lib/`: Helper utilities (`supabase-server.ts`, `supabase.ts`, `actions.ts`, `moderator-actions.ts`, `utils.ts`)
- `public/`: Static assets

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Base Exploration | Codebase survey & architecture mapping | None | DONE |
| E2E | E2E Testing Suite | Opaque-box E2E test harness & test suite | M0 | DONE |
| M1 | Component Modularization (R3) | Modularize components and add dynamic imports | M0 | DONE |
| M2 | Digital Proof of Payment (R1) | Student receipt upload & officer approval portal | M1 | DONE |
| M3 | Financial Audit Reports (R2) | Exportable CSV & formatted PDF financial reports | M2 | DONE |
| M4 | Final E2E Pass & Hardening | Complete 100% test pass & Tier 5 adversarial audit | E2E, M3 | DONE |


## Interface Contracts
### Supabase Client Usage
- Server Components & Server Actions: `@/lib/supabase-server.ts`
- Client Components: `@/lib/supabase.ts`

### Server Actions
- User actions: `actions.ts`
- Whitelisted officer / Moderator actions: `moderator-actions.ts`
