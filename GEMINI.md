# Class Fund Tracker (Transparency Portal)

## 📌 Tech Stack
- **Framework:** Next.js (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, PostCSS
- **Database & Auth:** Supabase (PostgreSQL with RLS), `@/lib/supabase.ts` (Browser), `@/lib/supabase-server.ts` (Server)
- **State & Server Logic:** Next.js Server Actions (`actions.ts`, `moderator-actions.ts`)
- **UI Components:** Shadcn UI (`components/ui/`), Lucide Icons

## 📁 Key Directory Map
- `app/` — App Router routes, API callbacks (`app/auth/`), auth/login (`app/login/`), and dashboards (`app/officer-dashboard/`)
- `components/` — Feature UI components (`freedom-wall`, `study-hub`, `tasks-section`, `patch-notes-modal`, etc.)
- `components/ui/` — Base reusable Shadcn design system components (`button.tsx`, etc.)
- `lib/` — Supabase client initializations (browser vs server) and helper utilities (`utils.ts`)
- `public/` — Static assets and media files

## 📐 Core Conventions & Boundaries
- **Always:** Maintain strict TypeScript types; avoid using `any`.
- **Data Mutations:** Use Next.js Server Actions for authenticated updates (`actions.ts`).
- **Supabase Clients:** Use `@/lib/supabase-server.ts` for Server Components/Actions and `@/lib/supabase.ts` for Client Components (`"use client"`).
- **Modals & States:** Keep interactive UI component logic contained within `@/components/`.
- **Ask First:** Installing new `npm` packages or altering Supabase RLS policies.
- **Never:** Hardcode API keys or secrets in source files.

## 🚀 Commands
- **Dev Server:** `npm run dev`
- **Build Check:** `npm run build`
- **Linting:** `npm run lint`