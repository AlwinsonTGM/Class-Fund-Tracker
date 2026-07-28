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

### 🎵 3. Freedom Wall with Music & Reactions (v1.2)
- **Sticky Notes**: Anonymous wall posts with customizable color pads.
- **iTunes Song Attachments**: Search any track and embed an iTunes 30-second preview player (complete with album art, play/pause controls, and interactive progress bars).
- **Emoji Reactions**: Discord-style reaction counters. Click existing reactions to increment them, or add any of the 24 curated emojis from the palette picker.

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

### ☁️ 7. Cloud Sync & Fluid Glass Navigation (v1.6)
- **Interactive Toast Notifications**: Instant sliding alert cards notify users of live transactions.
- **Database-Backed Class Documents & Song Attachments**: Stored centrally in Supabase for cross-device sync.
- **Liquid Glass Navigation Bar**: Refined bottom nav capsule into a rounded liquid glass pill with specular highlights.

### 🎮 8. Flappy Bird Arcade, Multi-Theme & Realtime Leaderboard (v1.8 - v1.16)
- **Flappy Bird Mini-Game**: Built with an HTML5 Canvas engine implementing original gravity, flap physics, and infinite parallax scrolling.
- **Multi-Theme Canvas Environments**: Features 4 distinct visual themes (Classic Farm, Cyberpunk Night, Desert Sunset, Deep Ocean) with custom sky gradients, environment silhouettes, glowing neon grid lines, and thematic pipe designs.
- **Automatic Theme Randomization**: Every new game round automatically picks a fresh visual theme, with a manual theme selector on the start menu.
- **Realtime Global Leaderboard (v1.16)**: Live synchronization streaming high scores in real time across Classic, Zen, and Multiverse modes with strict mode score isolation and mode-specific loading screens.
- **Mobile Touch Input Protection (v1.8)**: Prevents accidental restarts on touchscreens using input cooldowns (`gameOverTimeRef`) and strict event propagation blocks (`e.stopPropagation()`) on container overlays.
- **Leaderboard Table Reset (v1.8)**: Added a Clear Table server action and interactive modal reset button to wipe old score entries.
- **Game Over Mode Switching**: Switch seamlessly between Classic, Zen, and Multiverse modes after dying or return to the main menu directly on the Game Over screen.
- **Synthesized Retro Audio**: Web Audio API synthesized sound effects for flap, score chime, hit thud, and falling whistle drop death.
- **Online Sync vs. Offline Fallback**: Real-time status indicator showing database sync status.
- **Guest & User Handle Customization**: Authenticated users automatically save player handles, while guest players can customize their handle anytime for section rankings.

### 🎨 21. Multiverse of Sadness Canonical Design System & Typography Restoration (v1.24)
- **Original Design System Restoration**: Restored exact typography (`Special Elite` for titles, numbers, epitaphs & `Space Grotesk` for body, taglines, HUD labels, stats, keybindings).
- **HUD & Death Screen Stats**: Restored tears counter (`tears ×X`) under emotional damage, 4-stat death block (`emotional damage`, `tears shed`, `universes felt`, `best damage`), and flap count warning line.
- **Google Fonts & Canvas Text Rendering**: Loaded `Special Elite` and `Space Grotesk` via Google Fonts preconnect/imports and added `document.fonts.load` on mount for canvas `Special Elite` text rendering.
- **Ambient Dark Rain Background**: Restored dual-layer seamless ambient rain animations (`fallA` / `fallB` keyframes) and atmospheric vignette (`.atmo-vig`) on background.
- **Strict GEMINI.md Guidelines**: Updated `GEMINI.md` with comprehensive, strict design system rules to preserve canonical styling across future AI updates.

### 🚰 22. Multiverse of Sadness Gameplay Slowdown Removal & Pipe Generation Balancing (v1.25)
- **Impossible Pipe Generation Fixed**: Added a vertical delta constraint (`maxDelta = 110px`) between consecutive pipe gaps, eliminating physically unpassable pipe gap jumps.
- **Removed Gameplay Slowdown**: Removed unwanted slow-motion time scaling during near-miss popups while maintaining floating quote text, tear particles, and sound effects.
- **Balanced Spacing & Drifting**: Increased horizontal pipe clearance (171px gap) and capped drifting pipe amplitudes for smoother reaction time.
- **Long Goodbye Gap Limit**: Set a fair minimum pipe gap (`88px`) in shrinking gap universes so gameplay stays challenging yet completely beatable.

### ⚡ 23. Officer Student Checklist Real-Time Sync, Animations & Mobile Corner Toast (v1.26)
- **Mobile Floating Corner Balance Toast**: Mobile users get a floating corner balance window (`sm:hidden`, fixed at `bottom-20 right-3.5`) displaying total fund balance updates in real-time with counting animation and `+₱5.00` / `-₱5.00` delta badges when toggling payments.
- **Real-Time Animated Total Fund Balance**: Balance Card smoothly animates numeric transitions over 400ms (`requestAnimationFrame` ease-out cubic lerp counter) with glow pulse highlights and floating delta badges.
- **Instantaneous Checklist Toggles & Real-Time Sync**: Eliminated UI lag when marking student payments. Toggling payment status is instantaneous (0ms UI latency), supports rapid multi-student updates, and updates the total fund balance in real-time across the portal.
- **Week Selection Persistence**: Preserved active week dropdown state (`useRef` guarded) so toggling a student's payment status in Week 2 no longer resets the view back to Week 1 on server revalidation.
- **Non-Blocking Background Sync**: Replaced global UI locks with fine-grained per-item pending keys (`pendingKeys`) and smooth animated sync indicators (`Loader2`).
- **Parallel Officer Verification**: Optimized server authentication checks to run database queries (`moderators` and `officers`) concurrently with `Promise.all` and `.maybeSingle()`.

### 🏢 24. Classmate Management, Current Week Automation, Confetti Celebration & Layout Refinements (v1.27)
- **Full Classmate Management (Add, Edit, Delete)**: Added complete student CRUD capabilities with an Add Classmate toolbar button, Edit modal, and Moderator-only Delete classmate action with confirmation modals and detailed audit logging.
- **Auto-Select Week for Today**: Built `findCurrentWeekNumber(weeks)` date range parser that automatically detects and selects the active week corresponding to today's date so officers and students don't need to manually switch week dropdowns each session.
- **Celebratory Week Completion & Confetti**: When 100% of class fund contributions for a week are collected, falling confetti (`ConfettiCanvas`) and a Thank You pop-up modal trigger automatically (persisted via `localStorage`), displaying a **"Week Completed — 100% Fund Collected"** badge and freezing the list from further edits.
- **Mobile Portal Tab Layout**: Reordered section elements on mobile screens (`< lg`) so the Officer Student Checklist sits directly below Total Balance, followed by Approval Queue, Audit Exports, Manage Weeks, and Recent Activity, preserving the 2-column desktop layout.
- **Default Closed Containers**: Financial Audit & CSV Exports, Digital Approval Queue, Manage Class Weeks, and Recent Activity start neatly collapsed by default.
- **"Updated live" Text Stability**: Added `whitespace-nowrap shrink-0` to prevent "Updated live" text from flickering onto two lines when balance delta badges appear.
- **Financial Audit Report Week Sync**: Updated Outstanding Dues in the financial statement to dynamically calculate dues as of the current week ("As of Wk 2") instead of defaulting to Week 1.
- **Compact CSV Exports Layout**: Re-arranged CSV export buttons into a clean, horizontal flex/grid row to save vertical space on PC screens.



### 🖥️ 20. PC Desktop Layout Alignment & Dex Redesign (v1.23)
- **PC Desktop Side-by-Side Layout**: Fixed side panels (*Now Showing*, *Controls*, *Porting Notes*) so they align side-by-side with the 480x640 game canvas in a centered container on PC desktop views.
- **Multiverse Dex Redesign**: Overhauled the Multiverse Dex modal with `Special Elite` headers, `Space Grotesk` typography, dark rain background panels (`#0e1622` / `#111b29`), `#22344a` borders, and `#d9a441` amber highlights.
- **Header & Overlay Pill Consistency**: Standardized top header controls, modal category tabs, and death screen retry buttons to the original `.pill` / `.pill.amber` and `#again` amber glow design systems.

### 🎨 19. Multiverse of Sadness Original Design Restoration & Pill Button System (v1.22)
- **Original "Now Showing" Restoration**: Restored the 2-column grid layout (`grid-cols-[32px_1fr]`), monospace universe numbers (`.pnum`), active `"· now"` state indicator, panel footer notes, Controls, and Porting Notes sections.
- **Pill Button Design System**: Standardized all header buttons, navigation links, and modal filter tabs to the original `.pill` / `.pill.amber` uppercase tracking border design (`border border-[#22344a]` / `border border-[rgba(217,164,65,0.45)]`).
- **Classic Action Button Styling**: Applied the signature `#again` amber-bordered uppercase action button styling to the death screen retry button.
- **Strict Design Consistency Rule**: Added strict guidelines in `GEMINI.md` enforcing canonical HTML/CSS design preservation for all present and future Multiverse of Sadness components.

### 🌌 18. Multiverse of Sadness Expansion: 40 Universes, Dex, Fusions & Bans (v1.21)
- **35 New Universes**: Expanded the dimension set to 40 complete universes across 6 distinct flavors (*Physics that hurts*, *Weather of the soul*, *Fourth-wall*, *Cinema of sadness*, *Online/absurd*, and *Cursed*).
- **Rarity Tiers**: Categorized universes into Common (70%), Uncommon (25%), and Cursed (5%) weighted spawns with distinct announcement badges.
- **Multiverse Dex**: Interactive modal tracking progress ("X / 40 Witnessed"), displaying locked silhouettes, quotes, lore details, and discovery status.
- **Universe Fusion Mode (Score ≥ 30)**: Score ≥ 30 triggers simultaneous hybrid universe transitions combining 2 active universes at once (e.g. `NOIR × TAX SEASON`).
- **Avoid One Truth (Universe Ban)**: Players can select 1 universe to exclude per run directly from the Multiverse Dex.
- **Custom Visual Rendering Layers**: Added unique visual effects for Noir hat, VHS scanlines & timestamps, Silent Film intertitles, Memory vignette, Underwater bubbles, Autumn leaves, Snow, Fog, and Hologram pipes.

### 🏗️ 17. Multiverse of Sadness II Modular Codebase Refactoring (v1.20)
- **Modular Architecture**: Decoupled the monolithic 1,435-line `multiverse-game-standalone.tsx` file into clear single-responsibility modules under `components/multiverse-of-sadness/`.
- **Isolated Audio & Renderer Engines**: Extracted Web Audio API synthesizer manager (`multiverse-audio.ts`) and HTML5 2D Canvas rendering routines (`multiverse-renderer.ts`).
- **Extracted UI Subcomponents**: Isolated interface elements into dedicated files under `components/multiverse-of-sadness/ui/` (`Header`, `HUD`, `StartOverlay`, `DeadOverlay`, `UniverseCard`, and `SidePanel`).

### 📽️ 16. Multiverse of Sadness II Video Randomization Pool & 0-Lag GPU Acceleration (v1.19)
- **Fisher-Yates Shuffled Video Deck**: Implemented a non-repeating video queue pool for Multiverse of Sadness mode. When reaching Level/Score 6, videos are drawn randomly from an 18-video pool without repeating any video during the same session until all 18 videos have been shown.
- **0-Lag Hardware Accelerated Video Mode**: Offloaded video background playback from 60 FPS canvas `drawImage` readbacks to hardware-accelerated HTML5 `<video>` GPU compositor layers (`z-0`), eliminating main thread frame drops and GPU texture readback lag.
- **Cached Offscreen Context**: Optimized pixelated video downsampling by caching the offscreen 2D rendering context (`offscreenCtxRef`) to avoid context lookup allocations inside `requestAnimationFrame`.
- **Session Queue Reset**: Synchronized video queue resets on gameover and restart across both standalone (`/multiverse-of-sadness`) and embedded Flappy Bird modes.

### 🌧️ 15. Multiverse of Sadness II Standalone Experience & Custom Engine (v1.18)
- **Dedicated Standalone Route**: Accessible via direct URL navigation (`/multiverse-of-sadness`), completely isolated from the standard Flappy Bird game page.
- **Qwen Atmospheric Design**: Replicates Qwen’s visual aesthetics featuring dark radial page background, ambient cascading CSS rain simulation, Google Fonts (`Special Elite` & `Space Grotesk`), HUD header, unicard animation banners, glassmorphism panels (*Now Showing*, *Controls*, *Modding Notes*), and philosophical death epitaph overlays.
- **5 Dynamic Universe Shifts**: Environment shifts every 5 pipes (*The One Where It Rains*, *Monday.* gray desaturation, *The Upside-Down-ish* inverted gravity, *The Echo* ghost bird replay, and *Drama Universe* 44px letterboxing).
- **Echo Ghost & Near-Miss Slow-Mo**: Records previous run frame coordinates (`{ y, rot }`) to render a translucent ghost bird flying alongside the player, with near-miss time dilation (0.32x speed) on tight gaps.
- **Sob Physics & Apologetic Pipes**: Bird periodically cries with tear particle bursts and dips gravity, while pipes display floating apologies (`"sorry :("`, `"my bad..."`) and internal monologue thought bubbles.
- **Retro Pixelated Video Downsampling**: Dynamic 160×120 offscreen canvas matrix downsampling for a 16-bit retro music video aesthetic, paired with WebAudio synthesized rain noise, sighs, piano flap/score tones, and descending violin death sounds.
- **Modular Text & Music Config**: Centralized [`multiverse-config.ts`](file:///c:/Users/PC/Documents/Transparency/class-fund-tracker/components/multiverse-of-sadness/multiverse-config.ts) array registry allowing instant editing or addition of subtitles, lyrics, thought bubbles, apology quotes, and epitaphs.
- **Synchronized Main Game Physics**: Physics constants (`GRAV = 950`, `FLAPV = -320`, `MAXV = 520`) perfectly matched to main Flappy Bird jump weight and gravity.

### 💳 10. Digital Receipts, Financial Audit Reports & Mobile Ergonomics Overhaul (v1.10)
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
- **Logical Toolbar Grouping**: Organized essential financial actions (Financial Audit Report & Record Expense) on the left side, and settings/extras (Flappy Bird arcade game, Patch Notes, Theme Toggle, Sidebar Drawer) on the right side.
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
