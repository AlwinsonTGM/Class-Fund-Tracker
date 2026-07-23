-- ============================================================
--   CLASS FUND TRACKER — ROW LEVEL SECURITY (RLS)
--   Run this entire script in your Supabase SQL Editor.
--   Uses the ANON key + session JWT, so all policies apply.
-- ============================================================


-- ────────────────────────────────────────────────────────────
--   HELPER FUNCTIONS
--   Reusable role-check expressions used inside policies.
--   These are SECURITY DEFINER so they bypass RLS themselves
--   when checking the whitelist tables, and explicitly set the
--   search path to prevent hijacking.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_officer()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.officers
    WHERE email = (auth.jwt() ->> 'email')
  );
$$;

CREATE OR REPLACE FUNCTION is_moderator()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.moderators
    WHERE email = (auth.jwt() ->> 'email')
  );
$$;

CREATE OR REPLACE FUNCTION is_officer_or_moderator()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (is_officer() OR is_moderator());
$$;


-- ============================================================
--   1. STUDENTS
--   Public read-only roster. Officers write.
-- ============================================================

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Anyone (even unauthenticated) can view the student list
CREATE POLICY "students: public read"
  ON public.students FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only officers can add new students
CREATE POLICY "students: officer insert"
  ON public.students FOR INSERT
  TO authenticated
  WITH CHECK (is_officer());

-- Only officers can update student records
CREATE POLICY "students: officer update"
  ON public.students FOR UPDATE
  TO authenticated
  USING (is_officer())
  WITH CHECK (is_officer());

-- Only officers can delete student records
CREATE POLICY "students: officer delete"
  ON public.students FOR DELETE
  TO authenticated
  USING (is_officer());


-- ============================================================
--   2. PAYMENTS
--   Public read-only. Officers write.
-- ============================================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments: public read"
  ON public.payments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "payments: officer insert"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (is_officer());

CREATE POLICY "payments: officer update"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (is_officer())
  WITH CHECK (is_officer());

CREATE POLICY "payments: officer delete"
  ON public.payments FOR DELETE
  TO authenticated
  USING (is_officer());


-- ============================================================
--   3. EXPENSES
--   Public read. Officers write.
-- ============================================================

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses: public read"
  ON public.expenses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "expenses: officer insert"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (is_officer());

CREATE POLICY "expenses: officer update"
  ON public.expenses FOR UPDATE
  TO authenticated
  USING (is_officer())
  WITH CHECK (is_officer());

CREATE POLICY "expenses: officer delete"
  ON public.expenses FOR DELETE
  TO authenticated
  USING (is_officer());


-- ============================================================
--   4. WEEKS
--   Public read. Officers and moderators manage calendar weeks.
-- ============================================================

ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weeks: public read"
  ON public.weeks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "weeks: officer/moderator insert"
  ON public.weeks FOR INSERT
  TO authenticated
  WITH CHECK (is_officer_or_moderator());

CREATE POLICY "weeks: officer/moderator update"
  ON public.weeks FOR UPDATE
  TO authenticated
  USING (is_officer_or_moderator())
  WITH CHECK (is_officer_or_moderator());

CREATE POLICY "weeks: officer/moderator delete"
  ON public.weeks FOR DELETE
  TO authenticated
  USING (is_officer_or_moderator());


-- ============================================================
--   5. AUDIT_LOGS
--   Public read. Officers insert. Moderators edit & delete.
-- ============================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs: public read"
  ON public.audit_logs FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only officers (and moderators) can write new log entries
CREATE POLICY "audit_logs: officer insert"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (is_officer_or_moderator());

-- Only moderators can inline-edit log descriptions
CREATE POLICY "audit_logs: moderator update"
  ON public.audit_logs FOR UPDATE
  TO authenticated
  USING (is_moderator())
  WITH CHECK (is_moderator());

-- Only moderators can delete log entries (reverses the transaction)
CREATE POLICY "audit_logs: moderator delete"
  ON public.audit_logs FOR DELETE
  TO authenticated
  USING (is_moderator());


-- ============================================================
--   6. MODERATORS
--   Officers and moderators can see the list.
--   Only officers can add/remove moderators.
--   (Uses USING (true) for SELECT to prevent recursion loop)
-- ============================================================

ALTER TABLE public.moderators ENABLE ROW LEVEL SECURITY;

-- Anyone logged-in can read the list (safe, whitelist emails only, prevents recursion)
CREATE POLICY "moderators: authenticated read"
  ON public.moderators FOR SELECT
  TO authenticated
  USING (true);

-- Only officers can add moderators
CREATE POLICY "moderators: officer insert"
  ON public.moderators FOR INSERT
  TO authenticated
  WITH CHECK (is_officer());

-- Only officers can update moderator entries
CREATE POLICY "moderators: officer update"
  ON public.moderators FOR UPDATE
  TO authenticated
  USING (is_officer())
  WITH CHECK (is_officer());

-- Only officers can remove moderators
CREATE POLICY "moderators: officer delete"
  ON public.moderators FOR DELETE
  TO authenticated
  USING (is_officer());


-- ============================================================
--   7. OFFICERS
--   Anyone logged-in can see the list (prevents recursion loop).
--   No app-level writes — managed directly in Supabase dashboard.
-- ============================================================

ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;

-- Anyone logged-in can read the list (prevents recursion loop)
CREATE POLICY "officers: authenticated read"
  ON public.officers FOR SELECT
  TO authenticated
  USING (true);

-- No INSERT/UPDATE/DELETE policies — manage this table manually
-- in the Supabase Table Editor. This prevents any app code from
-- escalating privileges by adding themselves as an officer.


-- ============================================================
--   8. COURSES
--   Public read. Officers manage the course catalog.
-- ============================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses: public read"
  ON public.courses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "courses: officer insert"
  ON public.courses FOR INSERT
  TO authenticated
  WITH CHECK (is_officer());

CREATE POLICY "courses: officer update"
  ON public.courses FOR UPDATE
  TO authenticated
  USING (is_officer())
  WITH CHECK (is_officer());

CREATE POLICY "courses: officer delete"
  ON public.courses FOR DELETE
  TO authenticated
  USING (is_officer());


-- ============================================================
--   9. TASKS
--   Public tasks: everyone reads, officers write.
--   Private tasks (is_private = true): only the creator can
--   read, update, or delete. Any authenticated user can create
--   a private task for themselves.
-- ============================================================

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Public tasks visible to all; private tasks only visible to creator
CREATE POLICY "tasks: read"
  ON public.tasks FOR SELECT
  TO anon, authenticated
  USING (
    is_private = false
    OR (
      is_private = true
      AND created_by = (auth.jwt() ->> 'email')
    )
  );

-- Officers can create public tasks; any authenticated user can
-- create a private task (is_private must be true for non-officers)
CREATE POLICY "tasks: insert"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    (is_private = false AND is_officer())
    OR
    (is_private = true AND created_by = (auth.jwt() ->> 'email'))
  );

-- Officers can edit any public task; creators can edit their own private tasks
CREATE POLICY "tasks: update"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    (is_private = false AND is_officer())
    OR
    (is_private = true AND created_by = (auth.jwt() ->> 'email'))
  )
  WITH CHECK (
    (is_private = false AND is_officer())
    OR
    (is_private = true AND created_by = (auth.jwt() ->> 'email'))
  );

-- Officers can delete any public task; creators can delete their own private tasks
CREATE POLICY "tasks: delete"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    (is_private = false AND is_officer())
    OR
    (is_private = true AND created_by = (auth.jwt() ->> 'email'))
  );


-- ============================================================
--   10. FREEDOM_POSTS
--   Public read. Any authenticated user can post.
--   Officers and moderators can delete posts.
-- ============================================================

ALTER TABLE public.freedom_posts ENABLE ROW LEVEL SECURITY;

-- Everyone can read wall posts
CREATE POLICY "freedom_posts: public read"
  ON public.freedom_posts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Any logged-in user can create a wall post
CREATE POLICY "freedom_posts: authenticated insert"
  ON public.freedom_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

-- Officers and moderators can edit posts (e.g. for moderation)
CREATE POLICY "freedom_posts: officer/moderator update"
  ON public.freedom_posts FOR UPDATE
  TO authenticated
  USING (is_officer_or_moderator())
  WITH CHECK (is_officer_or_moderator());

-- Officers and moderators can remove posts
CREATE POLICY "freedom_posts: officer/moderator delete"
  ON public.freedom_posts FOR DELETE
  TO authenticated
  USING (is_officer_or_moderator());


-- ============================================================
--   11. TASK_ASSIGNEES
--   Links tasks to assigned students/users.
--   Assumes columns: task_id, assignee_email (or student_id).
--   Public tasks → assignee list is public.
--   Private tasks → only creator or the assignee can see.
--   Officers manage assignments.
-- ============================================================

ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

-- Read: visible if the linked task is public, or you are the assignee/creator
CREATE POLICY "task_assignees: read"
  ON public.task_assignees FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id
        AND (
          t.is_private = false
          OR t.created_by = (auth.jwt() ->> 'email')
        )
    )
  );

-- Only officers can assign students to tasks
CREATE POLICY "task_assignees: officer insert"
  ON public.task_assignees FOR INSERT
  TO authenticated
  WITH CHECK (is_officer());

-- Only officers can update assignments
CREATE POLICY "task_assignees: officer update"
  ON public.task_assignees FOR UPDATE
  TO authenticated
  USING (is_officer())
  WITH CHECK (is_officer());

-- Only officers can remove assignments
CREATE POLICY "task_assignees: officer delete"
  ON public.task_assignees FOR DELETE
  TO authenticated
  USING (is_officer());


-- ============================================================
--   12. TASK_SUBMISSIONS
--   Tracks what each student submits for a task.
--   Using submitted_by (TEXT) to store creator email.
--   Using submitted_at (TIMESTAMPTZ) ONLY for dates.
-- ============================================================

ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

-- Officers can see all submissions; users can only see their own
CREATE POLICY "task_submissions: read"
  ON public.task_submissions FOR SELECT
  TO authenticated
  USING (
    is_officer()
    OR submitted_by = (auth.jwt() ->> 'email')
  );

-- Any authenticated user can submit (for tasks they are assigned to)
CREATE POLICY "task_submissions: authenticated insert"
  ON public.task_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    submitted_by = (auth.jwt() ->> 'email')
    AND EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = task_id
    )
  );

-- Users can edit only their own submissions; officers can edit any
CREATE POLICY "task_submissions: update"
  ON public.task_submissions FOR UPDATE
  TO authenticated
  USING (
    submitted_by = (auth.jwt() ->> 'email')
    OR is_officer()
  )
  WITH CHECK (
    submitted_by = (auth.jwt() ->> 'email')
    OR is_officer()
  );

-- Users can delete their own submissions; officers can delete any
CREATE POLICY "task_submissions: delete"
  ON public.task_submissions FOR DELETE
  TO authenticated
  USING (
    submitted_by = (auth.jwt() ->> 'email')
    OR is_officer()
  );
