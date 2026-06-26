-- ============================================================
-- mbuku LMS — Progress Recalculation
-- Migration 003: Auto-update enrollment progress on lesson completion
-- ============================================================

-- Function to recalculate enrollment progress_percent
-- Triggered whenever lesson_progress is inserted or updated
create or replace function public.recalculate_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course_id uuid;
  v_total_lessons int;
  v_completed_lessons int;
  v_new_progress numeric;
begin
  -- Find the course_id for this lesson
  select c.id into v_course_id
  from lessons l
  join modules m on m.id = l.module_id
  join courses c on c.id = m.course_id
  where l.id = new.lesson_id;

  if v_course_id is null then
    return new;
  end if;

  -- Count total lessons in the course
  select count(*) into v_total_lessons
  from lessons l
  join modules m on m.id = l.module_id
  where m.course_id = v_course_id;

  if v_total_lessons = 0 then
    return new;
  end if;

  -- Count completed lessons for this user in this course
  select count(*) into v_completed_lessons
  from lesson_progress lp
  join lessons l on l.id = lp.lesson_id
  join modules m on m.id = l.module_id
  where m.course_id = v_course_id
    and lp.user_id = new.user_id
    and lp.completed = true;

  -- Calculate new progress
  v_new_progress := round((v_completed_lessons::numeric / v_total_lessons::numeric) * 100, 2);

  -- Update the enrollment record
  update enrollments
  set progress_percent = v_new_progress,
      status = case
        when v_new_progress >= 100 then 'completed'::enrollment_status
        else status
      end
  where user_id = new.user_id
    and course_id = v_course_id;

  return new;
end;
$$;

-- Trigger on lesson_progress insert or update
create trigger on_lesson_progress_change
  after insert or update on lesson_progress
  for each row execute function public.recalculate_progress();
