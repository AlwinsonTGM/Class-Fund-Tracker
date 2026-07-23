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

### 🎮 8. Flappy Bird Arcade, Multi-Theme & Realtime Leaderboard (v1.8)
- **Flappy Bird Mini-Game**: Built with an HTML5 Canvas engine implementing original gravity, flap physics, and infinite parallax scrolling.
- **Multi-Theme Canvas Environments**: Features 4 distinct visual themes (Classic Farm, Cyberpunk Night, Desert Sunset, Deep Ocean) with custom sky gradients, environment silhouettes, glowing neon grid lines, and thematic pipe designs.
- **Automatic Theme Randomization**: Every new game round automatically picks a fresh visual theme, with a manual theme selector on the start menu.
- **Realtime Global Leaderboard (v1.8)**: Live synchronization streaming high scores in real time across all open sessions via Supabase Realtime postgres_changes.
- **Mobile Touch Input Protection (v1.8)**: Prevents accidental restarts on touchscreens using input cooldowns (`gameOverTimeRef`) and strict event propagation blocks (`e.stopPropagation()`) on container overlays.
- **Leaderboard Table Reset (v1.8)**: Added a Clear Table server action and interactive modal reset button to wipe old score entries.
- **Game Over Mode Switching**: Switch seamlessly between Classic and Zen modes after dying or return to the main menu directly on the Game Over screen.
- **Synthesized Retro Audio**: Web Audio API synthesized sound effects for flap, score chime, hit thud, and falling whistle drop death.
- **Online Sync vs. Offline Fallback**: Real-time status indicator showing database sync status.
- **Guest & User Handle Customization**: Authenticated users automatically save player handles, while guest players can customize their handle anytime for section rankings.

### 🌀 9. Multiverse of Sadness Mode & Dynamic Video Backgrounds (v1.9)
- **Multiverse of Sadness Mode**: High-octane Flappy Bird game mode featuring dynamic video background streaming and multi-world pipe skins.
- **Dynamic Video Crossfading**: Reaching 6 points (`score >= 6`) unlocks randomized background video edits from `/multiverse/` with unmuted audio and zero-gap 1.5s crossfade transitions.
- **Doggie Easter Egg Animations**: Periodic background pop-ups featuring Doggie GIFs from `/akosidogie/` with random Zoom In/Out or Fade In/Out keyframe motions.
- **Multi-World Randomized Pipes**: Each pipe pair spawns with a random world skin (Farm Green, Cyberpunk Neon, Desert Sunset, Deep Ocean, Gold, Cosmic Void, Sakura Pink, Rainbow Spectrum).
- **Death Video Pause & Reset**: Background videos automatically pause and reset upon player death for clean round restarts.
- **Dedicated Multiverse Leaderboard**: Full central database & local storage fallback leaderboard support under the Multiverse tab.



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
