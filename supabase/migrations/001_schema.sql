-- ============================================================
-- mbuku LMS — Full Database Schema
-- Migration 001: Tables, Enums, Views, RLS Policies
-- ============================================================

-- ===== ENUMS =====
create type user_role as enum ('admin', 'instructor', 'student');
create type lesson_content_type as enum ('video', 'text', 'quiz');
create type enrollment_status as enum ('active', 'completed', 'dropped');
create type ai_message_role as enum ('user', 'assistant');

-- ===== ROLES & USERS =====
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'student',
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- ===== COURSES =====
create table courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  category text,             -- e.g. 'Cloud', 'Frontend Dev', 'Mobile Dev'
  level text,                -- 'Beginner' | 'Intermediate' | 'Advanced'
  price_kes numeric default 0,    -- 0 = free course
  thumbnail_url text,
  is_published boolean default false,
  instructor_id uuid references profiles(id),
  created_at timestamptz default now()
);

create table modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  position int not null
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  title text not null,
  content_type lesson_content_type not null,
  content text,               -- markdown/text body
  video_url text,
  duration_minutes int,
  position int not null
);

-- ===== ENROLLMENT & PROGRESS =====
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  status enrollment_status default 'active',
  progress_percent numeric default 0,
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed boolean default false,
  completed_at timestamptz,
  time_spent_seconds int default 0,
  unique(user_id, lesson_id)
);

-- ===== QUIZZES =====
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  title text not null,
  passing_score numeric default 70
);

create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  question_text text not null,
  options jsonb not null,       -- ["A...","B...","C...","D..."]
  correct_answer text not null,
  points numeric default 1
);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  quiz_id uuid references quizzes(id) on delete cascade,
  score numeric,
  passed boolean,
  answers jsonb,
  attempted_at timestamptz default now()
);

-- ===== CERTIFICATES =====
create table certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  certificate_number text unique not null,    -- e.g. MBUKU-2026-000123
  verification_code text unique not null,     -- short random code for /verify/:code
  pdf_path text,                               -- storage path, never raw public URL
  issued_at timestamptz default now(),
  unique(user_id, course_id)
);

-- Public, non-PII view for the verification page
create view certificate_public_view as
  select c.certificate_number, c.verification_code, c.issued_at,
         co.title as course_title, p.full_name as learner_name
  from certificates c
  join courses co on co.id = c.course_id
  join profiles p on p.id = c.user_id;

-- Grant anon access to the public view for certificate verification
grant select on certificate_public_view to anon;

-- ===== AI TUTOR =====
create table ai_tutor_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id),
  lesson_id uuid references lessons(id),
  created_at timestamptz default now()
);

create table ai_tutor_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references ai_tutor_sessions(id) on delete cascade,
  role ai_message_role not null,
  content text not null,
  created_at timestamptz default now()
);

create table ai_tutor_usage (
  user_id uuid references profiles(id) on delete cascade,
  usage_date date default current_date,
  message_count int default 0,
  primary key (user_id, usage_date)
);

-- ===== PAYMENTS (Phase 8, schema ready) =====
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id),
  amount_kes numeric not null,
  intasend_invoice_id text,
  status text default 'pending',    -- pending | completed | failed
  created_at timestamptz default now()
);


-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- ----- profiles -----
alter table profiles enable row level security;

create policy "users read own profile or admin/instructor reads all"
  on profiles for select
  using (
    auth.uid() = id
    or (select role from profiles where id = auth.uid()) in ('admin', 'instructor')
  );

create policy "users update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Allow the auth trigger to insert profiles (service role)
create policy "service inserts profiles"
  on profiles for insert
  with check (true);

-- ----- courses -----
alter table courses enable row level security;

create policy "published courses are public"
  on courses for select
  using (is_published = true);

create policy "instructors and admins read all courses"
  on courses for select
  using (
    (select role from profiles where id = auth.uid()) in ('admin', 'instructor')
  );

create policy "instructors manage own courses"
  on courses for insert
  with check (
    instructor_id = auth.uid()
    or (select role from profiles where id = auth.uid()) = 'admin'
  );

create policy "instructors update own courses"
  on courses for update
  using (
    instructor_id = auth.uid()
    or (select role from profiles where id = auth.uid()) = 'admin'
  );

create policy "admins delete courses"
  on courses for delete
  using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- ----- modules -----
alter table modules enable row level security;

create policy "modules readable if course is accessible"
  on modules for select
  using (
    exists (
      select 1 from courses c
      where c.id = modules.course_id
      and (
        c.is_published = true
        or c.instructor_id = auth.uid()
        or (select role from profiles where id = auth.uid()) = 'admin'
      )
    )
  );

create policy "instructors manage modules of own courses"
  on modules for all
  using (
    exists (
      select 1 from courses c
      where c.id = modules.course_id
      and (
        c.instructor_id = auth.uid()
        or (select role from profiles where id = auth.uid()) = 'admin'
      )
    )
  );

-- ----- lessons -----
alter table lessons enable row level security;

create policy "lessons readable if course is accessible"
  on lessons for select
  using (
    exists (
      select 1 from modules m
      join courses c on c.id = m.course_id
      where m.id = lessons.module_id
      and (
        c.is_published = true
        or c.instructor_id = auth.uid()
        or (select role from profiles where id = auth.uid()) = 'admin'
      )
    )
  );

create policy "instructors manage lessons of own courses"
  on lessons for all
  using (
    exists (
      select 1 from modules m
      join courses c on c.id = m.course_id
      where m.id = lessons.module_id
      and (
        c.instructor_id = auth.uid()
        or (select role from profiles where id = auth.uid()) = 'admin'
      )
    )
  );

-- ----- enrollments -----
alter table enrollments enable row level security;

create policy "users see own enrollments"
  on enrollments for select
  using (
    user_id = auth.uid()
    or (select role from profiles where id = auth.uid()) in ('admin', 'instructor')
  );

create policy "users enroll themselves"
  on enrollments for insert
  with check (user_id = auth.uid());

create policy "system updates enrollments"
  on enrollments for update
  using (
    user_id = auth.uid()
    or (select role from profiles where id = auth.uid()) = 'admin'
  );

-- ----- lesson_progress -----
alter table lesson_progress enable row level security;

create policy "users manage own progress"
  on lesson_progress for all
  using (user_id = auth.uid());

-- ----- quizzes -----
alter table quizzes enable row level security;

create policy "quizzes readable if lesson is accessible"
  on quizzes for select
  using (
    exists (
      select 1 from lessons l
      join modules m on m.id = l.module_id
      join courses c on c.id = m.course_id
      where l.id = quizzes.lesson_id
      and (
        c.is_published = true
        or c.instructor_id = auth.uid()
        or (select role from profiles where id = auth.uid()) = 'admin'
      )
    )
  );

create policy "instructors manage quizzes of own courses"
  on quizzes for all
  using (
    exists (
      select 1 from lessons l
      join modules m on m.id = l.module_id
      join courses c on c.id = m.course_id
      where l.id = quizzes.lesson_id
      and (
        c.instructor_id = auth.uid()
        or (select role from profiles where id = auth.uid()) = 'admin'
      )
    )
  );

-- ----- quiz_questions -----
alter table quiz_questions enable row level security;

create policy "quiz questions readable if quiz is accessible"
  on quiz_questions for select
  using (
    exists (
      select 1 from quizzes q
      join lessons l on l.id = q.lesson_id
      join modules m on m.id = l.module_id
      join courses c on c.id = m.course_id
      where q.id = quiz_questions.quiz_id
      and (
        c.is_published = true
        or c.instructor_id = auth.uid()
        or (select role from profiles where id = auth.uid()) = 'admin'
      )
    )
  );

create policy "instructors manage quiz questions of own courses"
  on quiz_questions for all
  using (
    exists (
      select 1 from quizzes q
      join lessons l on l.id = q.lesson_id
      join modules m on m.id = l.module_id
      join courses c on c.id = m.course_id
      where q.id = quiz_questions.quiz_id
      and (
        c.instructor_id = auth.uid()
        or (select role from profiles where id = auth.uid()) = 'admin'
      )
    )
  );

-- ----- quiz_attempts -----
alter table quiz_attempts enable row level security;

create policy "users see own quiz attempts"
  on quiz_attempts for select
  using (user_id = auth.uid());

create policy "users insert own quiz attempts"
  on quiz_attempts for insert
  with check (user_id = auth.uid());

create policy "instructors see quiz attempts for own courses"
  on quiz_attempts for select
  using (
    exists (
      select 1 from quizzes q
      join lessons l on l.id = q.lesson_id
      join modules m on m.id = l.module_id
      join courses c on c.id = m.course_id
      where q.id = quiz_attempts.quiz_id
      and (
        c.instructor_id = auth.uid()
        or (select role from profiles where id = auth.uid()) = 'admin'
      )
    )
  );

-- ----- certificates -----
alter table certificates enable row level security;

create policy "users see own certificates"
  on certificates for select
  using (
    user_id = auth.uid()
    or (select role from profiles where id = auth.uid()) = 'admin'
  );

create policy "system inserts certificates"
  on certificates for insert
  with check (
    (select role from profiles where id = auth.uid()) = 'admin'
    or user_id = auth.uid()
  );

-- ----- ai_tutor_sessions -----
alter table ai_tutor_sessions enable row level security;

create policy "users access own tutor sessions"
  on ai_tutor_sessions for all
  using (user_id = auth.uid());

-- ----- ai_tutor_messages -----
alter table ai_tutor_messages enable row level security;

create policy "users access own tutor messages"
  on ai_tutor_messages for all
  using (
    session_id in (
      select id from ai_tutor_sessions where user_id = auth.uid()
    )
  );

-- ----- ai_tutor_usage -----
alter table ai_tutor_usage enable row level security;

create policy "users see own tutor usage"
  on ai_tutor_usage for select
  using (user_id = auth.uid());

create policy "users upsert own tutor usage"
  on ai_tutor_usage for insert
  with check (user_id = auth.uid());

create policy "users update own tutor usage"
  on ai_tutor_usage for update
  using (user_id = auth.uid());

-- ----- payments -----
alter table payments enable row level security;

create policy "users see own payments"
  on payments for select
  using (
    user_id = auth.uid()
    or (select role from profiles where id = auth.uid()) = 'admin'
  );

create policy "users create own payments"
  on payments for insert
  with check (user_id = auth.uid());

create policy "system updates payments"
  on payments for update
  using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );
