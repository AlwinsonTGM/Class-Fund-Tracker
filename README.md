# Class Fund Tracker (Transparency Portal)

A modern, responsive, and secure web application designed to track class fund contributions and expenses with ultimate transparency. Built with Next.js, Tailwind CSS v4, and Supabase.

---

## 🚀 Key Features

- **Real-Time Treasury Metrics**: Instantly computes net balances today: `Net Balance = (Paid Payments * ₱5.00) - (Total Expenses)`.
- **Dynamic Weekly Checklists**:
  - **Public Dashboard**: A read-only search/filter list displaying student payment checkmarks.
  - **Officer Dashboard**: A protected portal where officers can toggle payments with **optimistic UI updates** for an instant checking feel.
- **Data Privacy Protection**: Reconstructs and formats names as **First Name + Last Initial** (e.g. *Jimuel Bunagan A.*) on public routes, while showing **Full Roster Names** (e.g. *Abadiano, Jimuel Bunagan*) to verified officers.
- **Pre-Registered Auth Portal**: Integrated Supabase Auth supporting Email/Password and **Google OAuth**. Includes redirect controls to terminate/logout users not pre-registered in your organization.
- **Database-Driven Calendar Weeks**: Supports adding, editing, or deleting week ranges (Monday–Wednesday) inline. Offers suspension/health break flags to notify users when contributions are paused.
- **Audit Logs & Recent Activity**: Tracks all actions logged by officers. Includes pagination ("Show More") to view full histories.
- **Moderator Controls**:
  - Allows verified moderators to inline-edit log descriptions to fix typos.
  - Deleting an activity log entry **automatically reverses** the corresponding database transaction (deleting the linked payment check or expense record and updating balances in real-time).
- **Persistent Dark Mode**: Premium dark mode styling using a customized obsidian-green forest palette, with flash-free head-hydration and persistence in `localStorage`.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Styling**: Tailwind CSS v4 (PostCSS config, CSS-driven theme variables)
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth)
- **Language**: TypeScript

---

## 📂 Database Schema

Make sure your Supabase PostgreSQL database is set up with the following tables:

### 1. `students`
Tracks student seat numbers and roster details.
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
Tracks payments collected for each student and week.
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
Stores the recorded classroom expenditures.
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
Tracks week configurations, dates, and breaks.
```sql
create table weeks (
  id bigint primary key generated always as identity,
  week_number integer unique not null,
  date_range text not null,
  status text default 'active' not null
);
```

### 5. `audit_logs`
Stores the log history for transparency audits.
```sql
create table audit_logs (
  id bigint primary key generated always as identity,
  officer_email text not null,
  action_description text not null,
  created_at timestamp with time zone default now() not null
);
```

### 6. `moderators`
Lists accounts authorized to modify calendar weeks or delete/edit activity logs.
```sql
create table moderators (
  id bigint primary key generated always as identity,
  email text unique not null,
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
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```
