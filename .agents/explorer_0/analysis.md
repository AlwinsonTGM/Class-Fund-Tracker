# Class Fund Tracker — Comprehensive Codebase Survey & Analysis Report

**Explorer Agent:** `explorer_0`  
**Date:** July 26, 2026  
**Working Directory:** `c:\Users\PC\Documents\Transparency\class-fund-tracker\.agents\explorer_0`  
**Project Root:** `c:\Users\PC\Documents\Transparency\class-fund-tracker`

---

## 1. Project Overview & Architecture

### Tech Stack & Core Libraries
- **Framework:** Next.js 16.2.6 (App Router), React 19 (`react`, `react-dom`)
- **Language:** TypeScript 5.7.3 (`@types/node`, `@types/react`)
- **Styling:** Tailwind CSS 4.2.0 (`@tailwindcss/postcss`, `postcss`), `tw-animate-css`, `clsx`, `tailwind-merge`
- **UI & Icons:** Lucide React (`lucide-react`), Shadcn UI (`components/ui/`), `@base-ui/react`
- **Backend & Database:** Supabase (`@supabase/supabase-js` v2.110.6, `@supabase/ssr` v0.12.3)
- **Analytics:** `@vercel/analytics` v1.6.1

### Project Key Directory Map
```
c:\Users\PC\Documents\Transparency\class-fund-tracker\
├── app/
│   ├── api/resource-reviewer/         # AI Resource reviewer endpoints
│   ├── auth/
│   │   ├── callback/route.ts          # Supabase auth OAuth callback handler
│   │   └── reset-password/page.tsx    # Password reset page
│   ├── flappy-bird/                   # Mini-game page & server actions
│   │   ├── actions.ts
│   │   └── page.tsx
│   ├── login/                         # Officer login & actions
│   │   ├── actions.ts                 # loginAction, signOutAction, resetPasswordAction
│   │   └── page.tsx
│   ├── officer-dashboard/             # Officer Management Dashboard
│   │   ├── actions.ts                 # Main Server Actions (payments, expenses, tasks, study materials, class docs)
│   │   ├── moderator-actions.ts       # Whitelisted moderator actions (audit log edit/reversal)
│   │   └── page.tsx                   # Officer dashboard route
│   ├── globals.css                    # Tailwind & custom CSS rules
│   ├── layout.tsx                     # Root app layout with ToastProvider
│   └── page.tsx                       # Public main transparency portal
├── components/                        # Application feature UI components
│   ├── add-expense-modal.tsx          # Expense entry modal (8,189 bytes, 196 lines)
│   ├── balance-card.tsx               # Treasury balance & 3D tilt card (4,015 bytes, 110 lines)
│   ├── bottom-nav.tsx                 # Floating bottom navigation bar (3,494 bytes, 142 lines)
│   ├── freedom-wall.tsx               # Freedom wall sticky notes & physics canvas (83,171 bytes, 1,951 lines)
│   ├── inline-login.tsx               # Inline auth form (11,941 bytes, 280 lines)
│   ├── manage-weeks-panel.tsx         # Week configuration panel (12,209 bytes, 305 lines)
│   ├── officer-payment-list.tsx       # Officer student payment checklist (11,777 bytes, 277 lines)
│   ├── officer-tabs-container.tsx     # Officer dashboard container (11,717 bytes, 326 lines)
│   ├── patch-notes-modal.tsx          # Release notes modal (26,863 bytes, 366 lines)
│   ├── public-tabs-container.tsx      # Public user container (11,517 bytes, 338 lines)
│   ├── recent-activity.tsx            # Audit log feed (12,901 bytes, 301 lines)
│   ├── student-payment-list.tsx       # Public student payment list (8,554 bytes, 190 lines)
│   ├── study-hub.tsx                  # Study materials & class docs hub (73,195 bytes, 1,465 lines)
│   ├── tasks-section.tsx              # Tasks & assignments section (65,832 bytes, 1,412 lines)
│   ├── theme-toggle.tsx               # Light/Dark mode toggle (1,436 bytes, 46 lines)
│   ├── flappy-bird/                   # Flappy Bird game components
│   └── ui/                            # Base Shadcn UI design components (button.tsx, toast.tsx)
├── lib/
│   ├── sound.ts                       # Audio synthesizer utility (5,834 bytes)
│   ├── supabase-server.ts             # Supabase SSR client for Server Components / Server Actions (793 bytes, 30 lines)
│   ├── supabase.ts                    # Supabase browser client for Client Components (321 bytes, 8 lines)
│   └── utils.ts                       # Tailwind helper `cn()` utility (166 bytes)
├── sql/                               # Supabase PostgreSQL schema scripts & RLS policies
│   ├── add_song_to_freedom_posts.sql  # Freedom wall song column migration
│   ├── class_documents.sql            # Class documents schema & RLS
│   ├── flappy_bird_scores.sql         # High scores table & RLS
│   ├── rls_policies.sql               # Core RLS security policies & helper functions (475 lines)
│   └── study_materials.sql            # Study hub materials table & RLS
├── GEMINI.md                          # Repository rules & Tech Stack definitions
├── PROJECT.md                         # Project milestones & contract definitions
└── package.json                       # Dependencies & npm scripts
```

### Supabase Architecture & Authentication
1. **Client Initializations:**
   - Client-side: `lib/supabase.ts` uses `createClient` from `@supabase/supabase-js`.
   - Server-side: `lib/supabase-server.ts` uses `createServerClient` from `@supabase/ssr` with Next.js `cookies()`.
2. **Access Control & Whitelisting:**
   - RLS Helper Functions in Postgres (`sql/rls_policies.sql`): `is_officer()`, `is_moderator()`, `is_officer_or_moderator()` check `auth.jwt() ->> 'email'` against `public.officers` and `public.moderators` tables.
   - Server Actions Verification (`app/officer-dashboard/actions.ts`): `verifyOfficerStatus()` verifies user auth and checks membership in `officers` or `moderators` tables.
   - Moderator Actions Verification (`app/officer-dashboard/moderator-actions.ts`): `verifyModeratorStatus()` verifies email is present in `moderators` table.

---

## 2. Database Schema Survey

Below is the complete database table structure derived from `sql/rls_policies.sql`, `sql/study_materials.sql`, `sql/class_documents.sql`, and `app/officer-dashboard/actions.ts`.

| Table Name | Primary Columns & Types | RLS Policy Summary |
|---|---|---|
| `public.students` | `id` (BIGINT PK), `first_name` (TEXT), `last_name` (TEXT), `seat_number` (INT), `created_at` (TIMESTAMPTZ) | Public select. Officers insert/update/delete. |
| `public.payments` | `id` (BIGINT PK), `student_id` (FK -> students.id), `week_number` (INT), `status` (TEXT 'paid') | Public select. Officers insert/update/delete. |
| `public.expenses` | `id` (BIGINT PK), `description` (TEXT), `amount` (NUMERIC), `recorded_by` (TEXT), `created_at` (TIMESTAMPTZ) | Public select. Officers insert/update/delete. |
| `public.weeks` | `id` (BIGINT PK), `week_number` (INT UNIQUE), `date_range` (TEXT), `status` (TEXT 'active'/'suspended'/'break') | Public select. Officers & moderators insert/update/delete. |
| `public.audit_logs` | `id` (BIGINT PK), `officer_email` (TEXT), `action_description` (TEXT), `created_at` (TIMESTAMPTZ) | Public select. Officers & moderators insert. Moderators edit/delete. |
| `public.officers` | `id` (BIGINT PK), `email` (TEXT UNIQUE), `created_at` (TIMESTAMPTZ) | Authenticated select. No app writes (managed via Supabase dashboard). |
| `public.moderators` | `id` (BIGINT PK), `email` (TEXT UNIQUE), `created_at` (TIMESTAMPTZ) | Authenticated select. Officers insert/update/delete. |
| `public.courses` | `id` (BIGINT PK), `code` (TEXT), `name` (TEXT), `created_at` (TIMESTAMPTZ) | Public select. Officers insert/update/delete. |
| `public.tasks` | `id` (BIGINT PK), `title` (TEXT), `description` (TEXT), `course_id` (FK -> courses.id), `task_type` (TEXT), `participation_type` (TEXT), `group_size` (TEXT), `priority` (TEXT), `status` (TEXT), `due_date` (TIMESTAMPTZ), `background_image` (TEXT), `is_private` (BOOL), `created_by` (TEXT), `created_at` (TIMESTAMPTZ) | Public select if `is_private=false`, creator select if `is_private=true`. Officers write public tasks; creators write personal tasks. |
| `public.freedom_posts` | `id` (BIGINT PK), `content` (TEXT), `author_name` (TEXT), `color` (TEXT), `song_data` (JSONB), `created_at` (TIMESTAMPTZ) | Public select. Authenticated insert. Officers & moderators update/delete. |
| `public.study_materials` | `id` (BIGINT PK), `title` (TEXT), `description` (TEXT), `link` (TEXT), `category` (TEXT), `study_type` (TEXT), `course_id` (FK -> courses.id), `week_number` (INT), `lesson_name` (TEXT), `task_name` (TEXT), `submitted_by` (TEXT), `approved` (BOOL), `created_at` (TIMESTAMPTZ) | Public select if `approved=true`. Officers & moderators select all. Public insert (`approved=false`). Officers/moderators update/delete. |
| `public.class_documents` | `id` (BIGINT PK), `title` (TEXT), `document_type` (TEXT 'md'/'pdf'), `content` (TEXT), `link` (TEXT), `submitted_by` (TEXT), `created_at` (TIMESTAMPTZ) | Public select. Officers & moderators insert/update/delete. |

---

## 3. R3 Inspection: Component Modularization & Dynamic Imports

### Targeted Monolithic Components
1. `components/freedom-wall.tsx` (1,951 lines, 83,171 bytes)
2. `components/study-hub.tsx` (1,465 lines, 73,195 bytes)
3. `components/tasks-section.tsx` (1,412 lines, 65,832 bytes)

### Detailed Analysis & Refactoring Plan

#### A. Freedom Wall (`components/freedom-wall.tsx`)
- **Current State:** Contains physics loop, 2D particle/bomb/magnet/tornado physics simulation, full iTunes API search client, audio preview player, emoji reaction manager (local storage), zoom modal, and sticky note scatter/grid rendering logic in a single file.
- **Candidates for Extraction:**
  1. `components/freedom-wall/song-mini-player.tsx`: Audio player element with play/pause state and progress indicators.
  2. `components/freedom-wall/song-search-input.tsx`: iTunes API search input, debounced query, and dropdown list.
  3. `components/freedom-wall/post-reactions.tsx`: Emoji reaction bar, reaction counts, and local storage state.
  4. `components/freedom-wall/freedom-post-card.tsx`: Sticky note post card rendering with tilt & drag handles.
  5. `components/freedom-wall/add-post-modal.tsx`: Post submission dialog overlay.
  6. `components/freedom-wall/sandbox-tools.tsx`: Interactive physics tools bar (Bomb, Magnet, Tornado).
- **Heavy Client Dynamic Imports:**
  - Apply `next/dynamic` for `AddPostModal`, `SandboxTools`, and `SongSearchInput` with `{ ssr: false }`.

#### B. Study Hub (`components/study-hub.tsx`)
- **Current State:** Contains embed parsing logic (`getEmbeddableUrl`), custom Markdown parser (`parseObsidianMarkdown`), study materials grid, class documents section, material submission modal, and full-screen iframe overlay.
- **Candidates for Extraction:**
  1. `components/study-hub/embed-viewer-modal.tsx`: Fullscreen iframe overlay previewing Google Drive, YouTube, Canva, Quizlet, and PDFs.
  2. `components/study-hub/obsidian-markdown-viewer.tsx`: Obsidian-style Markdown rendering engine.
  3. `components/study-hub/add-study-material-modal.tsx`: Study material submission form modal.
  4. `components/study-hub/class-documents-section.tsx`: Class notes and PDF document list with creation modal.
  5. `components/study-hub/study-material-card.tsx`: Individual material card item.
- **Heavy Client Dynamic Imports:**
  - Apply `next/dynamic` for `EmbedViewerModal`, `ObsidianMarkdownViewer`, and `AddStudyMaterialModal`.

#### C. Tasks Section (`components/tasks-section.tsx`)
- **Current State:** Contains task type/priority filters, due status date calculations (`getDueStatus`), task detail modal, task edit/create form, and background photo picker.
- **Candidates for Extraction:**
  1. `components/tasks-section/task-card.tsx`: Task item card with priority color themes and due status badge.
  2. `components/tasks-section/task-form-modal.tsx`: Task creation and editing modal.
  3. `components/tasks-section/background-photo-picker.tsx`: Preset photo selector for custom card headers.
  4. `components/tasks-section/task-filter-header.tsx`: Filter tabs, search bar, and view switches.
- **Heavy Client Dynamic Imports:**
  - Apply `next/dynamic` for `TaskFormModal` and `BackgroundPhotoPicker`.

---

## 4. R1 Inspection: Digital Proof of Payment Flow

### Current Payment Handling
- Payments are tracked per student and per week in `public.payments` (`student_id`, `week_number`, `status: 'paid'`).
- Currently, officers manually update student payment status using checkboxes in `OfficerPaymentList` (`components/officer-payment-list.tsx`), which triggers `togglePaymentStatus` Server Action (`app/officer-dashboard/actions.ts`).
- There is currently **no automated student upload** or **digital proof of payment receipt portal**.

### Recommended R1 Implementation Steps

#### 1. Database Migration (`sql/payment_receipts.sql`)
Create `public.payment_receipts` table and set up RLS policies:
```sql
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
  receipt_url TEXT NOT NULL,
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT
);

ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- Select: Students can view their own receipts; officers/moderators can view all receipts
CREATE POLICY "payment_receipts: select"
  ON public.payment_receipts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert: Any student can submit a pending receipt
CREATE POLICY "payment_receipts: insert"
  ON public.payment_receipts FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- Update/Delete: Only officers and moderators can update or delete
CREATE POLICY "payment_receipts: officer update"
  ON public.payment_receipts FOR UPDATE
  TO authenticated
  USING (is_officer_or_moderator())
  WITH CHECK (is_officer_or_moderator());
```

#### 2. Storage Setup
- Create Supabase storage bucket `receipts` for receipt images / PDFs.

#### 3. Server Actions (`app/officer-dashboard/actions.ts`)
- `submitPaymentReceiptAction(studentId, weekNumber, receiptUrl, referenceNumber, amount)`
- `approvePaymentReceiptAction(receiptId)`: updates receipt status to `'approved'`, executes payment upsert into `public.payments`, and logs action to `public.audit_logs`.
- `rejectPaymentReceiptAction(receiptId, rejectionReason)`: updates receipt status to `'rejected'` with reason and logs to `public.audit_logs`.

#### 4. UI Components
- **Student View:** Add "Upload Receipt" button/modal in `StudentPaymentList` (`components/student-payment-list.tsx`).
- **Officer View:** Add "Receipt Approvals" sub-tab in `OfficerPaymentList` (`components/officer-payment-list.tsx`) or `OfficerTabsContainer` (`components/officer-tabs-container.tsx`), allowing officers to view uploaded proof photos, verify reference numbers, and approve or reject submissions.

---

## 5. R2 Inspection: Financial Audit Reports (CSV & PDF)

### Current Reporting State
- Active calculations exist inside container components:
  - Total Contributions: `payments.filter(p => p.status === 'paid').length * 5`
  - Total Expenses: `expenses.reduce((sum, item) => sum + Number(item.amount), 0)`
  - Net Treasury Balance: `totalContributions - totalExpenses`
- Currently, **no export functionality** (CSV or PDF) exists.

### Recommended R2 Implementation Steps

#### 1. CSV Report Generator Utility (`lib/csv-exporter.ts`)
Create export utility functions that generate formatted CSV blobs:
- `exportSummaryCSV(students, payments, expenses, weeks)`
  - Outputs 3 distinct sections: Summary Metrics, Itemized Expense Records, Student Payment Matrix.

#### 2. Formatted PDF Audit Report (`lib/pdf-exporter.ts` or Print Component)
- Create `components/financial-audit-report-modal.tsx` or print view.
- Provides a clean print layout formatted with Tailwind print utilities (`@media print` / `print:block`):
  - **Header:** Section Title, Date of Generation, Generated By (Officer Email).
  - **Executive Summary:** Total Contributions Collected, Total Expenses Paid, Remaining Fund Balance, Overall Collection Percentage.
  - **Itemized Expenses Table:** Date, Description, Amount (₱), Recorded By Officer.
  - **Student Matrix Table:** Student Seat #, Name, Paid Weeks Count, Outstanding Balance.
  - **Audit Sign-off Block:** Verification signature placeholder lines for Class Treasurer & Auditor.

#### 3. UI Integration
- Add "Export Report" button with dropdown options ("Export CSV", "Export PDF Audit Report") to `BalanceCard` (`components/balance-card.tsx`) and `OfficerTabsContainer` header (`components/officer-tabs-container.tsx`).

---

## 6. Summary of Actionable Implementation Milestones

| Requirement | Objective | Primary Files to Touch | Key Deliverables |
|---|---|---|---|
| **R3** | Component Modularization & Dynamic Imports | `components/freedom-wall.tsx`, `components/study-hub.tsx`, `components/tasks-section.tsx` | Split 3 large files into sub-components, add `next/dynamic` imports for heavy modals. |
| **R1** | Digital Proof of Payment | `sql/payment_receipts.sql`, `app/officer-dashboard/actions.ts`, `components/student-payment-list.tsx`, `components/officer-payment-list.tsx` | `payment_receipts` table, upload modal, officer approval queue, automated payment toggle. |
| **R2** | Financial Audit Reports | `lib/csv-exporter.ts`, `components/financial-audit-report-modal.tsx`, `components/balance-card.tsx` | CSV generator utility, formatted PDF printable audit report, export buttons. |

