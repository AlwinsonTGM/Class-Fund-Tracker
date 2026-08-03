# Class Fund Tracker (Transparency Portal)

A modern, responsive, and secure web application designed to track class fund contributions, tasks, and notes with ultimate transparency. Built with Next.js, Tailwind CSS v4, and Supabase.

---

## 🚀 Key Features

### 🔒 1. Google OAuth & Secure Account Whitelisting
- **Unified Login**: Anyone can log in with their Google account.
- **Role Isolation**: Only accounts registered in the `officers` and `moderators` tables are granted admin capabilities.
- **Student View**: Non-officer students are limited to the public dashboard, checkbooks, and private tasks.

### 🎯 2. Unified Task Dashboard & Personal Tasks (v1.3)
- **Course & Task Badges**: Link tasks to specific courses with priority indicator borders (Urgent, High, Medium, Low).
- **Interactive Form Preview**: A live replica task card renders in real time next to the input forms during creation.
- **Custom Background Photos**: Pick from 6 preselected background covers or upload a custom image (restricted to `< 1MB` to save space). High-contrast overrides and dark linear overlays ensure legibility.
- **Personal Tasks**: Standard students can create private tasks. The visibility selector is locked to **Private** for non-officers.
- **Ownership Security**: Edit, delete, and toggle actions check if `created_by` matches the logged-in user, keeping private tasks completely secure.

### 🎨 3. Design Polish, Accessibility & Keyboard Navigation (v1.34)
- **Scrubbed AI-Slop & Vibe-Coding Giveaways**: Removed artificial `border-l-4` side borders and upgraded bouncy spring curves to smooth exponential deceleration curves (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Unread Patch Notes Indicator**: Converted the auto-opening patch notes modal into an unread notification dot badge on the header trigger button.
- **URL & Keyboard Navigation Sync**: Active tabs sync to URL search parameters (`?tab=...`) and support instant numeric keyboard shortcuts (`1`-`5`).
- **Accessibility Compliance**: Removed mobile viewport zoom restrictions (`userScalable`) to meet WCAG standards, sanitized em-dashes, and purged unused font imports.

### 🚧 4. Freedom Wall Temporary Rework & Maintenance Screen (v1.33)
- **Temporary Rework Notice**: Restricted public and officer access to Freedom Wall posts and note editor, replacing the tab with a modern maintenance & rework screen.
- **Personal Apology & Context**: Displays a personal note (*"I'm sorry, I didn't mean to..."*) and a transparent roadmap of ongoing upgrades for safer, cleaner, and better canvas physics & moderation.
- **Modular Subcomponent Architecture**: Added `components/freedom-wall/under-rework.tsx` while preserving full component structure and code optimization.


### 🔐 4. KLD-Restricted Public Sign-Up & Spam-Free Wall Reactions (v1.4)
- **School-Restricted Sign-Up**: Anyone with a `@kld.edu.ph` email domain can register, while others are strictly rejected.
- **Password Recovery & Verification**: Built a secure forgot password/reset link flow directing users to a custom password reset form.
- **Officer Dashboard Blocker**: Strict backend protection redirects non-whitelisted users away from `/officer-dashboard` to the homepage.
- **Anti-Spam & Authenticated Wall Reactions**: Users must be logged in to react, and clicking reactions toggles the count (prevents infinite spamming), highlighting active clicks.

### ⚡ 5. Custom UX & Instant Feedback Loader (v1.3)
- **Sleek Warning Modals**: Replaced raw browser `confirm()` popups with styled warning cards (fade-in/scale-up) for log deletions and task deletions.
- **Top Rolling Loader**: A rolling progress indicator runs along the top of the tasks dashboard during database transactions.
- **Card Loading Backdrops**: Tasks being deleted or updated display clear `Deleting...` or `Updating...` overlays immediately, removing transaction lag confusion.
- **Sign-Out Feedback**: Sign-out buttons instantly render a spinning loader and display `Signing out...` on click.

### 📚 6. Study Hub & Subject Accordion Explorer (v1.32)
- **Full-Width Subject Accordions**: Redesigned Study Hub layout to 100% full width, organizing reviewers under subject-based collapsible accordions that start closed by default.
- **Eye-Friendly Soft Color Coding**: Styled subject accordion headers with soft, comfortable pastel color themes (emerald, sky blue, violet, amber, teal, rose, indigo) for both light and dark mode.
- **Simplified Reviewer Cards & Submission Form**: Optimized reviewer cards by focusing on contributor info, module title editing, and clear file indicators (📄 PDF File / 🔗 Web Link), while streamlining the submission form.
- **Embedded PDF Viewer & Projection**: Approved PDF reviewers render directly inside the embedded projection viewer iframe with 1-click download capabilities.
- **Hardware-Accelerated Entrance Animations**: Smooth entrance animations with staggered subject accordion reveals and card scale-ins on expansion.

### ☁️ 7. Cloud Sync & Fluid Glass Navigation (v1.6)
- **Interactive Toast Notifications**: Instant sliding alert cards notify users of live transactions.
- **Cloud Song Attachments**: Stored centrally in Supabase for cross-device sync.
- **Liquid Glass Navigation Bar**: Refined bottom nav capsule into a rounded liquid glass pill with specular highlights.

### ⚡ 6. Officer Student Checklist Real-Time Sync, Animations & Mobile Toast (v1.26)
- **Mobile Floating Corner Balance Toast**: Mobile users get a floating corner balance window displaying total fund balance updates in real-time with counting animation and `+₱5.00` / `-₱5.00` delta badges when toggling payments.
- **Real-Time Animated Total Fund Balance**: Balance Card smoothly animates numeric transitions over 400ms (`requestAnimationFrame` ease-out cubic lerp counter) with glow pulse highlights and floating delta badges.
- **Instantaneous Checklist Toggles & Real-Time Sync**: Toggling payment status is instantaneous (0ms UI latency), supports rapid multi-student updates, and updates total fund balance in real-time across the portal.
- **Week Selection Persistence**: Preserved active week dropdown state so toggling a student's payment status in Week 2 no longer resets the view back to Week 1.
- **Non-Blocking Background Sync**: Replaced global UI locks with fine-grained per-item pending keys (`pendingKeys`) and smooth animated sync indicators.
- **Parallel Officer Verification**: Optimized server authentication checks to run database queries concurrently with `Promise.all`.

### 🏢 7. Classmate Management, Current Week Automation, Confetti Celebration & Layout Refinements (v1.27)
- **Full Classmate Management (Add, Edit, Delete)**: Added complete student CRUD capabilities with an Add Classmate toolbar button, Edit modal, and Moderator-only Delete classmate action with confirmation modals and detailed audit logging.
- **Auto-Select Week for Today**: Automatically detects and selects the active week corresponding to today's date so officers and students don't need to manually switch week dropdowns each session.
- **Celebratory Week Completion & Confetti**: When 100% of class fund contributions for a week are collected, falling confetti (`ConfettiCanvas`) and a Thank You pop-up modal trigger automatically, displaying a **"Week Completed — 100% Fund Collected"** badge and freezing the list from further edits.
- **Mobile Portal Tab Layout**: Reordered section elements on mobile screens (`< lg`) so the Officer Student Checklist sits directly below Total Balance.
- **Default Closed Containers**: Financial Audit & CSV Exports, Digital Approval Queue, Manage Class Weeks, and Recent Activity start neatly collapsed by default.
- **Financial Audit Report Week Sync**: Updated Outstanding Dues in the financial statement to dynamically calculate dues as of the current week instead of defaulting to Week 1.
- **Compact CSV Exports Layout**: Re-arranged CSV export buttons into a clean, horizontal flex/grid row to save vertical space on PC screens.



### 💳 8. Digital Receipts, Financial Audit Reports & Mobile Ergonomics Overhaul (v1.10)
- **Digital Proof of Payment Uploads**: Students can submit screenshot proof of payment (GCash/Maya receipts) with reference numbers when paying weekly dues.
- **Officer Receipt Approval Queue**: Whitelisted officers on `/officer-dashboard` receive a dedicated approval queue featuring receipt image previews, zoom modals, status filters, and 1-click Approve/Reject actions.
- **Exportable Financial Audit Reports**: 1-click RFC 4180-compliant CSV exports for collection matrices and expense logs, alongside printable PDF financial summary statements.
- **Mobile Responsiveness & Ergonomics**: Dynamic typography hierarchy, responsive line-heights, text wrapping, and compact container padding across 320px–480px viewports with zero horizontal scrolling.
- **Mobile Tab Scroll Reset & Fatigue Prevention**: Instant vertical scroll reset upon tab switching in bottom navigation and top tab bars, eliminating scroll overshoot across sections.
- **Sleek Button Sizing & Touch Ergonomics**: Refined button heights, icon controls, and filter chips for clean visual proportion while enforcing accessible touch targets.
- **Nav Bar Rapid Switch Fix**: Fixed horizontal container scroll race conditions when spamming navigation tabs, ensuring smooth instant tab transitions without tab bouncing.
- **Freedom Wall Hydration & Layout Fixes**: Resolved React 19 hydration mismatch error in `FreedomPostCard` and upgraded theme initializer in `app/layout.tsx` to Next.js `Script` (`beforeInteractive`).
- **Officer Dashboard Header Toolbar**: Reorganized header action buttons into clean toolbar flex groups, fixing orphaned button placement on mobile displays.
- **Component Refactoring & Dynamic Imports**: Decomposed monolithic components into sub-components under `components/` with `next/dynamic` lazy loading for optimized bundle sizes.

### 📱 11. Mobile Officer Ergonomics, Slide-Over Sidebar & Header Refactoring (v1.11)
- **Officer Sidebar Menu Drawer**: Added a slide-over navigation drawer providing single-tap access to officer tools, financial audit exports, expense recording, theme preferences, and sign out.
- **Spacious Dashboard Header**: Restored full unscrolled header layout with prominent left-aligned "Officer Dashboard" heading and portal subtitle.
- **Logical Toolbar Grouping**: Organized essential financial actions (Financial Audit Report & Record Expense) on the left side, and settings/extras (Patch Notes, Theme Toggle, Sidebar Drawer) on the right side.
- **Compact Mobile Logo Buttons**: Optimized Record Expense and Financial Audit Report buttons to sleek circular logo icon buttons on mobile screens with hold/hover tooltips.
- **Hysteresis Anti-Flicker Scroll**: Resolved sticky header scroll oscillation by implementing a hysteresis scroll threshold (> 45px enter, < 10px exit).
- **Sticky Bar Mobile Alignment**: Fixed scrolled sticky bar layout so the Officer Dashboard title and action icons remain aligned horizontally on a single row without truncation or layout shifts.
- **Streamlined Recent Activity Padding**: Reduced button heights and vertical whitespace across activity log items and load more actions.
- **Freedom Wall Cleanliness**: Removed local reaction palette UI while preserving 100% of post content, author details, song previews, and database models.
- **Future Mobile Optimizations Notice**: Prominently stated in release notes that the interface will further be optimized for mobile viewports across upcoming updates.

### ✨ 12. Natural Header Scroll & Mobile Dashboard Parity (v1.12)
- **Resolved Header Scroll Flickering**: Eliminated sticky header scroll oscillation on mobile by replacing unstable conditional component swapping with a single, stable header container.
- **Mobile & PC Dashboard Parity**: Standardized header scroll behavior across Officer Dashboard and Public Dashboard, ensuring a smooth, natural page scroll experience on all screen sizes.
- **Eliminated Sticky Viewport Obstruction**: Allowed full header to scroll naturally with page content on mobile, freeing up valuable screen space and preventing backdrop blur overlaps.
- **Removed Redundant Officer Menu**: Removed redundant slide-over officer sidebar menu, streamlining officer actions directly into the main header toolbar.

### 📄 13. Direct PDF Reviewer Submissions & Anti-Spam Queue Protection (v1.13)
- **Direct PDF File Uploads**: Students and officers can upload `.pdf` reviewer files (up to 3MB) directly from their local device without needing external Google Drive links.
- **Embedded PDF Viewer & 1-Click Downloads**: Approved PDF reviewers render directly inside the embedded projection viewer iframe and include a 1-click PDF download button.
- **Visual PDF File Badges**: Reviewer cards on the board and in the moderator queue feature prominent red `📄 PDF File` badges for quick identification.
- **Anti-Spam Queue Protection**: Enforced a strict maximum limit of 5 pending unapproved reviewer submissions to prevent submission queue flooding.
- **Automatic PDF Rejection Cleanup**: Rejecting or deleting a reviewer submission permanently purges the stored PDF file content from database storage.

### 📱 14. Mobile Swiping Glitch Fix & Clean Tab Transitions (v1.14)
- **Removed Mobile Left/Right Swiping**: Eliminated horizontal CSS scroll snap and scroll listener synchronization to stop layout flickering and glitches when swiping between tabs on mobile screens.
- **Clean Tab Switching**: Mobile and desktop tabs transition instantly via state switching with automatic window scroll reset to top.
- **Modal Close Button Alignment**: Adjusted patch notes modal header layout flex positioning to prevent the circular close button from overlapping the version badge.

### 🎬 15. Spontaneous Note Spawning & Tab Entrance Animations (v1.15)
- **Spontaneous Note Spawning**: Freedom Wall sticky notes spawn one-by-one with a smooth spring zoom-out effect in both Scatter and Grid view modes.
- **Smooth Tab Entrance Animations**: Tasks Tab, Freedom Wall Tab, and Study Hub Tab share polished fade and slide-in entrance transitions across Public and Officer viewports.
- **Staggered Task Card Animations**: Task cards slide and fade in with cascading delays when switching to or filtering the Tasks board.
- **Patch Notes Modal Entrance**: Opening Patch Notes triggers a smooth backdrop blur fade, spring modal card zoom, and staggered version list entrance.

### ☁️ 7. Cloud Sync, Interactive Notifications & Fluid Glass Navigation (v1.6-beta)
- **Database-Backed Class Documents**: Class documents are stored centrally in Supabase, enabling real-time visibility across all devices.
- **Cloud Song Attachments**: iTunes song previews attached to Freedom Wall posts persist in the `song_data` JSONB database column.
- **Cross-Device Synchronization**: Eliminates "local-only" storage constraints so documents and music added on mobile display instantly on desktop.
- **Server Actions Integration**: Centralized `addPostAction` and `addClassDocumentAction` with explicit Supabase RLS security checks.
- **Interactive Toast Notifications**: Instant, sliding popup notifications beside the screen to inform you when changes happen.
- **Transaction Sound Effects**: Embedded clear, premium audio indicators triggering on transactions and user activities.
- **Freedom Wall Scatter Limits**: Optimized canvas performance by limiting floating note scatters to the 10 latest entries.
- **Symmetrical Glass Bubble Navigation**: Re-engineered mobile navigation into a perfectly aligned liquid glass bubble capsule that is completely static when idle and slides with zero-lag spring physics.
- **Officer Routing & Task Fixes**: Hardened officer authentication to force dashboard route loading and resolved task redirects causing "Page Not Found" screens.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions)
- **Styling**: Tailwind CSS v4 (CSS variables, obsidian-green dark modes)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
- **Language**: TypeScript

---

## 📂 Database Schema

Set up your Supabase database with the following table schemas:

### 1. `students`
```sql
create table students (
  id bigint primary key generated always as identity,
  seat_number integer unique not null,
  first_name text not null,
  last_name text,
  last_initial text,
  created_at timestamp with time zone default now() not null
);
```

### 2. `payments`
```sql
create table payments (
  id bigint primary key generated always as identity,
  student_id bigint references students(id) on delete cascade not null,
  week_number integer not null,
  status text default 'unpaid' not null,
  created_at timestamp with time zone default now() not null,
  unique (student_id, week_number)
);
```

### 3. `expenses`
```sql
create table expenses (
  id bigint primary key generated always as identity,
  description text not null,
  amount numeric not null,
  recorded_by text not null,
  created_at timestamp with time zone default now() not null
);
```

### 4. `weeks`
```sql
create table weeks (
  id bigint primary key generated always as identity,
  week_number integer unique not null,
  date_range text not null,
  status text default 'active' not null
);
```

### 5. `audit_logs`
```sql
create table audit_logs (
  id bigint primary key generated always as identity,
  officer_email text not null,
  action_description text not null,
  created_at timestamp with time zone default now() not null
);
```

### 6. `moderators`
```sql
create table moderators (
  id bigint primary key generated always as identity,
  email text unique not null,
  created_at timestamp with time zone default now() not null
);
```

### 7. `officers`
```sql
create table officers (
  id bigint primary key generated always as identity,
  email text unique not null,
  created_at timestamp with time zone default now() not null
);
```

### 8. `courses`
```sql
create table courses (
  id bigint primary key generated always as identity,
  code text unique not null,
  name text not null,
  created_at timestamp with time zone default now() not null
);
```

### 9. `tasks`
```sql
create table tasks (
  id bigint primary key generated always as identity,
  title text not null,
  description text,
  course_id bigint references courses(id) on delete set null,
  task_type text not null,
  participation_type text not null,
  group_size text default 'N/A',
  priority text default 'Medium',
  status text default 'Pending',
  due_date timestamp with time zone not null,
  background_image text,
  is_private boolean default false,
  created_by text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
```

### 10. `freedom_posts`
```sql
create table freedom_posts (
  id bigint primary key generated always as identity,
  content text not null,
  author_name text default 'Anonymous' not null,
  color text default 'bg-yellow-100' not null,
  song jsonb,
  song_data jsonb,
  created_at timestamp with time zone default now() not null
);
```

### 11. `study_materials`
```sql
create table study_materials (
  id bigint primary key generated always as identity,
  title text not null,
  description text,
  link text not null,
  category text default 'Quiz' not null,
  study_type text default 'lesson' not null,
  course_id bigint references courses(id) on delete set null,
  week_number integer,
  lesson_name text,
  task_name text,
  submitted_by text default 'Anonymous',
  approved boolean default false not null,
  created_at timestamp with time zone default now() not null
);
```

### 12. `class_documents`
```sql
create table class_documents (
  id bigint primary key generated always as identity,
  title text not null,
  document_type text default 'md' not null, -- 'md' or 'pdf'
  content text,
  link text,
  submitted_by text default 'Anonymous',
  created_at timestamp with time zone default now() not null
);
```

---

## ⚙️ Configuration & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/class-fund-tracker.git
   cd class-fund-tracker
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Local Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```
