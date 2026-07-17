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

### ⚡ 4. Custom UX & Instant Feedback Loader (v1.3)
- **Sleek Warning Modals**: Replaced raw browser `confirm()` popups with styled warning cards (fade-in/scale-up) for log deletions and task deletions.
- **Top Rolling Loader**: A rolling progress indicator runs along the top of the tasks dashboard during database transactions.
- **Card Loading Backdrops**: Tasks being deleted or updated display clear `Deleting...` or `Updating...` overlays immediately, removing transaction lag confusion.
- **Sign-Out Feedback**: Sign-out buttons instantly render a spinning loader and display `Signing out...` on click.

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
