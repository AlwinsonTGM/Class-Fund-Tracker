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
- `components/multiverse-of-sadness/` — Standalone Multiverse of Sadness game components (`multiverse-game-standalone.tsx`, `ui/`, `multiverse-config.ts`, `multiverse-renderer.ts`)
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

---

## 🎨 Multiverse of Sadness Canonical Design System (STRICT & MANDATORY)
All current and future modifications to Multiverse of Sadness **MUST strictly adhere** to the original HTML/CSS design system. Do NOT let AI agents simplify, alter, or replace these aesthetics with generic UI frameworks.

### 1. Typography System
- **Google Fonts Import:** Must always include `<link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Space+Grotesk:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">` in `head` and `@import` in `globals.css`.
- **Font Loading:** Always call `document.fonts.load("13px 'Special Elite'")` on component mount to guarantee Canvas text (`Special Elite`) renders accurately.
- **Font Hierarchy Rules:**
  - `Special Elite` (`font-['Special_Elite']`): STRICTLY reserved for:
    - Main page title: `Multiverse of Sadness` (`text-[clamp(25px,4.2vw,42px)] font-normal tracking-[3px] text-[#e9f0f7] uppercase leading-[1.05]`)
    - Version badge `.seq`: `text-[0.42em] tracking-[2px] text-[#d9a441] border border-[rgba(217,164,65,0.5)] px-[8px] py-[3px]`
    - Universe numbers: `#001`, `#014`, etc.
    - Panel headers (`.panel-h`): `text-[12.5px] tracking-[2.5px] uppercase text-[#d9a441]`
    - Epitaph quotes (`.epitaph`): `text-[19px] text-[#e9f0f7] leading-[1.5]`
    - Universe Card title (`.uname`): `text-[27px] text-[#e9f0f7] tracking-[1px]`
    - HUD universe name: `text-[12px] text-[#d9a441]`
  - `Space Grotesk` (`font-['Space_Grotesk']`): MUST be used for ALL body text, taglines (`.tag`: `color: #7f93a8; font-size: 13px; letter-spacing: 0.4px`), subtitles, descriptions, HUD labels (`.lbl`), stat labels, control lists, porting notes, keybindings (`kbd`), and modal descriptions. Never use `font-serif` or generic fonts.

### 2. Color Palette & Visual Tokens
- Background: `--bg: #0a0f16` with dual radial atmospheric gradients (`radial-gradient(...)`).
- Panels: `--panel: #0e1622`, `--panel2: #111b29` (`linear-gradient(180deg, #111b29, #0e1622)`).
- Borders: `--line: #22344a`.
- Text Colors: Ink `--ink: #c9d6e2`, Dim `--dim: #7f93a8`, Bright `--bright: #e9f0f7`, Amber `--amber: #d9a441`, Rain `--rain: #96b6d6`.

### 3. Ambient Rain & Atmospheric Layering
- Seamless background rain pseudo-elements (`.multiverse-rain::before` and `.multiverse-rain::after` with keyframes `fallA` `.85s` & `fallB` `1.4s`).
- Radial vignette mask (`.atmo-vig`: `background: radial-gradient(120% 100% at 50% 30%, transparent 58%, rgba(2,4,8,.5))`).

### 4. Components & Control Layouts
- **Pills**: `.pill` (`border border-[#22344a]` / `text-[#7f93a8]`) and `.pill.amber` (`border border-[rgba(217,164,65,0.45)]` / `text-[#d9a441]`) with uppercase tracking (`1.8px`).
- **Action Buttons (`#again`)**: `border border-[rgba(217,164,65,0.55)]`, text `#d9a441`, uppercase tracking `3px`, hover fill `#d9a441` with dark text `#141008` and amber glow `box-shadow: 0 8px 26px rgba(217,164,65,0.28)`.
- **Side Panel (`.side`)**: Width `302px` on desktop, `.panel` containers with `.panel-h` headers having trailing line accents (`linear-gradient(90deg, #22344a, transparent)`).
- **Overlays**:
  - Start Overlay: `a flappy bird mod · concept build`, `Multiverse of Sadness` (34px uppercase), `the pipes are randomized. so is the grief.`, `kbd space`, `contains: rain...`.
  - Dead Overlay: `run #X concluded`, epitaph 19px, 4 stat blocks (`emotional damage`, `tears shed`, `universes felt`, `best damage`), `#again` feel again button, `the void has noted your flap count: X`.
- **Footer**: `multiverse of sadness ii — a concept build for your flappy mode` | `no birds were harmed. only mildly devastated.`.

---

## 🚀 Commands
- **Dev Server:** `npm run dev`
- **Build Check:** `npm run build`
- **Linting:** `npm run lint`